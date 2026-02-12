import {apiFetch} from "../utils/helper.js";

//Create group option
const createGroupBtn = document.querySelector(".create-group-btn");
createGroupBtn.addEventListener("click", () => {
  window.location.href = "/frontend/dashboard/user/creategroup.html";
});
//Load userpage Groups
document.addEventListener("DOMContentLoaded", async () => {
  const res = await apiFetch("http://localhost:8080/groups",{
    method:"GET",
    headers:{"Content-Type":"application/json"}
  } )
  const data = await res.json();
  renderGroups(data.allGroups);
  renderIssues(data.issues);
});

function renderGroups(groups) {
  const groupContainer = document.querySelector(".space-holder");
  //individual group
  //Parent tab
  for (const group of groups) {
    const parent = document.createElement("div");
    parent.classList.add("leftTab-Tab");
    //creating a tag
    const anchorTag = document.createElement("a");
    anchorTag.setAttribute(
      "href",
      `/frontend/dashboard/user/groupInterface.html?id=${group._id}`,
    );
    anchorTag.append(parent);
    groupContainer.insertAdjacentElement("beforebegin", anchorTag);
    //! parent left contents
    const parentLeftContent = document.createElement("div");
    parentLeftContent.classList.add("leftTab-left");
    parent.append(parentLeftContent);
    //left Contents
    const img = document.createElement("img");
    img.classList.add("group-img");
    //creating attributes
    img.setAttribute("alt", "Categories");
    //Appending
    const parentLeftContentCenterContent = document.createElement("div");
    parentLeftContentCenterContent.classList.add("leftTab-left-center");
    parentLeftContent.append(img, parentLeftContentCenterContent);
    //?parentLeftContentCenterContent Childern
    const groupCategory = document.createElement("h4");
    groupCategory.classList.add("group-category");
    const groupDescription = document.createElement("p");
    groupDescription.classList.add("group-description");
    const BadgesContainer = document.createElement("div");
    BadgesContainer.classList.add("badges");
    parentLeftContentCenterContent.append(
      groupCategory,
      groupDescription,
      BadgesContainer,
    );
    //badge container children
    const openBadgeContainer = document.createElement("div");
    openBadgeContainer.classList.add("bg1");
    const solvedBadgeContainer = document.createElement("div");
    solvedBadgeContainer.classList.add("bg2");

    BadgesContainer.append(openBadgeContainer, solvedBadgeContainer);
    //actual badges
    const openBadge = document.createElement("span");
    const closedBadge = document.createElement("span");
    openBadgeContainer.append(openBadge);
    solvedBadgeContainer.append(closedBadge);
    //!Parent Right contents
    const parentRightContent = document.createElement("p");
    parentRightContent.classList.add("status");
    parent.append(parentRightContent);

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
    img.setAttribute("src", "/frontend/assets/OIP.jpg");
    groupCategory.innerText = group.groupname;
    groupDescription.innerText = group.description;
    openBadge.innerText = `${2} Open`;
    closedBadge.innerText = `${6} solved`;
    parentRightContent.innerText = "Joined";
  }
}
function renderIssues(issues) {
  const rightTabMain = document.querySelector(".space-holder-issues");
  if (!rightTabMain) return;
  // outer container
  for (const issue of issues) {
    const issueDiv = document.createElement("div");
    issueDiv.className = "issuemes";
    // title
    const h3 = document.createElement("h3");
    h3.textContent = issue.title;
    // description
    const p = document.createElement("p");
    p.textContent = issue.description;
    // badge
    const badge = document.createElement("div");
    badge.className = "badge-pending";
    badge.textContent = "Pending Approval";

    issueDiv.append(h3, p, badge);
    rightTabMain.insertAdjacentElement("beforebegin", issueDiv);
  }
}
//close search group
const closeJoinGroup = document.querySelector(".close-joingroup-btn");
console.log(closeJoinGroup)
closeJoinGroup.addEventListener("click", () => {
  console.log("working")
  document.getElementById("group-search").style.display = "none";
});
//open searchGroup 
document.getElementById("joinGroup").addEventListener("click", () => {
  document.getElementById("group-search").style.display="flex"
})