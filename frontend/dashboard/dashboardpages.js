async function apiFetch(url,options={},retired=false){
  const res = await fetch(url,{
    ...options,
    credentials:"include"
  })
  if(res.status===401&&!retired){
    const refresh = await fetch("http://localhost:8080/refreshtoken",{
      method:"POST",
      credentials:"include"
    })
    if(!refresh.ok){
      window.location.href = "/frontend/auth/index.html"
      return;
    }
    return apiFetch(url,options,true)
  }
  return res;
}
//Create group option
const createGroupBtn = document.querySelector(".create-group-btn")
createGroupBtn.addEventListener("click",()=>{
  window.location.href="/frontend/dashboard/user/creategroup.html"
})