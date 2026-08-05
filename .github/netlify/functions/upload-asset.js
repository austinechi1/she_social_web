const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const user = context.clientContext && context.clientContext.user;
  if (!user) return { statusCode: 401, body: "Please sign in first." };
  try {
    const { filename, contentBase64, type } = JSON.parse(event.body || "{}");
    if (!allowedTypes.has(type)) return { statusCode: 400, body: "Unsupported image type." };
    if (!filename || !contentBase64) return { statusCode: 400, body: "Missing image data." };
    const safe = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    const path = `assets/uploads/${Date.now()}-${safe}`;
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token || !repo) return { statusCode: 500, body: "GitHub environment variables are not configured." };
    const api = `https://api.github.com/repos/${repo}/contents/${path}`;
    const response = await fetch(api, { method: "PUT", headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", "User-Agent": "SHE-Social-Admin" }, body: JSON.stringify({ message: `Upload ${safe} from S.H.E. Social Admin`, content: contentBase64, branch }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Image upload failed.");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, path: `/${path}` }) };
  } catch (error) { return { statusCode: 500, body: error.message || "Unable to upload image." }; }
};
