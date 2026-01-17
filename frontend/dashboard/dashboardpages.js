//Create group option
const createGroupBtn = document.querySelector(".create-group-btn")
createGroupBtn.addEventListener("click",()=>{
  window.location.href="/frontend/dashboard/user/creategroup.html"
})
//Load userpage Groups
document.addEventListener("DOMContentLoaded",()=>{
  const groupContainer = document.querySelector(".leftTab")
  //individual group
  const div = document.createElement("div");
  groupContainer.append(div)
  div.classList.add("leftTab-Tab")
  
  groupContainer.append(div)

})