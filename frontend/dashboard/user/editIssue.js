import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
document.addEventListener("DOMContentLoaded", async () => {
  const name = document.querySelector(".get-user-name");
  const nameRes = await apiFetch(`${API_BASE}/auth/getusername`, {
    method: "GET",
    credentials: "include",
  });
  const nameData = await nameRes.json();
  name.textContent = nameData.username;

  document.querySelector(".cancel-btn").addEventListener("click", () => {
    const groupId = new URLSearchParams(window.location.search).get("groupid");
    window.location.href = "./groupInterface.html?id=" + groupId;
  });
  const issueId = new URLSearchParams(window.location.search).get("issueid");
  if (!issueId) {
    window.location.href = "./userpage.html";
  }
  const res = await apiFetch(`${API_BASE}/issues/edit/${issueId}`, {
    method: "GET",
    credentials: "include",
  });
  const data = await res.json();
  //insert data
  document.getElementById("title").value = data.issue.title;
  document.getElementById("description").value = data.issue.description;
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
    window.location.href = `./groupInterface.html?id=${groupId}`;
  }
});
//drag and drop
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("group-profile");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  uploadBox.addEventListener(eventName, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// Highlight on drag over
["dragenter", "dragover"].forEach(eventName => {
  uploadBox.addEventListener(eventName, () => {
    uploadBox.classList.add("dragover");
  });
});

// Remove highlight
["dragleave", "drop"].forEach(eventName => {
  uploadBox.addEventListener(eventName, () => {
    uploadBox.classList.remove("dragover");
  });
});

// Handle drop
uploadBox.addEventListener("drop", e => {
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    handleFile(file);
  }
});

// Handle click selection
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    handleFile(file);
  }
});


document.querySelector(".username").addEventListener("click", (e) => { 
  const dropdown = document.querySelector(".dropdown-user");
  dropdown.classList.toggle("hidden");
})