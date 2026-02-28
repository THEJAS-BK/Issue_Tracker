import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
import { waitForServer } from "../../utils/waitForServer.js";
import {toast} from "../../utils/toast.js"
function logOut() {
  const logOutBtn = document.querySelector(".logout-btn");
  logOutBtn.addEventListener("click", async () => {
    const res = await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
         localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/index.html";
    }
    if (!res.ok) {
      toast("logout failed","error")
    }
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("loading");
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    toast("server not working","error")
    document.body.classList.remove("loading");
  }
  logOut();
  //?check if image upload is allowed or not
  const groupId = new URLSearchParams(window.location.search).get("groupid");
  const imgRes = await apiFetch(
    `${API_BASE}/issues/imageUploadAllowed/${groupId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const isImageUploadAllowed = await imgRes.json();
  if (!isImageUploadAllowed.imageuploadpermission) {
    document.getElementById("uploadBox").style.display = "none";
    document.querySelector(".main-content").classList.remove("mt-2");

    document.querySelector(".main-content").style.marginTop = "5rem";
  }

  document.body.classList.add("loading");
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
  if (res.ok) {
    document.body.classList.remove("loading");
  } else {
    document.body.classList.remove("loading");
    toast("Failed to fetch issue details", "error");
  }
  const data = await res.json();
  if (data.issue.image) {
    const issueImg = document.querySelector(".issueImg");
    document.getElementById("uploadBox").style.padding = "0";
    issueImg.src = data.issue.image.url;
    document.querySelectorAll(".remove-this").forEach((el) => {
      el.style.display = "none";
    });
  }
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
  if (!addIssueForm.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
    addIssueForm.classList.add("was-validated");
  }
  e.preventDefault();
  addIssueForm.classList.add("was-validated");
  document.body.classList.add("loading");
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    toast("server not working","error")
    document.body.classList.remove("loading");
  }
  document.body.classList.add("loading");

  const issueId = new URLSearchParams(window.location.search).get("issueid");
  const groupId = new URLSearchParams(window.location.search).get("groupid");
  const anonSwitch = document.getElementById("anonymousSwitch").checked;
  const formData = new FormData();
  formData.append("title", addIssueForm.title.value);
  formData.append("description", addIssueForm.description.value);
  formData.append("stayAnonymous", anonSwitch);
  const fileInput = document.getElementById("issue-image").files[0];
  if (fileInput) {
    formData.append("issue-image", fileInput);
  }

  const res = await apiFetch(`${API_BASE}/issues/edit/${issueId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  if (res.ok) {
    window.location.href = `./groupInterface.html?id=${groupId}`;
  }
  if (!res.ok) {
    document.body.classList.remove("loading");
    toast("Failed to update issue", "error");
  }
});
//drag and drop
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("issue-image");

// Prevent default drag behaviors
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  uploadBox.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

// Highlight on drag over
["dragenter", "dragover"].forEach((eventName) => {
  uploadBox.addEventListener(eventName, () => {
    uploadBox.classList.add("dragover");
  });
});

// Remove highlight
["dragleave", "drop"].forEach((eventName) => {
  uploadBox.addEventListener(eventName, () => {
    uploadBox.classList.remove("dragover");
  });
});

uploadBox.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    const issueImg = document.querySelector(".issueImg");
    document.getElementById("uploadBox").style.padding = "0";
    issueImg.src = window.URL.createObjectURL(file);
    document.querySelectorAll(".remove-this").forEach((el) => {
      el.style.display = "none";
    });
  }
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    const issueImg = document.querySelector(".issueImg");
    document.getElementById("uploadBox").style.padding = "0";
    issueImg.src = window.URL.createObjectURL(file);
    document.querySelectorAll(".remove-this").forEach((el) => {
      el.style.display = "none";
    });
  }
});

document.querySelector(".username").addEventListener("click", (e) => {
  const dropdown = document.querySelector(".dropdown-user");
  dropdown.classList.toggle("hidden");
});
