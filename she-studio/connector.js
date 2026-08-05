/* S.H.E. Studio Connector v1.0.0 */
(function(){
  const connector={version:'1.0.0',ready:true,site:"S.H.E. Social",repository:"austinechi1/she_social_web",branch:"main"};
  window.SHE_STUDIO_CONNECTOR=connector;
  window.addEventListener('message',function(event){
    if(event.data&&event.data.type==='SHE_STUDIO_PING'){
      event.source&&event.source.postMessage({type:'SHE_STUDIO_READY',connector:connector},'*');
    }
  });
})();
