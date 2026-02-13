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
  name.textContent = issue.createdBy.name;
  timeAgo.textContent = calcTimeAgo(issue.createdAt);
  issueCardBadge.textContent = "closed";
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
  name.textContent = issue.createdBy.name;
  timeAgo.textContent = calcTimeAgo(issue.createdAt);
  badge.textContent = "open";
  descText.textContent = issue.description;

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
    const res = await fetch(`http://localhost:8080/issue/${val}/search`, {
      method: "GET",
      credentials: "include",
    });
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
