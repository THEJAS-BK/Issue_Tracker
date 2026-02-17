import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const groupId = params.get("id");
  if (!groupId) {
    window.location.href = "/frontend/dashboard/user/dashboard.html";
  }

  //add issues
  const addIssueBtn = document.querySelector(".addIssue-btn");
  addIssueBtn.addEventListener("click", () => {
    window.location.href = `/frontend/dashboard/user/addIssue.html?id=${groupId}`;
  });

  //show contents
  const res = await apiFetch(`http://localhost:8080/groups/interface/${groupId}`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();

  //load group name and description
  const groupName = document.querySelector(".group-name");
  const groupDesc = document.querySelector(".group-description");
  const inviteCode = document.querySelector(".invite-code");
  groupName.textContent = data.groupDetails.groupname;
  groupDesc.textContent = data.groupDetails.description;
  inviteCode.textContent = data.groupDetails.inviteCode;

  //admin dashboard btn code
  const adminDashboardBtn = document.querySelector(".admin-dashboard-btn");
  adminDashboardBtn.addEventListener("click", () => {
    window.location.href = `/frontend/dashboard/admin/adminPage.html?id=${groupId}`;
  });
  const curUser = data.curUser;
  for (let member of data.allmembers.members) {
    if (curUser === member.userId) {
      if (member.role === "member") {
        //get admin dashboard btn
        const adminBtn = document.querySelector(".admin-dashboard-btn");
        adminBtn.remove();
      } else if (member.role === "admin" || member.role === "coadmin") {
        //do nothing
      } else {
        const adminBtn = document.querySelector(".admin-dashboard-btn");
        adminBtn.remove();
      }
    }
  }

  //load all cards
  for (const issue of data.issues) {
    createIssueCards(issue);
  }
  addEventToIssueCards();
});

function createIssueCards(issue) {
  const issueCardContainer = document.querySelector(".issues");
  if (!issueCardContainer) return;

  const issueCard = document.createElement("div");
  issueCard.classList.add("issue-card");

  const issueCardLeft = document.createElement("div");
  issueCardLeft.classList.add("card-left");

  const issueCardBadge = document.createElement("div");
  issueCardBadge.classList.add("badge");

  //insert card to container
  issueCardContainer.append(issueCard);

  //issue card left side insertion
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-circle");
  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");

  //card content data
  const h3 = document.createElement("h3");
  const divForNameAndTime = document.createElement("div");
  divForNameAndTime.setAttribute("style", "display:flex");

  //div for name contents
  const name = document.createElement("p");
  name.classList.add("name");

  const timeAgo = document.createElement("p");
  timeAgo.classList.add("time-ago");

  divForNameAndTime.append(name, timeAgo);

  //inserting inside card content
  cardContent.append(h3, divForNameAndTime);

  //insert to card left
  issueCardLeft.append(icon, cardContent);

  //! insert everthing inside issue card
  issueCard.append(issueCardLeft, issueCardBadge);

  //
  h3.textContent = issue.title;
  if (issue.stayAnonymous) {
    name.textContent = "anonymous";
  } else {
    name.textContent = issue.createdBy.name;
  }
  timeAgo.textContent = calcTimeAgo(issue.createdAt);
  issueCardBadge.textContent = issue.status;
  issueCard.dataset.issueId = issue._id;
}

function updateIssueDetail(issue, isIssueOwner) {
  const mainRight = document.querySelector(".mainright");
  if (!mainRight) return;

  // HEADER
  const h3 = mainRight.querySelector(".head-title h3");
  const img = mainRight.querySelector(".profile img");
  const name = mainRight.querySelector(".name");
  const timeAgo = mainRight.querySelector(".time-ago");
  const badge = mainRight.querySelector(".badge");

  // DESCRIPTION
  const issueImg = mainRight.querySelector(".right-image");
  const descText = mainRight.querySelector(".description-body-content");

  // -------- DATA UPDATE ONLY --------
  h3.textContent = issue.title;
  img.src = "/frontend/assets/OIP.jpg";
  if (issue.createdBy) {
    name.textContent = issue.createdBy.name;
  } else {
    name.textContent = "Anonymous";
  }

  timeAgo.textContent = calcTimeAgo(issue.createdAt);
  badge.textContent = issue.status;
  descText.textContent = issue.description;

  //edit and delete btn id insection
  if (isIssueOwner) {
    //if user is owner of issue
    const ownerEditBtn = document.querySelector(".issue-options");
    const upvoteBtn = document.querySelector(".sameIssues");
    ownerEditBtn.style.display = "block";
    upvoteBtn.style.display = "none";
    //edit and delete issue dropdown
    const editBtn = document.getElementById("edit-issue");
    const deleteBtn = document.getElementById("delete-issue");
    if (editBtn && deleteBtn) {
      editBtn.dataset.issueId = issue._id;
      deleteBtn.dataset.issueId = issue._id;
    }
  } else {
    //if not owner
    document.querySelector(".issue-options").style.display = "none";
    document.querySelector(".sameIssues").style.display = "flex";
  }

  if (issueImg) {
    issueImg.src = "/frontend/assets/OIP.jpg";
  }
}

function calcTimeAgo(time) {
  const now = Date.now();
  const past = new Date(time).getTime();
  const diff = Math.floor((now - past) / 1000);
  if (diff <= 0) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

//search bar code
const search = document.getElementById("search");
search.addEventListener("input", async () => {
  const val = search.value;
  if (val.length > 0) {
    const res = await apiFetch(
      `http://localhost:8080/issues/search?q=${encodeURIComponent(val)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const data = await res.json();
    document.querySelector(".issues").innerHTML = "";
    for (let issue of data.issues) {
      createIssueCards(issue);
    }
    addEventToIssueCards();
  }
  if (val.length === 0) {
    const id = new URLSearchParams(window.location.search).get("id");
    document.querySelector(".issues").innerHTML = "";
    const res = await apiFetch(`http://localhost:8080/groups/interface/${id}`, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    for (let issue of data.issues) {
      createIssueCards(issue);
    }
    addEventToIssueCards();
  }
});
async function addEventToIssueCards() {
  //render each issue
  const allIssueCards = document.querySelectorAll(".issue-card");

  //first issue border
  if (allIssueCards[0]) {
    allIssueCards[0].classList.add("addBorder");
    const issueId=allIssueCards[0].dataset.issueId
    const firstEntryres = await apiFetch(
      `http://localhost:8080/issues/details/${issueId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const firstEntryData = await firstEntryres.json();
    updateIssueDetail(firstEntryData.issue, firstEntryData.isIssueOwner);
  }

  //rest issues
  allIssueCards.forEach((issueCard) => {
    issueCard.addEventListener("click", async () => {
      //blue border
      allIssueCards.forEach((card) => {
        card.classList.remove("addBorder");
      });
      issueCard.classList.add("addBorder");
      const issueId=issueCard.dataset.issueId;
      const Completeres = await apiFetch(
        `http://localhost:8080/issues/details/${issueId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const Completedata = await Completeres.json();
      updateIssueDetail(Completedata.issue, Completedata.isIssueOwner);
    });
  });
}

//filter states code
const selectStatus = document.getElementById("search-filter");
selectStatus.addEventListener("change", async (e) => {
  const groupId=new URLSearchParams(window.location.search).get("id");
  const searchVal=e.target.value;
  const res = await apiFetch(
    `http://localhost:8080/issues/filter/${groupId}?state=${searchVal}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
  document.querySelector(".issues").innerHTML = "";
  for (let issue of data.issues) {
    createIssueCards(issue);
  }
  addEventToIssueCards();
});

//!edit and delete btns code
//delete btn
const deleteIssueBtn = document.getElementById("delete-issue");
const confirmDeleteInterface = document.querySelector(".confirm-backdrop");

deleteIssueBtn.addEventListener("click", () => {
  confirmDeleteInterface.style.display = "flex";
  //cancel delete
  document.querySelector(".confirm-cancel").addEventListener("click", () => {
    confirmDeleteInterface.style.display = "none";
  });
  //confirm delete
  document
    .querySelector(".confirm-delete")
    .addEventListener("click", async () => {
      const issueId = document.getElementById("delete-issue").dataset.issueId;
      if (!issueId) {
        alert("something went wrong");
      }
      if (issueId) {
        const res = await apiFetch(
          `http://localhost:8080/issues/delete/${issueId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (res.ok) {
          confirmDeleteInterface.style.display = "none";
          window.location.reload();
        }
      }
    });
});
//Edit btn
document.getElementById("edit-issue").addEventListener("click", () => {
  const issueId = document.getElementById("edit-issue").dataset.issueId;
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!issueId) {
    alert("something went wrong");
  }
  if (issueId) {
    window.location.href = `/frontend/dashboard/user/editIssue.html?issueid=${issueId}&groupid=${groupId}`;
  }
});
//!search members btn
function addMemberCard(member) {
  const memberList = document.querySelector(".member-list");
  if (!memberList) return;

  // ---- create elements ----
  const memberTab = document.createElement("div");
  memberTab.classList.add("member-tab");

  const left = document.createElement("div");
  left.classList.add("member-tab-left");

  const joinedAt = document.createElement("p");
  joinedAt.classList.add("joined-at");

  const nameEl = document.createElement("h4");
  nameEl.classList.add("member-name");

  const statusEl = document.createElement("p");
  statusEl.classList.add("member-status");

  // ---- assemble structure ----
  left.appendChild(nameEl);
  left.appendChild(joinedAt);

  memberTab.appendChild(left);
  memberTab.appendChild(statusEl);
  memberList.appendChild(memberTab);

  // ---- value insertion & dataset wiring (ONLY here) ----
  nameEl.textContent = member.userId.name;
  statusEl.textContent = member.role;
  joinedAt.textContent = `Joined :${calcTimeAgo(member.joinedAt)}`;
}
//close search members
document.querySelector(".close-members-tab").addEventListener("click", () => {
  document.querySelector(".confirm-backdrop-members").style.display = "none";
});
//open search
document.getElementById("show-members").addEventListener("click",async () => {
  document.querySelector(".confirm-backdrop-members").style.display = "flex";
  const searchInput = document.getElementById("search-members");
  const groupId = new URLSearchParams(window.location.search).get("id");

   const res = await apiFetch(
        `http://localhost:8080/groups/members/${groupId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();
      //clear existing members
      document.querySelector(".member-list").innerHTML = "";
      //render filtered member
      for (let member of data.members.members) {
        addMemberCard(member);
      }


  searchInput.addEventListener("input", async (e) => {
      const val = e.target.value;
    if (searchInput.value.length > 0) {
      const res = await apiFetch(
        `http://localhost:8080/groups/members/search/${groupId}?q=${val}`,
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
        addMemberCard(member);
      }
    }
    //cleared input
    if (searchInput.value.length === 0) {
      document.querySelector(".member-list").innerHTML = "";
       const res = await apiFetch(
        `http://localhost:8080/groups/members/${groupId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();
      //clear existing members
      document.querySelector(".member-list").innerHTML = "";
      //render filtered member
      for (let member of data.members.members) {
        addMemberCard(member);
      }

    }
  });
});
