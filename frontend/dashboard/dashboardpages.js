async function apiFetch(url,options={},retried=false){
  const res = await fetch(url,{
    ...options,
    credentials:"include"
  })
  if(res.status===401&&!retried){
    const refresh = await fetch("/refreshtoken",{
      method:"POST",
      credentials:"include"
    })
    if(!refresh.ok){
      window.location.href = "/fontend/auth/index.html"
      return;
    }
    return apiFetch(url,options,true)
  }
  return res;
}