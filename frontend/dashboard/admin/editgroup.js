import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
import { waitForServer } from "../../utils/waitForServer.js";
const API_BASE = sendApiBase();
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("loading");
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    alert("server not working");
    document.body.classList.remove("loading");
  }
  const name = document.querySelector(".get-user-name");
  const nameRes = await apiFetch(`${API_BASE}/auth/getusername`, {
    method: "GET",
    credentials: "include",
  });
  const nameData = await nameRes.json();
  name.textContent = nameData.username;
  //cancel btn
  document.querySelector(".cancel-update").addEventListener("click", () => {
    const groupId = new URLSearchParams(window.location.search).get("id");
    window.location.href = `./adminPage.html?id=${groupId}`;
  });
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!groupId) return;

  const res = await apiFetch(`${API_BASE}/groups/edit/${groupId}/admin`, {
    method: "GET",
    credentials: "include",
  });
  if (res.ok) {
    document.body.classList.remove("loading");
  } else {
    alert("something went wrong");
  }
  const data = await res.json();
  const issueImg = document.querySelector(".groupImg");
  document.getElementById("uploadBox").style.padding = "0";
  issueImg.src = data.groupInfo.image.url;
  document.querySelectorAll(".remove-this").forEach((el) => {
    el.style.display = "none";
  });
  const groupDetails = data.groupInfo;
  //insert data
  const groupName = document.getElementById("exampleFormControlInput1");
  const groupDescription = document.getElementById(
    "exampleFormControlTextarea1",
  );

  const joinApproval = document.getElementById("join-approval");
  const imageUploadPermission = document.getElementById("image-upload");
  groupName.value = groupDetails.groupname;
  groupDescription.innerText = groupDetails.description;
  joinApproval.value = groupDetails.joinType;
  imageUploadPermission.value = groupDetails.imageuploadpermission;
});

//updation
const createGroupForm = document.querySelector("#create-group-form");
createGroupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    alert("server not working");
    document.body.classList.remove("loading");
  }
  document.body.classList.add("loading");
  const groupId = new URLSearchParams(window.location.search).get("id");

  const formData = new FormData();

  formData.append("groupname", createGroupForm.groupname.value);
  formData.append("description", createGroupForm.description.value);
  formData.append("joinapproval", createGroupForm.joinapproval.value);
  formData.append(
    "imageuploadpermission",
    JSON.parse(createGroupForm.imageuploadpermission.value),
  );

  // append image ONLY if selected
  const file = document.getElementById("group-profile").files[0];
  if (file) {
    formData.append("group-profile", file);
  }
  const res = await apiFetch(`${API_BASE}/groups/update/${groupId}/admin`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });
  if (res.ok) {
    window.location.href = `./adminPage.html?id=${groupId}`;
  }
  if (!res.ok) {
    document.body.classList.remove("loading");
    alert("something went wrong");
  }
});

//drag and drop
const uploadBox = document.getElementById("uploadBox");
const fileInput = document.getElementById("group-profile");

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
  }
});
// Handle drop
uploadBox.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    fileInput.files = e.dataTransfer.files;
    const issueImg = document.querySelector(".groupImg");
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
    const issueImg = document.querySelector(".groupImg");
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
