import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
import { toast } from "../../utils/toast.js";
import { waitForServer } from "../../utils/waitForServer.js";
//!add issue tab
const addIssueForm = document.querySelector(".issue-form");

function logOut() {
  const logOutBtn = document.querySelector(".logout-btn");
  logOutBtn.addEventListener("click", async () => {
    const res = await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
         localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/index.html";
    }
    if (!res.ok) {
      toast("Logout failed", "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("loading");

  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    toast("Server not working", "error");

    document.body.classList.remove("loading");
  }
  logOut();
  const name = document.querySelector(".get-user-name");
  const nameRes = await apiFetch(`${API_BASE}/auth/getusername`, {
    method: "GET",
  });
  const nameData = await nameRes.json();
  name.textContent = nameData.username;
  //check if image upload is allowed
  const groupId = new URLSearchParams(window.location.search).get("id");
  const res = await apiFetch(
    `${API_BASE}/issues/imageUploadAllowed/${groupId}`,
    {
      method: "GET",
    },
  );
  const isImageUploadAllowed = await res.json();
  if (!isImageUploadAllowed.imageuploadpermission) {
    document.getElementById("uploadBox").style.display = "none";
    document.querySelector(".main-content").style.marginTop = "5rem";
  }

  document.querySelector(".cancel-btn").addEventListener("click", () => {
    const groupId = new URLSearchParams(window.location.search).get("id");
    window.location.href = "./groupInterface.html?id=" + groupId;
  });
});

addIssueForm.addEventListener("submit", async (e) => {
  if (!addIssueForm.checkValidity()) {
    e.preventDefault();
    e.stopPropagation();
    addIssueForm.classList.add("was-validated");
    return;
  }
  e.preventDefault();
  addIssueForm.classList.add("was-validated");

  document.body.classList.add("loading");

  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    toast("Server not working", "error");

    document.body.classList.remove("loading");
  }
  document.body.classList.add("loading");
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!groupId) {
    toast("invalid groupId", "info");
    return;
  }
  const anonSwitch = document.getElementById("anonymousSwitch").checked;
  const formData = new FormData();
  formData.append("title", addIssueForm.title.value);
  formData.append("description", addIssueForm.description.value);
  formData.append("stayAnonymous", anonSwitch);

  const file = document.getElementById("issue-image").files[0];
  if (file) {
    formData.append("issue-image", file);
  }

  const res = await apiFetch(`${API_BASE}/issues/add/${groupId}`, {
    method: "POST",
    body: formData,
  });
  if (res.ok) {
    window.location.href = "./groupInterface.html?id=" + groupId;
  } else {
    document.body.classList.remove("loading");
    toast("Something went wrong", "error");
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

// Handle drop
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
