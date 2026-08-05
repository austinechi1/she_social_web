const allowedPages = new Set([
  "index.html",
  "SHE_Elevation_Day_Landing.html",
  "retreat/index.html",
  "retreat/apply.html",
  "retreat/thank-you.html"
]);

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  const user = context.clientContext && context.clientContext.user;
  if (!user) return { statusCode: 401, body: "Please sign in first." };

  try {
    const { path, content, message } = JSON.parse(event.body || "{}");
    if (!allowedPages.has(path)) return { statusCode: 400, body: "This page cannot be edited." };
    if (typeof content !== "string" || content.length < 100) return { statusCode: 400, body: "Invalid page content." };

    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || "main";
    if (!token || !repo) return { statusCode: 500, body: "GitHub environment variables are not configured." };

    const api = `https://api.github.com/repos/${repo}/contents/${path}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "SHE-Social-Admin"
    };

    const current = await fetch(`${api}?ref=${encodeURIComponent(branch)}`, { headers });
    if (!current.ok) throw new Error(`Could not read ${path} from GitHub (${current.status}).`);
    const currentFile = await current.json();

    const response = await fetch(api, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message || `Update ${path} from S.H.E. Social Admin`,
        content: Buffer.from(content, "utf8").toString("base64"),
        sha: currentFile.sha,
        branch
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "GitHub rejected the update.");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true, commit: result.commit && result.commit.sha }) };
  } catch (error) {
    return { statusCode: 500, body: error.message || "Unable to publish changes." };
  }
};
