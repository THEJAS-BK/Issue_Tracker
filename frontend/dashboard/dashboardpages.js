import { apiFetch } from "../utils/helper.js";

//Create group option
const createGroupBtn = document.querySelector(".create-group-btn");
createGroupBtn.addEventListener("click", () => {
  window.location.href = "/frontend/dashboard/user/creategroup.html";
});
//Load userpage Groups
document.addEventListener("DOMContentLoaded", async () => {
  const res = await apiFetch("http://localhost:8080/groups", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  renderGroups(data.allGroups);
  renderIssues(data.issues);
  //query from url on reload
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (!q) return;
  else {
    document.getElementById("searchInput").value = q;

    if (q.length < 3) return;

    const res = await apiFetch(
      `http://localhost:8080/groups/search?q=${encodeURIComponent(q.trim())}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    const data = await res.json();
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    for (let indgroup of data.allGroups) {
      createIndSearchCard(indgroup);
    }
  }
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
document.getElementById("group-search").style.display = "none";
const closeJoinGroup = document.querySelector(".close-joingroup-btn");
closeJoinGroup.addEventListener("click", () => {
  document.getElementById("group-search").style.display = "none";
  window.history.replaceState({}, "", window.location.pathname);
});
//open searchGroup
document.getElementById("joinGroup").addEventListener("click", () => {
  document.getElementById("group-search").style.display = "flex";
});

//?input code
const searchInp = document.getElementById("searchInput");
searchInp.addEventListener("input", async () => {
  const value = searchInp.value.trim();
  if (value) {
    const newUrl = `?q=${encodeURIComponent(value)}`;
    window.history.replaceState({}, "", newUrl);
  } else {
    window.history.replaceState({}, "", window.location.pathname);
    return;
  }

  if (value.length < 3) {
    return;
  } else {
    const res = await apiFetch(
      `http://localhost:8080/groups/search?q=${encodeURIComponent(value)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      },
    );
    const data = await res.json();
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    for (let indgroup of data.allGroups) {
      createIndSearchCard(indgroup);
    }
  }
});

// function createIndSearchCard(group) {
//   //if group exist return
//   // Create main container
//   const indSearch = document.createElement("div");
//   indSearch.className = "ind-search";

//   // Create left section
//   const indSearchLeft = document.createElement("div");
//   indSearchLeft.className = "ind-search-left";

//   // Create h3 for group name
//   const h3 = document.createElement("h3");

//   // Create div for badges
//   const badgesDiv = document.createElement("div");

//   // Create public/open badges (matching HTML structure)
//   const publicSpan = document.createElement("span");
//   publicSpan.textContent = "Public";

//   const approvalSpan = document.createElement("span");
//   approvalSpan.textContent = "approval needed";

//   badgesDiv.appendChild(publicSpan);
//   badgesDiv.appendChild(approvalSpan);

//   // Assemble left section
//   indSearchLeft.appendChild(h3);
//   indSearchLeft.appendChild(badgesDiv);

//   // Create join button
//   const joinButton = document.createElement("button");
//   joinButton.className = "join-status";
//   joinButton.textContent = "Join Group";

//   // Assemble ind-search
//   indSearch.appendChild(indSearchLeft);
//   indSearch.appendChild(joinButton);

//   document.getElementById("searchResults").append(indSearch);

//   // Changing values at the end
//   h3.innerText = group.groupname;
//   publicSpan.innerText = group.visibility;
//   approvalSpan.innerText = group.joinType;
//   joinButton.innerText = group.buttonText;
// }
function createIndSearchCard(group) {
  // Main container
  const indSearch = document.createElement("div");
  indSearch.className = "ind-search";
  indSearch.dataset.groupId = group._id;

  // Left section
  const indSearchLeft = document.createElement("div");
  indSearchLeft.className = "ind-search-left";

  // Image
  const img = document.createElement("img");
  img.src = "../../assets/OIP.jpg";
  img.alt = "group image";

  // Content box
  const contentBox = document.createElement("div");
  contentBox.className = "ind-search-content-box";

  // Group name
  const h3 = document.createElement("h3");

  // Badges container
  const badgesDiv = document.createElement("div");
  badgesDiv.className = "ind-search-content";

  const publicSpan = document.createElement("span");
  publicSpan.textContent = "Public";

  const approvalSpan = document.createElement("span");
  approvalSpan.textContent = "approval needed";

  badgesDiv.append(publicSpan, approvalSpan);
  contentBox.append(h3, badgesDiv);
  indSearchLeft.append(img, contentBox);

  // Join button
  const joinButton = document.createElement("button");
  joinButton.className = "join-status";
  joinButton.textContent = "Join Group";

  // Assemble card
  indSearch.append(indSearchLeft, joinButton);
  document.getElementById("searchResults").append(indSearch);

  // ---- set dynamic values at the end ----
  h3.innerText = group.groupname || "Unnamed Group";
  publicSpan.innerText = group.visibility;
  approvalSpan.innerText = group.joinType;
  joinButton.innerText = group.buttonText || "Join Group";
}
