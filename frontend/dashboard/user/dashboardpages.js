import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
import { waitForServer } from "../../utils/waitForServer.js";
import { toast } from "../../utils/toast.js";
//Create group option
const createGroupBtn = document.querySelector(".create-group-btn");
createGroupBtn.addEventListener("click", () => {
  document.body.classList.add("loading");
  window.location.href = "./creategroup.html";
});
//logout btn code
function logOut() {
  const logOutBtn = document.querySelector(".logout-btn");
  logOutBtn.addEventListener("click", async () => {
    const res = await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/index.html";
    }
    if (!res.ok) {
      toast("logout failed", "error");
    }
  });
}

//Load userpage Groups
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("loading");
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    toast("server not working", "error");
    document.body.classList.remove("loading");
  }
  //enable logout btn
  logOut();
  const res = await apiFetch(`${API_BASE}/groups`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (res.ok) {
    document.body.classList.remove("loading");
  }
  const data = await res.json();

  renderGroups(data.allGroups);
  //render name on the home page
  const userName = document.querySelector(".get-user-name");
  if (data.userName && data.userName.name) {
    userName.innerText = data.userName.name;
  }
  //query from url on reload
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (!q) return;
  else {
    document.getElementById("searchInput").value = q;

    if (q.length < 3) return;

    const res = await apiFetch(
      `${API_BASE}/groups/search?q=${encodeURIComponent(q.trim())}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await res.json();
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    for (let indgroup of data.allGroups) {
      createIndSearchCard(indgroup);
    }
    idForSearchResults();
    joinRequest();
  }
});
// you name btn
document.querySelector(".username").addEventListener("click", (e) => {
  e.stopPropagation();
  const dropdown = document.querySelector(".dropdown-user");
  dropdown.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  const dropdown = document.querySelector(".dropdown-user");
  const btn = document.querySelector(".username");
  if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

function shortenText(text, wordLimit = 6) {
  const words = text.split(" ");

  if (words.length <= wordLimit) return text;

  return words.slice(0, wordLimit).join(" ") + "...";
}

function renderGroups(groups) {
  const groupContainer = document.querySelector(".space-holder");

  for (const group of groups) {
    // Anchor wrapper
    const anchor = document.createElement("a");
    anchor.href = `./groupInterface.html?id=${group._id}`;

    // Main parent
    const parent = document.createElement("div");
    parent.classList.add("leftTab-Tab");
    anchor.append(parent);

    // Insert into DOM
    groupContainer.insertAdjacentElement("beforebegin", anchor);

    /* ---------------- Left Section ---------------- */
    const leftSection = document.createElement("div");
    leftSection.classList.add("leftTab-left");

    // Image
    const img = document.createElement("img");
    img.alt = "Group category";
    img.classList.add("group-img");
    if (group.image && group.image.url) {
      img.src = group.image.url;
    } else {
      img.src = "../../assets/images.jpg";
    }
    leftSection.append(img);

    // Center content
    const centerContent = document.createElement("div");
    centerContent.classList.add("leftTab-left-center");

    const groupName = document.createElement("h4");
    groupName.classList.add("group-name");
    groupName.innerText = group.groupname;

    const groupDescription = document.createElement("p");
    groupDescription.classList.add("group-description");
    groupDescription.innerText = shortenText(group.description, 6);

    const groupmembers = document.createElement("p");
    groupmembers.innerText = `members : ${group.members.length}`;
    groupmembers.classList.add("group-members");

    centerContent.append(groupName, groupDescription, groupmembers);
    leftSection.append(img, centerContent);

    /* ---------------- Right Section ---------------- */
    const status = document.createElement("p");
    status.classList.add("badge-joined");
    status.classList.add("badge");
    status.innerText = "Joined";

    /* ---------------- Append All ---------------- */
    parent.append(leftSection, status);
  }
}
//close search group
const closeJoinGroup = document.querySelector(".close-joingroup-btn");
closeJoinGroup.addEventListener("click", () => {
  document.getElementById("search-overlay").style.display = "none";
  window.history.replaceState({}, "", window.location.pathname);
});
// //open searchGroup
document.getElementById("joinGroup").addEventListener("click", () => {
  document.getElementById("search-overlay").style.display = "flex";
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

  if (value.length < 1) {
    return;
  } else {
    const res = await apiFetch(
      `${API_BASE}/groups/search?q=${encodeURIComponent(value)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await res.json();
    const container = document.getElementById("searchResults");
    container.innerHTML = "";
    for (let indgroup of data.allGroups) {
      createIndSearchCard(indgroup);
    }
    idForSearchResults();
    joinRequest();
  }
});

function createIndSearchCard(group) {
  // Main container
  const indSearch = document.createElement("div");
  indSearch.className = "ind-search";

  // Left section
  const indSearchLeft = document.createElement("div");
  indSearchLeft.className = "ind-search-left";

  // Image
  const img = document.createElement("img");
 if(group.image){
   img.src = group.image.url;
 }
  img.alt = "group image";

  // Content box
  const contentBox = document.createElement("div");
  contentBox.className = "ind-search-content-box";

  // Group name
  const h3 = document.createElement("h3");

  // Badges container
  const badgesDiv = document.createElement("div");
  badgesDiv.className = "ind-search-content";

  const approvalSpan = document.createElement("span");

  badgesDiv.append(approvalSpan);
  contentBox.append(h3, badgesDiv);
  indSearchLeft.append(img, contentBox);

  //? Join button
  const joinTypeBtn = document.createElement("button");
  if (group.joinType === "open") {
    joinTypeBtn.className = "join-status";
    joinTypeBtn.innerText = "Join";
    joinTypeBtn.dataset.groupId = group._id;
    approvalSpan.textContent = "open";
  }
  //?request button
  if (group.joinType === "request") {
    joinTypeBtn.className = "request-status";
    joinTypeBtn.innerText = "Request";
    joinTypeBtn.dataset.groupId = group._id;
    approvalSpan.textContent = "approval needed";
  }

  // Assemble card
  indSearch.append(indSearchLeft, joinTypeBtn);
  document.getElementById("searchResults").append(indSearch);

  // ---- set dynamic values at the end ----
  h3.innerText = group.groupname || "Unnamed Group";
}

async function idForSearchResults() {
  const joinGroupBtn = document.querySelectorAll(".join-status");
  if (!joinGroupBtn) return;
  joinGroupBtn.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const res = await apiFetch(
        `${API_BASE}/groups/member/add/${btn.dataset.groupId}`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        window.location.reload();
      }
      if (res.status == 409) {
        toast("already a member of this group", "error");
      }
    });
  });
}
//search joined groups
document.getElementById("clear-search").addEventListener("click", () => {
  document.getElementById("searchjoinedGroups").value = "";
  document
    .getElementById("searchjoinedGroups")
    .dispatchEvent(new Event("input", { bubbles: true }));
});
const searchJoinedGroups = document.getElementById("searchjoinedGroups");
searchJoinedGroups.addEventListener("input", async (e) => {
  const val = searchJoinedGroups.value;

  if (val.length > 1) {
    const res = await apiFetch(`${API_BASE}/groups/search/joined?q=${val}`, {
      method: "GET",
    });

    //inserting things
    const searchContainer = document.querySelector(".leftTab");
    searchContainer.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("space-holder");
    searchContainer.append(div);
    const data = await res.json();
    renderGroups(data.allGroups);
  }
  //clear searches
  if (!val) {
    const searchContainer = document.querySelector(".leftTab");
    searchContainer.innerHTML = "";
    const div = document.createElement("div");
    div.classList.add("space-holder");
    searchContainer.append(div);
    inputClearDataReload();
  }
});

async function inputClearDataReload() {
  const res = await apiFetch(`${API_BASE}/groups`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  renderGroups(data.allGroups);
}

//! join request for search group globally code
async function joinRequest() {
  const allReqBtns = document.querySelectorAll(".request-status");
  allReqBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const res = await apiFetch(
        `${API_BASE}/groups/join/request/${btn.dataset.groupId}`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        btn.innerText = "requested";
        btn.style.backgroundColor = "white";
        btn.style.color = "blue";
        btn.style.border = "2px solid blue";
      }
      if (!res.ok || res.status === 409) {
        const data = await res.json();
        if (data.code === "already_member") {
          toast("already member", "error");
        } else if (data.code === "already_requested") {
          toast("already requested", "error");
        } else {
          toast(data.message, "error");
        }
      }
    });
  });
}
