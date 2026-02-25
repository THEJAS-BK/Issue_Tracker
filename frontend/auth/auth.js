// Signup page code

import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
//--------------------
import { waitForServer } from "../utils/waitForServer.js";
// show password toggle
document.addEventListener("DOMContentLoaded", async () => {
  document.body.classList.add("loading");
  //intial server loading
  document.querySelector(".spinner-content").textContent =
    " The server might take longer to wake up initially";
  const isServerOnline = await waitForServer();
  if (isServerOnline) {
    document.body.classList.remove("loading");
    document.querySelector(".spinner-content").textContent = "Loading...";
  } else {
    alert("app not working");
    document.body.classList.remove("loading");
  }

  const toggle = document.getElementById("togglePassword");
  const passwordInput =
    document.getElementById("signuppassword") ||
    document.getElementById("loginPassword");
  toggle.addEventListener("change", () => {
    passwordInput.type = toggle.checked ? "text" : "password";
  });
});

//Signup form success validations
const signupForm = document.getElementById("signUpForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.body.classList.add("loading");
    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      alert("server not working");
      document.body.classList.remove("loading");
    }

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: signupForm.name.value,
        email: signupForm.email.value,
        password: signupForm.password.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      document.body.classList.remove("loading");
      window.location.href = "/dashboard/user/userpage.html";
    } else {
      alert("Something went wrong");
      window.location.reload();
    }
  });
}
//login form validations
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.body.classList.add("loading");

    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      alert("server not working");
      document.body.classList.remove("loading");
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: loginForm.email.value,
        password: loginForm.password.value,
      }),
    });
    if (res.status === 401) {
      document.body.classList.remove("loading");

      alert("User not found");
    } else if (res.ok) {
      window.location.href = "/dashboard/user/userpage.html";
    } else {
      alert("server not working");
    }
  });
}
