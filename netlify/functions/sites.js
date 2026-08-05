const json=(statusCode,data)=>({statusCode,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
async function verify(event){
  const token=(event.headers.authorization||event.headers.Authorization||'').replace(/^Bearer\s+/i,'');
  if(!token) throw new Error('Unauthorized');
  const site=process.env.URL;
  const r=await fetch(`${site}/.netlify/identity/user`,{headers:{Authorization:`Bearer ${token}`}});
  if(!r.ok) throw new Error('Unauthorized');
  return r.json();
}
function config(){
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('Supabase environment variables are not configured.');
  return {url,key,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'}};
}
async function rest(path,opts={}){
  const c=config();
  const r=await fetch(c.url+'/rest/v1/'+path,{...opts,headers:{...c.headers,...opts.headers}});
  const t=await r.text();
  if(!r.ok) throw new Error(t||`Supabase request failed (${r.status})`);
  return t?JSON.parse(t):null;
}
const safeSlug=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function friendlyName(path){
  const clean=String(path||'').replace(/\.html?$/i,'');
  const parts=clean.split('/').filter(Boolean);
  let base=parts.pop()||'page';
  if(base.toLowerCase()==='index') base=parts.length?parts[parts.length-1]:'Home';
  return base.replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
async function scanGithubPages(repo,branch='main'){
  const token=process.env.GITHUB_TOKEN;
  if(!token) throw new Error('GitHub environment variables are not configured.');
  const r=await fetch(`https://api.github.com/repos/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','User-Agent':'SHE-Studio'}});
  const t=await r.text();
  if(!r.ok) throw new Error(`Could not scan GitHub repository (${r.status}): ${t.slice(0,240)}`);
  const data=JSON.parse(t);
  return (data.tree||[]).filter(x=>x.type==='blob'&&/\.html?$/i.test(x.path)&&!/(^|\/)(node_modules|\.git|dist|build|vendor)(\/|$)/i.test(x.path)).map(x=>({path:x.path,name:friendlyName(x.path)})).sort((a,b)=>a.path==='index.html'?-1:b.path==='index.html'?1:a.path.localeCompare(b.path));
}

exports.handler=async event=>{
  try{
    const user=await verify(event);
    const method=event.httpMethod;
    if(method==='GET'){
      const email=encodeURIComponent(String(user.email||'').toLowerCase());
      const memberships=await rest(`site_members?select=site_id,role&email=ilike.${email}`);
      const memberIds=(memberships||[]).map(x=>x.site_id);
      const created=await rest(`sites?select=*&created_by=eq.${encodeURIComponent(user.email||'')}&order=created_at.asc`);
      let memberSites=[];
      if(memberIds.length) memberSites=await rest(`sites?select=*&id=in.(${memberIds.join(',')})&order=created_at.asc`);
      const map=new Map([...(created||[]),...(memberSites||[])].map(s=>[s.id,s]));
      const roles=new Map((memberships||[]).map(m=>[m.site_id,m.role]));
      return json(200,{sites:[...map.values()].map(s=>({...s,role:roles.get(s.id)||'owner'}))});
    }
    const b=JSON.parse(event.body||'{}');
    const owned=async id=>{const rows=await rest(`sites?select=created_by&id=eq.${encodeURIComponent(id)}&limit=1`);if(!rows?.length)throw new Error('Site not found.');if(rows[0].created_by===user.email)return true;const m=await rest(`site_members?select=role&site_id=eq.${encodeURIComponent(id)}&email=ilike.${encodeURIComponent(String(user.email||'').toLowerCase())}&role=in.(owner,designer)&limit=1`);if(!m?.length)throw new Error('You do not have permission to manage this site.');return true};
    if(method==='POST'){
      if(!b.name||!b.github_repo) return json(400,{error:'Site name and GitHub repository are required.'});
      const repo=b.github_repo.trim(), branch=(b.github_branch||'main').trim();
      const detected=await scanGithubPages(repo,branch);
      const row={name:b.name.trim(),slug:safeSlug(b.slug||b.name),github_repo:repo,github_branch:branch,live_url:(b.live_url||'').trim()||null,pages:detected.length?detected:[{path:'index.html',name:'Home'}],created_by:user.email,updated_at:new Date().toISOString()};
      const rows=await rest('sites',{method:'POST',body:JSON.stringify(row)});
      await rest('site_members',{method:'POST',body:JSON.stringify({site_id:rows[0].id,email:String(user.email||'').toLowerCase(),role:'owner'})});
      return json(201,{site:rows[0]});
    }
    if(method==='PATCH'){
      if(!b.id) return json(400,{error:'Site id is required.'});
      await owned(b.id);
      const allowed={};
      for(const k of ['name','github_repo','github_branch','live_url']) if(k in b) allowed[k]=b[k];
      if(b.rescan||('github_repo' in b)||('github_branch' in b)){
        const current=await rest(`sites?select=github_repo,github_branch&id=eq.${encodeURIComponent(b.id)}&limit=1`);
        const repo=(b.github_repo||current?.[0]?.github_repo||'').trim();
        const branch=(b.github_branch||current?.[0]?.github_branch||'main').trim();
        allowed.pages=await scanGithubPages(repo,branch);
      } else if(Array.isArray(b.pages)) allowed.pages=b.pages;
      allowed.updated_at=new Date().toISOString();
      const rows=await rest(`sites?id=eq.${encodeURIComponent(b.id)}`,{method:'PATCH',body:JSON.stringify(allowed)});
      return json(200,{site:rows[0]});
    }
    if(method==='DELETE'){
      const id=event.queryStringParameters?.id;
      if(!id) return json(400,{error:'Site id is required.'});
      await owned(id);
      const rows=await rest(`sites?id=eq.${encodeURIComponent(id)}&created_by=eq.${encodeURIComponent(user.email||'')}`,{method:'DELETE'});
      return json(200,{deleted:Boolean(rows?.length)});
    }
    return json(405,{error:'Method not allowed'});
  }catch(e){return json(e.message==='Unauthorized'?401:500,{error:e.message});}
};
