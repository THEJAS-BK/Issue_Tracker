import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
import { waitForServer } from "../../utils/waitForServer.js";
const API_BASE = sendApiBase();

function logOut() {
  const logOutBtn = document.querySelector(".logout-btn");
  logOutBtn.addEventListener("click", async () => {
    const res = await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      window.location.href = "/index.html";
    }
    if (!res.ok) {
      alert("logout failed");
    }
  });
}
//create group option
document.addEventListener("DOMContentLoaded", async () => {
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
  } else {
    alert("server not working");
    document.body.classList.remove("loading");
  }
  logOut();
  document.querySelector(".groupImg").style.display = "none";
  const name = document.querySelector(".get-user-name");
  const nameRes = await apiFetch(`${API_BASE}/auth/getusername`, {
    method: "GET",
    credentials: "include",
  });
  const nameData = await nameRes.json();
  name.textContent = nameData.username;
  const createGroupForm = document.querySelector("#create-group-form");

  createGroupForm.addEventListener("submit", async (e) => {
    if (!createGroupForm.checkValidity()) {
      e.preventDefault();
      e.stopPropagation();
      createGroupForm.classList.add("was-validated");
      return;
    }
    const file = document.getElementById("group-profile");
    if (file.files[0].size > 2 * 1024 * 1024) {
      alert("Max 2MB allowed");
      return;
    }
    e.preventDefault();
    createGroupForm.classList.add("was-validated");
    document.body.classList.add("loading");
    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      alert("server not working");
      document.body.classList.remove("loading");
    }
    const formData = new FormData();
    formData.append("groupname", createGroupForm.groupname.value);
    formData.append("description", createGroupForm.description.value);
    formData.append("joinapproval", createGroupForm.joinapproval.value);
    formData.append(
      "imageuploadpermission",
      JSON.parse(createGroupForm.imageuploadpermission.value),
    );
    // image input
    const fileInput = document.querySelector("#group-profile");
    if (!fileInput.files[0]) {
      alert("group image is required");
      document.body.classList.remove("loading");
      return;
    }
    formData.append("group-profile", fileInput.files[0]);

    const res = await apiFetch(`${API_BASE}/groups/create`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      document.body.classList.remove("loading");
      window.location.href = "./userpage.html";
    }
    if (!res.ok) {
      alert("something went wrong");
      document.body.classList.remove("loading");
    }
  });
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
    document.querySelector(".groupImg").style.display = "flex";

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
    document.querySelector(".groupImg").style.display = "flex";

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
