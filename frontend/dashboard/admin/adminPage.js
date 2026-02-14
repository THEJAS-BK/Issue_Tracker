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
        `http://localhost:8080/indissue/${issue.dataset.issueId}`,
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
      `http://localhost:8080/indissue/${allIssues[0].dataset.issueId}`,
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

  if (searchTerm.length > 2) {
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


//admin edit members and delete btns
const confirmDeleteInterface = document.querySelector(".confirm-backdrop");
const deleteGroupBtn = document.getElementById("dropdown-delete")
deleteGroupBtn.addEventListener("click",()=>{
  confirmDeleteInterface.style.display = "flex";
  //cancel delete
  document.querySelector(".confirm-cancel").addEventListener("click",()=>{
    confirmDeleteInterface.style.display="none"
  })
  //confirm delete
  document.querySelector(".confirm-delete").addEventListener("click",async ()=>{
    const id = new URLSearchParams(window.location.search).get("id")
    const res = await apiFetch(`http://localhost:8080/api/delete/${id}/admin`,{
      method:"DELETE",
      credentials:"include"
    })
    console.log(res)
  })
})