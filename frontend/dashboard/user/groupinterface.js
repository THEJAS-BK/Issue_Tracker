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
  const briefres = await apiFetch("http://localhost:8080/groupinterface", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      groupId: id,
    }),
    credentials: "include",
  });

  const briefdata = await briefres.json();
  for (const issue of briefdata.issues) {
    createIssueCards(issue);
  }

  //render each issue
  const allIssueCards = document.querySelectorAll(".issue-card");

  //first issue border
  if (allIssueCards[0]) {
    allIssueCards[0].classList.add("addBorder");
    const firstEntryres = await apiFetch("http://localhost:8080/indissue", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        issueId: allIssueCards[0].dataset.issueId,
      }),
      credentials: "include",
    });
    const firstEntryData = await firstEntryres.json();
    updateIssueDetail(firstEntryData.issue);
  }

  //rest issues
  if (allIssueCards.length > 1) {
      allIssueCards.forEach((issueCard) => {
    issueCard.addEventListener("click", async () => {
      //blue border
      allIssueCards.forEach((card) => {
        card.classList.remove("addBorder");
      });
      issueCard.classList.add("addBorder");
      const Completeres = await apiFetch("http://localhost:8080/indissue", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          issueId: issueCard.dataset.issueId,
        }),
        credentials: "include",
      });
      const Completedata = await Completeres.json();
      updateIssueDetail(Completedata.issue);
    });
  });
}
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
  const createdTime = new Date(time).getTime();
  const curTime = new Date();

  const diffInMs = curTime - createdTime;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInyears = Math.floor(diffInDays / 30);

  if(diffInSecs<=0){
    return `Just now`;
  }
  if (diffInSecs < 60) {
    return `${diffInSecs} seconds ago`;
  } else if (diffInMins < 60) {
    return `${diffInMins} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    return `${diffInyears} year${diffInyears > 1 ? "s" : ""} ago`;
  }
}
