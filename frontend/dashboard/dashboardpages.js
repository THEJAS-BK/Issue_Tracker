//Create group option
const createGroupBtn = document.querySelector(".create-group-btn")
createGroupBtn.addEventListener("click",()=>{
  window.location.href="/frontend/dashboard/user/creategroup.html"
})
//Load userpage Groups
document.addEventListener("DOMContentLoaded",()=>{
  const groupContainer = document.querySelector(".leftTab")
  //individual group
  //Parent tab
  const parent = document.createElement("div");
  groupContainer.append(parent)
  parent.classList.add("leftTab-Tab")
  groupContainer.append(parent)
  //! parent left contents
  const parentLeftContent = document.createElement("div")
  parentLeftContent.classList.add("leftTab-left")
  parent.append(parentLeftContent)
  //left Contents
  const img = document.createElement("img")
  img.classList.add("group-img")
  //creating attributes
  img.setAttribute("src","/frontend/assets/OIP.jpg")
  img.setAttribute("alt","Categories")
  //Appending
  const parentLeftContentCenterContent = document.createElement("div")
  parentLeftContentCenterContent.classList.add("leftTab-left-center")
  parentLeftContent.append(img,parentLeftContentCenterContent)
  //?parentLeftContentCenterContent Childern
  const groupCategory = document.createElement("h4")
  groupCategory.classList.add("group-category")
  const groupDescription = document.createElement("p")
  groupDescription.classList.add("group-description")
  const BadgesContainer = document.createElement("div")
  BadgesContainer.classList.add("badges")
  parentLeftContentCenterContent.append(groupCategory,groupDescription,BadgesContainer)
  //badge container children
  const openBadgeContainer = document.createElement("div")
  openBadgeContainer.classList.add("bg1")
  const solvedBadgeContainer = document.createElement("div")
  solvedBadgeContainer.classList.add("bg2")

  BadgesContainer.append(openBadgeContainer,solvedBadgeContainer)
  //actual badges 
  const openBadge = document.createElement("span")
  const closedBadge = document.createElement("span")
  openBadgeContainer.append(openBadge)
  solvedBadgeContainer.append(closedBadge)
  //!Parent Right contents
   const parentRightContent=document.createElement("p")
   parentRightContent.classList.add("status")
   parent.append(parentRightContent)

  //*********************************************//
  //fields to change
  /*
  images(bus,hostel,campus..)=> img
  Categories(bus issue,hostel issue etc)=> groupCategory
  Description(short idea on what we solve)=> groupDescription
  OpenIssueBadge(issues open) =>openBadge
  ClosedIssueBadge(issues closed)=>closedBadge
  status(Joined or requested)=>parentRightContent
  */
 groupCategory.innerText="Home test"
 groupDescription.innerText="home description"
  openBadge.innerText=`${2} Open`;
  closedBadge.innerText=`${6} solved`

})