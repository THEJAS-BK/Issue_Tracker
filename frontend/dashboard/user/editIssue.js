import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
document.addEventListener("DOMContentLoaded", async () => {
  const issueId=new URLSearchParams(window.location.search).get("issueid");
  if(!issueId) {
    window.location.href="/frontend/dashboard/user/dashboard.html";
  }
  const res = await apiFetch(
    `${API_BASE}/issues/edit/${issueId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
  //insert data
  document.getElementById("title").value = data.issue.title;
  document.getElementById("description").innerText = data.issue.description;
  //anonymous btn
  if (data.issue.stayAnonymous) {
    document.getElementById("anonymousSwitch").checked = true;
  }
});

//patch request to save all changes
const addIssueForm = document.querySelector(".issue-form");
addIssueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const issueId = new URLSearchParams(window.location.search).get("issueid");
  const groupId = new URLSearchParams(window.location.search).get("groupid");
  console.log(issueId, groupId);
  const anonSwitch = document.getElementById("anonymousSwitch").checked;
  const res = await apiFetch(`${API_BASE}/issues/edit/${issueId}`, {
    method: "PATCH",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: addIssueForm.title.value,
      description: addIssueForm.description.value,
      stayAnonymous: anonSwitch,
    }),
  });
  if (res.ok) {
    window.location.href = `/frontend/dashboard/user/groupInterface.html?id=${groupId}`;
  }
});
const cancelBtn = document.querySelector(".cancel");
cancelBtn.addEventListener("click", () => {
  const groupId = new URLSearchParams(window.location.search).get("groupid");
  window.location.href = `/frontend/dashboard/user/groupInterface.html?id=${groupId}`;
});
