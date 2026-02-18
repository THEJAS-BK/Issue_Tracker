import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const groupid = params.get("id");
  const res = await apiFetch(`http://localhost:8080/groups/${groupid}/admin`, {
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
      const issueId = issue.dataset.issueId;
      const res = await apiFetch(
        `http://localhost:8080/issues/details/${issueId}/admin`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await res.json();
      updateIssuesOnRightSide(data.issue);
      //delete issue btn by admin privilages
      deleteIssueByAdmin();
    });
  });
}
//!render right contents
function updateIssuesOnRightSide(issue) {
  const title = document.querySelector(".issue-title");
  const name = document.querySelector(".name-right");
  const timeAgo = document.querySelector(".time-ago");
  const description = document.querySelector(".description-body-content");
  const markInProgress = document.querySelector(".desc-inprogress");
  const markResolved = document.querySelector(".desc-resolved");
  const moreInfoBtn = document.querySelector(".user-info-btn");
  const deleteIssueBtn = document.querySelector(".delete-issue-btn");

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
  //delete issue btn and more info btn
  moreInfoBtn.dataset.userId = issue.createdBy._id;
  deleteIssueBtn.dataset.issueId = issue._id;
}
//!already selected issue
async function firstValSelected() {
  const allIssues = document.querySelectorAll(".content-bars");
  if (allIssues[0]) {
    const issueId = allIssues[0].dataset.issueId;
    const res = await apiFetch(
      `http://localhost:8080/issues/details/${issueId}/admin`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    updateIssuesOnRightSide(data.issue);
    //add blue border
    allIssues[0].classList.add("blue-border");
    //deleteIssue btn
    deleteIssueByAdmin();
  }
}
//!delete issue function
function deleteIssueByAdmin() {
  const deleteBtn = document.querySelector(".delete-issue-btn");
  deleteBtn.addEventListener("click", async (e) => {
    const groupId = new URLSearchParams(window.location.search).get("id");
    const issueId = e.target.dataset.issueId;
    const res = await apiFetch(
      `http://localhost:8080/issues/${issueId}/delete/admin?q=${groupId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    if (res.ok) {
      const state = document.getElementById("filter-select").value;
      const res = await apiFetch(
        `http://localhost:8080/issues/filter/${groupId}?state=${state}`,
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
      firstValSelected();
      AddIssueEvents();
    }
  });
}

//!search code
const search = document.getElementById("search");
search.addEventListener("input", async (e) => {
  const searchTerm = e.target.value.toLowerCase();

  if (searchTerm.length > 0) {
    const res = await apiFetch(
      `http://localhost:8080/issues/search?q=${encodeURIComponent(searchTerm)}`,
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
    const res = await apiFetch(`http://localhost:8080/groups/interface/${id}`, {
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

//! select filter
const selectStatus = document.getElementById("filter-select");
selectStatus.addEventListener("change", async (e) => {
  document.querySelector(".issue-contents").innerHTML = "";
  const groupId = new URLSearchParams(window.location.search).get("id");
  const res = await apiFetch(
    `http://localhost:8080/issues/filter/${groupId}?state=${e.target.value}`,
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
    const issueId = e.target.dataset.issueId;
    const res = await apiFetch(
      `http://localhost:8080/issues/${issueId}/update/admin`,
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
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/issues/filter/${groupId}?state=${state}`,
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
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/groups/delete/${groupId}/admin`,
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
    dropdown.style.backgroundColor = "grey";
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
      `http://localhost:8080/groups/members/${groupId}/admin?state=all`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    //render all members
    for (let member of data.members) {
      addMemberCard(member, data.curUserRole);
    }
    //enablining filter option
    enableFilterOptions(groupId);
    //reload icon
    //search members
    const searchInput = document.getElementById("search-members");

    searchInput.addEventListener("input", async (e) => {
      const val = e.target.value;
      const groupId = new URLSearchParams(window.location.search).get("id");

      if (searchInput.value.length > 0) {
        const res = await apiFetch(
          `http://localhost:8080/groups/members/search/${groupId}/admin?q=${val}`,
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
          `http://localhost:8080/groups/members/${groupId}/admin`,
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
      //promote to co admin
      promoteToCoAdmin();
      //demotion logic
      demoteToMember();
      //kick member
      kickMember();
    });
    //promote to co admin
    promoteToCoAdmin();
    //demotion logic
    demoteToMember();
    //kick member
    kickMember();
  });
//reload icon code
async function reloadFilters(groupId) {
  const state = document.getElementById("filter-members").value;
  document.querySelector(".member-list").innerHTML = "";

  const res = await apiFetch(
    `http://localhost:8080/groups/members/${groupId}/admin?state=${state}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
  //render all members
  for (let member of data.members) {
    addMemberCard(member, data.curUserRole);
  }

  //promote to co admin
  promoteToCoAdmin();
  //demotion logic
  demoteToMember();
  //kick member
  kickMember();
}
//enabling filteration of group members
function enableFilterOptions(groupId) {
  document
    .getElementById("filter-members")
    .addEventListener("change", async (e) => {
      document.querySelector(".member-list").innerHTML = "";
      let role = e.target.value;

      const res = await apiFetch(
        `http://localhost:8080/groups/members/${groupId}/admin?state=${role}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (res.ok) {
        const data = await res.json();
        document.querySelector(".member-list").innerHTML = "";
        //render all members
        for (let member of data.members) {
          addMemberCard(member, data.curUserRole);
        }
        //promote to co admin
        promoteToCoAdmin();
        //demotion logic
        demoteToMember();
        //kick member
        kickMember();
        //reload options
      } else {
        alert("invalid");
      }
    });
}

//members option in admin
function promoteToCoAdmin() {
  const promoteToCoAdminBtn = document.querySelectorAll(".promoteToCoadmin");
  if (promoteToCoAdminBtn) {
    promoteToCoAdminBtn.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.target.dataset.userId;
        const groupId = new URLSearchParams(window.location.search).get("id");
        const res = await apiFetch(
          `http://localhost:8080/groups/members/promote/${groupId}/${userId}/admin`,
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
              reloadFilters(groupId);
            }
          }
        }
      });
    });
  }
}
//demote to member
function demoteToMember() {
  const promoteToCoAdminBtn = document.querySelectorAll(".demoteToMember");
  if (promoteToCoAdminBtn) {
    promoteToCoAdminBtn.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const userId = e.target.dataset.userId;
        const groupId = new URLSearchParams(window.location.search).get("id");
        const res = await apiFetch(
          `http://localhost:8080/groups/members/demote/${groupId}/${userId}/admin`,
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
              reloadFilters(groupId);
            }
          }
        }
      });
    });
  }
}
//kick member
function kickMember() {
  const kickBtn = document.querySelectorAll(".kickMember");
  kickBtn.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const parentEle = e.target.parentElement.parentElement.parentElement;
      const userId = e.target.dataset.userId;
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/groups/members/kick/${groupId}/${userId}/admin`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        parentEle.remove();
        reloadFilters(groupId);
      }
    });
  });
}

//! join requests code

function createJoinRequestCard(req) {
  const container = document.querySelector(".join-request-list");

  // card
  const card = document.createElement("div");
  card.className = "join-tab";

  // left
  const left = document.createElement("div");
  left.className = "join-tab-left";

  const nameEl = document.createElement("h4");
  const timeEl = document.createElement("p");

  left.append(nameEl, timeEl);

  // right
  const right = document.createElement("div");
  right.className = "join-tab-right";

  const acceptBtn = document.createElement("button");
  acceptBtn.textContent = "Accept";
  acceptBtn.className = "accept-join-req-btn";

  const declineBtn = document.createElement("button");
  declineBtn.textContent = "Decline";
  declineBtn.className = "decline-join-req-btn";
  right.append(acceptBtn, declineBtn);

  // assemble
  card.append(left, right);

  // insert at bottom
  container.appendChild(card);
  //add data
  nameEl.textContent = req.userId.name;
  timeEl.textContent = calcTime(req.requestedAt);
  //accept and decline btn
  acceptBtn.dataset.userId = req.userId._id;
  declineBtn.dataset.userId = req.userId._id;
}

//join request tab close
document
  .querySelector(".close-join-requests-tab")
  .addEventListener("click", () => {
    document.querySelector(".confirm-backdrop-join-request").style.display =
      "none";
  });
//open join request tab
document
  .getElementById("dropdown-join-requests")
  .addEventListener("click", async () => {
    document.querySelector(".confirm-backdrop-join-request").style.display =
      "flex";

    //get all request initially
    const groupId = new URLSearchParams(window.location.search).get("id");
    const res = await apiFetch(
      `http://localhost:8080/groups/join/request/${groupId}/admin`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    for (let req of data.joinRequests) {
      createJoinRequestCard(req);
    }
    //adding listeners to btns
    acceptJoinRequest();
    declineJoinReq();
    //enabling search
    searchRequests();

    //!reload requests
    document
      .querySelector(".reload-btn")
      .addEventListener("click", async () => {
        document.querySelector(".join-request-list").innerHTML = "";
        const res = await apiFetch(
          `http://localhost:8080/groups/join/request/${groupId}/admin`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        for (let req of data.joinRequests) {
          createJoinRequestCard(req);
        }
        //adding listeners to btns
        acceptJoinRequest();
        declineJoinReq();
      });
  });

//!accept join request btn code
function acceptJoinRequest() {
  const allBtns = document.querySelectorAll(".accept-join-req-btn");
  allBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      btn.parentElement.parentElement;
      const parentEle = e.target.parentElement.parentElement;
      const userId = e.target.dataset.userId;
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/groups/join/request/${userId}/admin?q=${groupId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        parentEle.remove();
        alert("member added");
      }
    });
  });
}
//!decline btn code
function declineJoinReq() {
  const allRejBtns = document.querySelectorAll(".decline-join-req-btn");
  allRejBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const parentEle = e.target.parentElement.parentElement;
      const userId = e.target.dataset.userId;
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/groups/join/request/${userId}/admin?q=${groupId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) {
        parentEle.remove();
      }
    });
  });
}
//!search join request
function searchRequests() {
  document
    .getElementById("search-join-requests")
    .addEventListener("input", async (e) => {
      const groupId = new URLSearchParams(window.location.search).get("id");
      if (!groupId) return;

      if (e.target.value.length > 0) {
        const res = await apiFetch(
          `http://localhost:8080/groups/join/request/${groupId}/admin/search?q=${e.target.value}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        console.log("data", data);
        document.querySelector(".join-request-list").innerHTML = "";
        for (let req of data) {
          createJoinRequestCard(req);
        }
        //adding listeners to btns
        acceptJoinRequest();
        declineJoinReq();
      }

      if (e.target.value.length === 0) {
        document.querySelector(".join-request-list").innerHTML = "";
        const res = await apiFetch(
          `http://localhost:8080/groups/join/request/${groupId}/admin`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        for (let req of data.joinRequests) {
          createJoinRequestCard(req);
        }
        //adding listeners to btns
        acceptJoinRequest();
        declineJoinReq();
      }
    });
}
