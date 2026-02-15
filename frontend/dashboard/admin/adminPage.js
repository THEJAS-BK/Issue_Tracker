import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const groupid = params.get("id");
  const res = await apiFetch(`http://localhost:8080/api/${groupid}/admin`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  for (let issue of data.issues) {
    insertIssueCard(issue);
  }
  AddIssueEvents();
  //first value selected
  firstValSelected();
  //insert group info
  const groupDetails = data.groupDetails;
  document.querySelector(".group-name").textContent = groupDetails.groupname;
  document.querySelector(".group-description").textContent =
    groupDetails.description;
  document.querySelector(".invite-code").textContent = groupDetails.inviteCode;
});

function insertIssueCard(issue) {
  const issueContainer = document.querySelector(".issue-contents");
  // outer card
  const contentBars = document.createElement("div");
  contentBars.classList.add("content-bars");
  // left section
  const left = document.createElement("div");
  left.classList.add("content-bar-left");

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-circle-exclamation");

  const textWrapper = document.createElement("div");

  const title = document.createElement("h6");

  const name = document.createElement("p");
  name.classList.add("name");

  textWrapper.append(title, name);
  left.append(icon, textWrapper);

  // status badge
  const badge = document.createElement("div");
  badge.classList.add("badge");

  // assemble card
  contentBars.append(left, badge);

  // insert into container
  issueContainer.append(contentBars);
  //contents
  title.textContent = issue.title;
  name.innerHTML = `${issue.createdBy.name} <span>${calcTime(issue.createdAt)}</span>`;
  badge.textContent = issue.status;
  contentBars.dataset.issueId = issue._id;
}

function calcTime(time) {
  const now = Date.now();
  const past = new Date(time).getTime();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

// select issue on the left side
function AddIssueEvents() {
  const allIssues = document.querySelectorAll(".content-bars");
  allIssues.forEach((issue) => {
    issue.addEventListener("click", async () => {
      allIssues.forEach((issue) => {
        issue.classList.remove("blue-border");
      });
      issue.classList.add("blue-border");
      const res = await apiFetch(
        `http://localhost:8080/api/indissue/${issue.dataset.issueId}/admin`,
      );
      const data = await res.json();
      updateIssuesOnRightSide(data.issue);
      //blue border
    });
  });
}
//render right contents
function updateIssuesOnRightSide(issue) {
  const title = document.querySelector(".issue-title");
  const name = document.querySelector(".name-right");
  const timeAgo = document.querySelector(".time-ago");
  const description = document.querySelector(".description-body-content");
  const markInProgress = document.querySelector(".desc-inprogress");
  const markResolved = document.querySelector(".desc-resolved");

  title.textContent = issue.title;
  name.textContent = issue.createdBy.name;
  timeAgo.textContent = calcTime(issue.createdAt);
  description.textContent = issue.description;
  //mark in progress and mark as resolved
  markInProgress.dataset.issueId = issue._id;
  markResolved.dataset.issueId = issue._id;
  // adding their states
  markInProgress.dataset.state = "inprogress";
  markResolved.dataset.state = "resolved";
}
//already selected issue
async function firstValSelected() {
  const allIssues = document.querySelectorAll(".content-bars");
  if (allIssues[0]) {
    const res = await apiFetch(
      `http://localhost:8080/api/indissue/${allIssues[0].dataset.issueId}/admin`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    updateIssuesOnRightSide(data.issue);
    //add blue border
    allIssues[0].classList.add("blue-border");
  }
}

//serach code
const search = document.getElementById("search");
search.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.toLowerCase();

  if (searchTerm.length > 0) {
    const res = await apiFetch(
      `http://localhost:8080/issue/search?q=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    document.querySelector(".issue-contents").innerHTML = "";
    for (let issue of data.issues) {
      insertIssueCard(issue);
    }
    AddIssueEvents();
    firstValSelected();
  }
  if (searchTerm.length === 0) {
    const id = new URLSearchParams(window.location.search).get("id");
    document.querySelector(".issue-contents").innerHTML = "";
    const res = await apiFetch(`http://localhost:8080/groupinterface/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    for (let issue of data.issues) {
      insertIssueCard(issue);
    }
    AddIssueEvents();
    firstValSelected();
  }
});

//select filter
const selectStatus = document.getElementById("filter-select");
selectStatus.addEventListener("change", async (e) => {
  document.querySelector(".issue-contents").innerHTML = "";
  const res = await apiFetch(
    `http://localhost:8080/filter/${new URLSearchParams(window.location.search).get("id")}?state=${e.target.value}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
  for (let issue of data.issues) {
    insertIssueCard(issue);
  }
  AddIssueEvents();
  firstValSelected();
});

// mark in progress and solved btns
const updateBtns = document.querySelectorAll(".update-state-btns");
updateBtns.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const res = await apiFetch(
      `http://localhost:8080/api/${e.target.dataset.issueId}/update/admin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: e.target.dataset.state,
        }),
      },
    );
    if (res.status == 200) {
      const state = document.getElementById("filter-select").value;
      const res = await apiFetch(
        `http://localhost:8080/filter/${new URLSearchParams(window.location.search).get("id")}?state=${state}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      document.querySelector(".issue-contents").innerHTML = "";
      const data = await res.json();
      for (let issue of data.issues) {
        insertIssueCard(issue);
      }
      AddIssueEvents();
      firstValSelected();
    }
  });
});

//admin edit,members and delete btns
//delete btns
const confirmDeleteInterface = document.querySelector(".confirm-backdrop");
const deleteGroupBtn = document.getElementById("dropdown-delete");
deleteGroupBtn.addEventListener("click", () => {
  confirmDeleteInterface.style.display = "flex";
  //cancel delete
  document.querySelector(".confirm-cancel").addEventListener("click", () => {
    confirmDeleteInterface.style.display = "none";
  });
  //confirm delete
  document
    .querySelector(".confirm-delete")
    .addEventListener("click", async () => {
      const id = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/api/delete/${id}/admin`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        confirmDeleteInterface.style.display = "none";
        alert("Failed to delete group");
        return;
      }

      if (res.ok) {
        window.location.href = "/frontend/dashboard/user/userpage.html";
      }
    });
});

//edit btn
const editGroupBtn = document.getElementById("dropdown-edit");
editGroupBtn.addEventListener("click", () => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  window.location.href = `/frontend/dashboard/admin/editgroup.html?id=${groupId}`;
});

//members section code
function addMemberCard(member, role) {
  const memberList = document.querySelector(".member-list");
  if (!memberList) return;

  // ---- create elements ----
  const memberTab = document.createElement("div");
  memberTab.classList.add("member-tab");

  const left = document.createElement("div");
  left.classList.add("member-tab-left");

  const nameEl = document.createElement("h4");
  nameEl.classList.add("member-name");

  const statusEl = document.createElement("p");
  statusEl.classList.add("member-status");
  statusEl.dataset.userId = member.userId._id;

  const options = document.createElement("div");
  options.classList.add("options");

  const icon = document.createElement("i");
  icon.className = "fa-solid fa-ellipsis";

  const dropdown = document.createElement("div");
  dropdown.classList.add("options-dropdown");

  if (role === "admin") {
    const promoteBtn = document.createElement("button");
    const demoteBtn = document.createElement("button");
    const infoBtn = document.createElement("button");
    const kickBtn = document.createElement("button");
    //giving classes
    promoteBtn.classList.add("promoteToCoadmin");
    demoteBtn.classList.add("demoteToMember");
    infoBtn.classList.add("memberInfo");
    kickBtn.classList.add("kickMember");
    //giving datasets
    promoteBtn.dataset.userId = member.userId._id;
    demoteBtn.dataset.userId = member.userId._id;
    kickBtn.dataset.userId = member.userId._id;

    dropdown.appendChild(promoteBtn);
    dropdown.appendChild(demoteBtn);
    dropdown.appendChild(infoBtn);
    dropdown.appendChild(kickBtn);

    promoteBtn.textContent = "promote to coadmin";
    demoteBtn.textContent = "demote to member";
    infoBtn.textContent = "more info...";
    kickBtn.textContent = "kick out";
  } else if (role === "coadmin") {
    const infoBtn = document.createElement("button");
    const kickBtn = document.createElement("button");
    //giving classes
    infoBtn.classList.add("memberInfo");
    kickBtn.classList.add("kickMember");
    //giving dataset
    infoBtn.dataset.userId = member.userId._id;
    kickBtn.dataset.userId = member.userId._id;
    //assemble
    dropdown.appendChild(infoBtn);
    dropdown.appendChild(kickBtn);

    infoBtn.textContent = "more info...";
    kickBtn.textContent = "kick out";
  } else {
    alert(" invalid login");
  }

  // ---- assemble structure ----
  left.appendChild(nameEl);
  left.appendChild(statusEl);

  options.appendChild(icon);
  options.appendChild(dropdown);

  memberTab.appendChild(left);
  memberTab.appendChild(options);
  memberList.appendChild(memberTab);

  // ---- value insertion & dataset wiring (ONLY here) ----
  nameEl.textContent = member.userId.name;
  statusEl.textContent = member.role;

  //admin upstatus
  if (member.role === "admin") {
    dropdown.innerHTML = "";
    dropdown.style.backgroundColor="grey"
    const infoBtn = document.createElement("button");
    infoBtn.classList.add("memberInfo");
    dropdown.appendChild(infoBtn);
       infoBtn.textContent = "more info...";
  }
}
//close members tab
document.querySelector(".close-members-tab").addEventListener("click", () => {
  document.querySelector(".confirm-backdrop-members").style.display = "none";
  window.location.reload();
});
//open members tab
document
  .getElementById("dropdown-members")
  .addEventListener("click", async () => {
    document.querySelector(".confirm-backdrop-members").style.display = "flex";
    //get info
    const groupId = new URLSearchParams(window.location.search).get("id");
    if (!groupId) return alert("invalid");
    document.querySelector(".member-list").innerHTML = "";
    const res = await apiFetch(
      `http://localhost:8080/api/members/${groupId}/admin`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    //render all members
    for (let member of data.members.members) {
      addMemberCard(member, data.curUserRole);
    }

    //search
    const searchInput = document.getElementById("search-members");

    searchInput.addEventListener("input", async (e) => {
      const val = e.target.value;
      const groupId = new URLSearchParams(window.location.search).get("id");

      if (searchInput.value.length > 1) {
        const res = await apiFetch(
          `http://localhost:8080/api/members/search/${groupId}/admin/?q=${val}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await res.json();
        //clear existing members
        document.querySelector(".member-list").innerHTML = "";
        //render filtered member
        for (let member of data.members) {
          addMemberCard(member, data.curUserRole);
        }
      }
      //cleared input
      if (searchInput.value.length === 0) {
        document.querySelector(".member-list").innerHTML = "";
        const res = await apiFetch(
          `http://localhost:8080/api/members/${groupId}/admin`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        //render all members
        for (let member of data.members.members) {
          addMemberCard(member, data.curUserRole);
        }
      }
    });
    //promote to co admin
    promoteToCoAdmin();
    //demotion logic
    demoteToMember();
    //kick member
    kickMember()
  });

//members option in admin
function promoteToCoAdmin() {
  const promoteToCoAdminBtn = document.querySelectorAll(".promoteToCoadmin");
  if (promoteToCoAdminBtn) {
    promoteToCoAdminBtn.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.target.dataset.userId;
        const groupId = new URLSearchParams(window.location.search).get("id");
        const res = await apiFetch(
          `http://localhost:8080/api/members/promote/${groupId}/${userId}/admin`,
          {
            method: "PUT",
            credentials: "include",
          },
        );
        //update member tab status
        if (res.ok) {
          const allStatus = document.querySelectorAll(".member-status");
          for (let status of allStatus) {
            if (userId === status.dataset.userId) {
              status.textContent = "coadmin";
            }
          }
        }
      });
    });
  }
}
//demote to member
function demoteToMember(){
  const promoteToCoAdminBtn = document.querySelectorAll(".demoteToMember");
  if (promoteToCoAdminBtn) {
    promoteToCoAdminBtn.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.target.dataset.userId;
        const groupId = new URLSearchParams(window.location.search).get("id");
        const res = await apiFetch(
          `http://localhost:8080/api/members/demote/${groupId}/${userId}/admin`,
          {
            method: "PUT",
            credentials: "include",
          },
        );
        //update member tab status
        if (res.ok) {
          const allStatus = document.querySelectorAll(".member-status");
          for (let status of allStatus) {
            if (userId === status.dataset.userId) {
              status.textContent = "member";
            }
          }
        }
      });
    });
  }
}
//kick member   
function kickMember(){
  const kickBtn=document.querySelectorAll(".kickMember");
  kickBtn.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const parentEle = e.target.parentElement.parentElement.parentElement;
      const userId = e.target.dataset.userId;
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/api/members/kick/${groupId}/${userId}/admin`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
       parentEle.remove()
      }
    });
  });
}