import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  //add issues
  const addIssueBtn = document.querySelector(".addIssue-btn");
  addIssueBtn.addEventListener("click", () => {
    window.location.href = `/frontend/dashboard/user/addIssue.html?id=${id}`;
  });

  //show contents
  const res = await apiFetch(`http://localhost:8080/groupinterface/${id}`, {
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
    window.location.href = `/frontend/dashboard/admin/adminPage.html?id=${id}`;
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

function updateIssueDetail(issue) {
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

  //edit and delete btn id insetion
  const editBtn = document.getElementById("edit-issue");
  const deleteBtn = document.getElementById("delete-issue");
  if (editBtn && deleteBtn) {
    editBtn.dataset.issueId = issue._id;
    deleteBtn.dataset.issueId = issue._id;
    //if user is owner of issue
    const ownerEditBtn = document.querySelector(".issue-options");
    const upvoteBtn = document.querySelector(".sameIssues");
    if (issue.isIssueOwner) {
      console.log("Owner");
      ownerEditBtn.style.display = "block";
      upvoteBtn.remove();
    } else {
      ownerEditBtn.remove();
      upvoteBtn.style.display = "flex";
    }
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
  if (val.length > 2) {
    const res = await apiFetch(
      `http://localhost:8080/issue/search?q=${encodeURIComponent(val)}`,
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
    const res = await apiFetch(`http://localhost:8080/groupinterface/${id}`, {
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
    const firstEntryres = await apiFetch(
      `http://localhost:8080/indissue/${allIssueCards[0].dataset.issueId}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const firstEntryData = await firstEntryres.json();
    updateIssueDetail(firstEntryData.issue);
  }

  //rest issues
  allIssueCards.forEach((issueCard) => {
    issueCard.addEventListener("click", async () => {
      //blue border
      allIssueCards.forEach((card) => {
        card.classList.remove("addBorder");
      });
      issueCard.classList.add("addBorder");
      const Completeres = await apiFetch(
        `http://localhost:8080/indissue/${issueCard.dataset.issueId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const Completedata = await Completeres.json();
      updateIssueDetail(Completedata.issue);
    });
  });
}

//filter states code
const selectStatus = document.getElementById("search-filter");
selectStatus.addEventListener("change", async (e) => {
  const res = await apiFetch(
    `http://localhost:8080/filter/${new URLSearchParams(window.location.search).get("id")}?state=${e.target.value}`,
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
          `http://localhost:8080/delete/issue/${issueId}`,
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
