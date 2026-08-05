const json=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
async function verify(event){
  const token=(event.headers.authorization||event.headers.Authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Unauthorized');
  const r=await fetch(`${process.env.URL}/.netlify/identity/user`,{headers:{Authorization:`Bearer ${token}`}});
  if(!r.ok) throw new Error('Unauthorized');
  return r.json();
}
function ghHeaders(){
  const token=process.env.GITHUB_TOKEN;
  if(!token) throw new Error('GitHub environment variables are not configured.');
  return {Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SHE-Studio'};
}
async function getFile(repo,path,branch){
  const r=await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(branch)}`,{headers:ghHeaders()});
  if(r.status===404) return null;
  const t=await r.text();
  if(!r.ok) throw new Error(`Could not inspect connector (${r.status}): ${t.slice(0,220)}`);
  return JSON.parse(t);
}
async function putFile(repo,path,branch,content,message){
  const existing=await getFile(repo,path,branch);
  const body={message,branch,content:Buffer.from(content,'utf8').toString('base64')};
  if(existing?.sha) body.sha=existing.sha;
  const r=await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{...ghHeaders(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  const t=await r.text();
  if(!r.ok) throw new Error(`Could not install connector file ${path} (${r.status}): ${t.slice(0,260)}`);
  return JSON.parse(t);
}
function filesFor({name,repo,branch,live_url}){
  const installedAt=new Date().toISOString();
  const config={schemaVersion:1,connectorVersion:'1.0.0',siteName:name||repo,repository:repo,branch:branch||'main',liveUrl:live_url||null,framework:'static-html',publishProvider:'github-netlify',installedAt};
  const manifest={name:'S.H.E. Studio Connector',version:'1.0.0',description:'Lightweight bridge metadata for managing this website from S.H.E. Studio.',config:'config.json',runtime:'connector.js',capabilities:['page-discovery','asset-discovery','visual-editing','github-publishing']};
  const script=`/* S.H.E. Studio Connector v1.0.0 */\n(function(){\n  const connector={version:'1.0.0',ready:true,site:${JSON.stringify(name||repo)},repository:${JSON.stringify(repo)},branch:${JSON.stringify(branch||'main')}};\n  window.SHE_STUDIO_CONNECTOR=connector;\n  window.addEventListener('message',function(event){\n    if(event.data&&event.data.type==='SHE_STUDIO_PING'){\n      event.source&&event.source.postMessage({type:'SHE_STUDIO_READY',connector:connector},'*');\n    }\n  });\n})();\n`;
  return {'she-studio/config.json':JSON.stringify(config,null,2)+'\n','she-studio/manifest.json':JSON.stringify(manifest,null,2)+'\n','she-studio/connector.js':script};
}
exports.handler=async event=>{
  try{
    await verify(event);
    const method=event.httpMethod;
    if(method==='GET'){
      const repo=event.queryStringParameters?.repo,branch=event.queryStringParameters?.branch||'main';
      if(!repo) return json(400,{error:'GitHub repository is required.'});
      const config=await getFile(repo,'she-studio/config.json',branch);
      return json(200,{installed:Boolean(config),path:'she-studio/config.json',sha:config?.sha||null});
    }
    if(method==='POST'){
      const b=JSON.parse(event.body||'{}');
      if(!b.repo) return json(400,{error:'GitHub repository is required.'});
      const branch=(b.branch||'main').trim();
      const files=filesFor({name:b.name,repo:b.repo.trim(),branch,live_url:b.live_url});
      const installed=[];
      for(const [path,content] of Object.entries(files)){
        await putFile(b.repo.trim(),path,branch,content,`Install S.H.E. Studio connector: ${path}`);
        installed.push(path);
      }
      return json(200,{installed:true,files:installed,version:'1.0.0',message:'Connector installed successfully. Netlify will deploy the repository update.'});
    }
    return json(405,{error:'Method not allowed'});
  }catch(e){return json(e.message==='Unauthorized'?401:500,{error:e.message});}
};
