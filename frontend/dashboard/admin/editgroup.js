import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
document.addEventListener("DOMContentLoaded", async () => {
  //cancel btn
document.querySelector(".cancel-update").addEventListener("click", () => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  window.location.href = `./adminPage.html?id=${groupId}`;
});
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!groupId) return;

  const res = await apiFetch(
    `${API_BASE}/groups/edit/${groupId}/admin`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
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
  const groupId = new URLSearchParams(window.location.search).get("id");
  e.preventDefault();
  const res = await apiFetch(
    `${API_BASE}/groups/update/${groupId}/admin`,
    {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        groupname: createGroupForm.groupname.value,
        description: createGroupForm.description.value,
        joinapproval: createGroupForm.joinapproval.value,
        imageuploadpermission: createGroupForm.imageuploadpermission.value,
      }),
    },
  );
  if (res.ok) {
    window.location.href = `./adminPage.html?id=${groupId}`;
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