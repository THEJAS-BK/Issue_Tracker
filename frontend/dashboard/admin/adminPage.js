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
   //already selected issue
   const allIssues = document.querySelectorAll(".content-bars");
   if(allIssues[0]){
     const res=await apiFetch(`http://localhost:8080/indissue/${allIssues[0].dataset.issueId}`)
      const data = await res.json();
      updateIssuesOnRightSide(data.issue)
      //add blue border
      allIssues[0].classList.add("blue-border")
   }
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
  badge.textContent = "pending";
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
    issue.addEventListener("click",async () => {
      const res=await apiFetch(`http://localhost:8080/indissue/${issue.dataset.issueId}`)
      const data = await res.json();
      updateIssuesOnRightSide(data.issue)
    });
  });
}
//render right contents
function updateIssuesOnRightSide(issue){
  const title = document.querySelector(".issue-title")
  const name = document.querySelector(".name-right")
  const timeAgo = document.querySelector(".time-ago")
  const description = document.querySelector(".description-body-content")

  title.textContent=issue.title;
  name.textContent=issue.createdBy.name;
  timeAgo.textContent=calcTime(issue.createdAt)
  description.textContent=issue.description;

}
