import { apiFetch } from "../../utils/helper.js";
import { sendApiBase } from "../../utils/apiBase.js";
import { waitForServer } from "../../utils/waitForServer.js";
const API_BASE = sendApiBase();
import { toast } from "../../utils/toast.js";
function logOut() {
  const logOutBtn = document.querySelector(".logout-btn");
  logOutBtn.addEventListener("click", async () => {
    const res = await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/index.html";
    }
    if (!res.ok) {
      toast("Logout failed", "error");
    }
  });
}
let compressedGroupImage = null;
async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;

  // don't compress already small images
  if (file.size < 1 * 1024 * 1024) return file;

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    initialQuality: 0.9,
    useWebWorker: true,
  };

  try {
    document.body.classList.add("loading");

    const compressed = await imageCompression(file, options);

    document.body.classList.remove("loading");

    return compressed;
  } catch (err) {
    document.body.classList.remove("loading");
    console.error(err);
    return file;
  }
}
//create group option
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
  document.querySelector(".groupImg").style.display = "none";
  const name = document.querySelector(".get-user-name");
  const nameRes = await apiFetch(`${API_BASE}/auth/getusername`, {
    method: "GET",
  });
  const nameData = await nameRes.json();
  name.textContent = nameData.username;
  const createGroupForm = document.querySelector("#create-group-form");

  createGroupForm.addEventListener("submit", async (e) => {
    if (!createGroupForm.checkValidity()) {
      e.preventDefault();
      createGroupForm.classList.add("was-validated");
      return;
    }
    e.preventDefault();
    createGroupForm.classList.add("was-validated");
    document.body.classList.add("loading");
    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      toast("Server not working", "error");

      document.body.classList.remove("loading");
    }
    document.body.classList.add("loading");
    const formData = new FormData();
    formData.append("groupname", createGroupForm.groupname.value);
    formData.append("description", createGroupForm.description.value);
    formData.append("joinapproval", createGroupForm.joinapproval.value);
    formData.append(
      "imageuploadpermission",
      JSON.parse(createGroupForm.imageuploadpermission.value),
    );
    // image input
   if (!compressedGroupImage) {
  toast("Group image is required", "error");
  document.body.classList.remove("loading");
  return;
}

formData.append("group-profile", compressedGroupImage);

    const res = await apiFetch(`${API_BASE}/groups/create`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      document.body.classList.remove("loading");
      window.location.href = "./userpage.html";
    }
    if (!res.ok) {
      toast("Something went wrong","error");
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
uploadBox.addEventListener("drop", async (e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;

  compressedGroupImage = await compressImage(file);

  document.querySelector(".groupImg").style.display = "flex";

  const issueImg = document.querySelector(".groupImg");
  document.getElementById("uploadBox").style.padding = "0";
  issueImg.src = URL.createObjectURL(compressedGroupImage);

  document.querySelectorAll(".remove-this").forEach((el) => {
    el.style.display = "none";
  });
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  compressedGroupImage = await compressImage(file);

  document.querySelector(".groupImg").style.display = "flex";

  const issueImg = document.querySelector(".groupImg");
  document.getElementById("uploadBox").style.padding = "0";
  issueImg.src = URL.createObjectURL(compressedGroupImage);

  document.querySelectorAll(".remove-this").forEach((el) => {
    el.style.display = "none";
  });
});

document.querySelector(".username").addEventListener("click", (e) => {
  const dropdown = document.querySelector(".dropdown-user");
  dropdown.classList.toggle("hidden");
});
