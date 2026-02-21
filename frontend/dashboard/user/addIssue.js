import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
//!add issue tab
const addIssueForm = document.querySelector(".issue-form");

document.addEventListener("DOMContentLoaded",async ()=>{
  const name=document.querySelector(".get-user-name")
  const nameRes=await apiFetch(`${API_BASE}/auth/getusername`,{
    method:"GET",
    credentials:"include"
  })
  const nameData=await nameRes.json()
  name.textContent=nameData.username;

  document.querySelector(".cancel-btn").addEventListener("click",()=>{
    const groupId=new URLSearchParams(window.location.search).get("id");
    window.location.href="./groupInterface.html?id="+groupId;
  })
})

addIssueForm.addEventListener("submit", async (e) => {
  const groupId=new URLSearchParams(window.location.search).get("id");
  if(!groupId) {
    alert("Invalid group ID");
    return;
  }
  e.preventDefault();
  const anonSwitch = document.getElementById("anonymousSwitch").checked;
  const res = await apiFetch(`${API_BASE}/issues/add/${groupId}`,
  {
    method: "POST",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: addIssueForm.title.value,
      description: addIssueForm.description.value,
      stayAnonymous:anonSwitch
    }),
  });
  if (res.ok) {
    window.location.href = "./groupInterface.html?id="+groupId;
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