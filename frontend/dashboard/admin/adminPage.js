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

  //remove edit and delete group btn for coadmins
  if (data.role === "coadmin") {
    document.getElementById("dropdown-edit").remove();
    document.getElementById("dropdown-delete").remove();
  }

  //go back to user interface btn
  const returnToUserPageBtn = document.getElementById("user-interface");
  returnToUserPageBtn.addEventListener("click", () => {
    const groupId = new URLSearchParams(window.location.search).get("id");
    window.location.href = `/frontend/dashboard/user/groupInterface.html?id=${groupId}`;
  });
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
  const year = new Date(time).getFullYear();
  const mon = new Date(time).getMonth();
  const date = new Date(time).getDate();
  const fullDate = `on ${date}/${mon + 1}/${year}`;

  const past = new Date(time).getTime();
  const diff = Math.floor((now - past) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return fullDate;
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

      updateIssuesOnRightSide(data.issue[0]);
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
  if (issue.status === "inprogress") {
    markInProgress.style.display = "none";
    markResolved.style.display = "block";
  } else if (issue.status === "resolved") {
    markInProgress.style.display = "none";
    markResolved.style.display = "none";
  } else if (issue.status === "pending") {
    markInProgress.style.display = "block";
    markResolved.style.display = "block";
  }
  markInProgress.dataset.state = "inprogress";
  markResolved.dataset.state = "resolved";
  //delete issue btn and more info btn
  moreInfoBtn.dataset.userId = issue.createdBy._id;
  deleteIssueBtn.dataset.issueId = issue._id;
  OpenMoreInfo();
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
    updateIssuesOnRightSide(data.issue[0]);
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
    const confirmDelete = document.querySelector(
      ".confirm-issue-delete-backdrop",
    );
    confirmDelete.style.display = "flex";
    document
      .querySelector(".confirm-delete-issue")
      .addEventListener("click", async (e) => {
        const groupId = new URLSearchParams(window.location.search).get("id");
        const issueId = deleteBtn.dataset.issueId;
        const res = await apiFetch(
          `http://localhost:8080/issues/${issueId}/delete/admin?q=${groupId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (res.ok) {
          confirmDelete.style.display = "none";
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

    //cancel delete
    document
      .querySelector(".confirm-cancel-issue")
      .addEventListener("click", () => {
        document.querySelector(".confirm-issue-delete-backdrop").style.display =
          "none";
      });
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
      btn.style.display = "none";
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
      //getBlue border after updation
      const filterval = document.getElementById("filter-select").value;
      if (filterval === "all") {
        const allIssues = document.querySelectorAll(".content-bars");
        for (let i = 0; i < allIssues.length; i++) {
          if (allIssues[i].dataset.issueId === issueId) {
            allIssues[i].classList.add("blue-border");
            break;
          }
        }
      } else {
        firstValSelected();
      }
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
    infoBtn.classList.add("user-info-btn");
    kickBtn.classList.add("kickMember");
    //giving datasets
    promoteBtn.dataset.userId = member.userId._id;
    demoteBtn.dataset.userId = member.userId._id;
    kickBtn.dataset.userId = member.userId._id;
    infoBtn.dataset.userId = member.userId._id;

    dropdown.appendChild(promoteBtn);
    dropdown.appendChild(demoteBtn);
    dropdown.appendChild(infoBtn);
    dropdown.appendChild(kickBtn);

    promoteBtn.textContent = "promote to coadmin";
    demoteBtn.textContent = "demote to member";
    infoBtn.textContent = "more info...";
    kickBtn.textContent = "remove member";
  } else if (role === "coadmin") {
    const infoBtn = document.createElement("button");
    const kickBtn = document.createElement("button");
    //giving classes
    infoBtn.classList.add("user-info-btn");
    kickBtn.classList.add("kickMember");
    //giving dataset
    infoBtn.dataset.userId = member.userId._id;
    kickBtn.dataset.userId = member.userId._id;
    infoBtn.dataset.userId = member.userId._id;
    //assemble
    dropdown.appendChild(infoBtn);
    dropdown.appendChild(kickBtn);

    infoBtn.textContent = "more info...";
    kickBtn.textContent = "remove member";
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
    infoBtn.classList.add("user-info-btn");
    infoBtn.dataset.userId = member.userId._id;
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
    //search members
    const searchInput = document.getElementById("search-members");

    searchInput.addEventListener("input", async (e) => {
      const val = e.target.value;
      const groupId = new URLSearchParams(window.location.search).get("id");
      const role = document.getElementById("filter-members").value;
      if (searchInput.value.length > 0) {
        const res = await apiFetch(
          `http://localhost:8080/groups/members/search/${groupId}/admin?q=${val}&state=${role}`,
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
        //more info
        OpenMoreInfo();
      }
      //cleared input
      if (searchInput.value.length === 0) {
        document.querySelector(".member-list").innerHTML = "";
        const res = await apiFetch(
          `http://localhost:8080/groups/members/${groupId}/admin?state=${role}`,
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
      }
      //promote to co admin
      promoteToCoAdmin();
      //demotion logic
      demoteToMember();
      //kick member
      kickMember();
      //more info
      OpenMoreInfo();
    });
    //promote to co admin
    promoteToCoAdmin();
    //demotion logic
    demoteToMember();
    //kick member
    kickMember();
    //more info
    OpenMoreInfo();
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
  //moreinfo
  OpenMoreInfo();
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
        //more info
        OpenMoreInfo();
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
    btn.addEventListener("click", async () => {
      document.querySelector(".confirm-kickout-backdrop").style.display =
        "flex";

      //? confirm delete button
      document
        .querySelector(".confirm-kickout-delete")
        .addEventListener("click", async (e) => {
          const parentEle = btn.parentElement.parentElement.parentElement;
          const userId = btn.dataset.userId;
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
            document.querySelector(".confirm-kickout-backdrop").style.display =
              "none";
            document.querySelector(".member-list").innerHTML = "";
            reloadFilters(groupId);
          }
        });

      //cancel kickout btn
      document
        .querySelector(".confirm-kickout-cancel")
        .addEventListener("click", () => {
          document.querySelector(".confirm-kickout-backdrop").style.display =
            "none";
        });
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

//?more info at the admin side
//close open info tab
document
  .querySelector(".close-user-info-tab")
  .addEventListener("click", (e) => {
    document.querySelector(".confirm-backdrop-user-info").style.display =
      "none";
       //moreinfo
  OpenMoreInfo();
  });
//open info tab
function OpenMoreInfo() {
  const moreInfoUserBtns = document.querySelectorAll(".user-info-btn");
  moreInfoUserBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const userId = e.target.dataset.userId;
      document.querySelector(".confirm-backdrop-user-info").style.display =
        "flex";
      //get issue logs data
      const groupId = new URLSearchParams(window.location.search).get("id");
      const res = await apiFetch(
        `http://localhost:8080/issues/${userId}/logs/history?groupId=${groupId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
  
      const data = await res.json();
      insertHistory(data);
      //insert history
      document.querySelector(".issue-history").innerHTML=""
      for (let issue of data.historyData) {
        addIssueHistoryItem(issue);
      }
    });
  });
}
//!rendering more info

function insertHistory(history) {
  document.querySelector(".info-table-name").textContent =
    history.userName.name;

  document.querySelector(".info-table-role").textContent =
    history.curUserDetails.role;

  document.querySelector(".info-table-joined-at").textContent = new Date(
    history.curUserDetails.joinedAt,
  ).toLocaleDateString();

  document.querySelector(".info-table-issues-raised").textContent =
    history.totalIssueRaised;

  document.querySelector(".info-table-issues-resolved").textContent =
    history.totalIssueResolved;

  document.querySelector(".info-table-issues-in-progress").textContent =
    history.totalIssuesInProgress;

  document.querySelector(".info-table-issue-deleted-by-user").textContent =
    history.totalIssuesDeletedByUser;

  document.querySelector(".info-table-issue-deleted-by-admin").textContent =
    history.totalIssueDeletedByAdmin;
}

//creatin issues
function createDetailLine(label, date, by) {
  const div = document.createElement("div");
  div.className = `issue-details-${label.toLowerCase().replace(/\s/g, "")}`;

  const formattedDate = new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  div.textContent = `${label}: ${formattedDate}${by ? " · " + by : ""}`;
  return div;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
function addIssueHistoryItem(issue) {

  const container = document.querySelector(".issue-history");
  if (!container) return;

  const details = document.createElement("details");
  details.className = "issue-item";

  const summary = document.createElement("summary");
  summary.className = "issue-summary";

  const title = document.createElement("div");
  title.className = "summary-title";
  title.textContent = issue.title;

  const status = document.createElement("div");
  status.className = "summary-day";
  if (issue.isDeleted) {
    status.innerHTML = `deleted
    <i class="fa-solid fa-caret-down"></i>`;
  } else {
    status.innerHTML = `${capitalize(issue.status)}
    <i class="fa-solid fa-caret-down"></i>`;
  }

  summary.append(title, status);

  const issueDetails = document.createElement("div");
  issueDetails.className = "issue-details";

  issueDetails.appendChild(createDetailLine("Raised", issue.createdAt));

  if (issue.markInprogress) {
    issueDetails.appendChild(
      createDetailLine(
        "Marked in progress",
        issue.markInprogress.at,
        issue.markInprogress.by.name,
      ),
    );
  }

  if (issue.resolved) {
    issueDetails.appendChild(
      createDetailLine("Resolved", issue.resolved.at, issue.resolved.by.name),
    );
  }
  if (issue.isDeleted) {
    issueDetails.appendChild(
      createDetailLine("Deleted", issue.deleted.at, issue.deleted.by.name),
    );
  }

  details.append(summary, issueDetails);
  container.appendChild(details);
}
