const json=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
async function verify(event){
  const token=(event.headers.authorization||event.headers.Authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Unauthorized');
  const r=await fetch(`${process.env.URL}/.netlify/identity/user`,{headers:{Authorization:`Bearer ${token}`}});
  if(!r.ok) throw new Error('Unauthorized');
  return r.json();
}
function friendlyName(path){
  const clean=String(path||'').replace(/\.html?$/i,'');
  const parts=clean.split('/').filter(Boolean);
  let base=parts.pop()||'page';
  if(base.toLowerCase()==='index') base=parts.length?parts[parts.length-1]:'Home';
  return base.replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
exports.handler=async event=>{
  try{
    await verify(event);
    const repo=event.queryStringParameters?.repo;
    const branch=event.queryStringParameters?.branch||'main';
    if(!repo) return json(400,{error:'GitHub repository is required.'});
    const token=process.env.GITHUB_TOKEN;
    if(!token) throw new Error('GitHub environment variables are not configured.');
    const r=await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'SHE-Studio'}});
    const t=await r.text();
    if(!r.ok) throw new Error(`Could not scan GitHub repository (${r.status}). Check repository name, branch, and token access.`);
    const data=JSON.parse(t);
    const pages=(data.tree||[]).filter(x=>x.type==='blob'&&/\.html?$/i.test(x.path)&&!/(^|\/)(node_modules|\.git|dist|build|vendor)(\/|$)/i.test(x.path)).map(x=>({path:x.path,name:friendlyName(x.path)})).sort((a,b)=>a.path==='index.html'?-1:b.path==='index.html'?1:a.path.localeCompare(b.path));
    return json(200,{pages,count:pages.length,truncated:Boolean(data.truncated)});
  }catch(e){return json(e.message==='Unauthorized'?401:500,{error:e.message});}
};
