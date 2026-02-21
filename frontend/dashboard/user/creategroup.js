import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
//create group option
document.addEventListener("DOMContentLoaded",async () => {
  const name=document.querySelector(".get-user-name")
  const nameRes=await apiFetch(`${API_BASE}/auth/getusername`,{
    method:"GET",
    credentials:"include"
  })
  const nameData=await nameRes.json()
  name.textContent=nameData.username;
  const createGroupForm = document.querySelector("#create-group-form");
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await apiFetch(`${API_BASE}/groups/create`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        groupname: createGroupForm.groupname.value,
        description: createGroupForm.description.value,
        joinapproval: createGroupForm.joinapproval.value,
        imageuploadpermission:createGroupForm.imageuploadpermission.value,
      }),
    });
      if(res.ok){
          window.location.href="./userpage.html"
      }
  });
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