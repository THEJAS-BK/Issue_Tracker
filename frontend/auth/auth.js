// Signup page code

import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
import { toast } from "../utils/toast.js";
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
    toast("App not working", "error");
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
    signupForm.classList.add("was-validated");
    document.body.classList.add("loading");
    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      toast("Server not working", "error");

      document.body.classList.remove("loading");
    }
      const email = document.querySelector("#signupemail").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast("Enter a valid email", "error");
      return;
    }
    document.body.classList.add("loading");
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
    if (res.status === 409) {
      toast("Email already exist", "error");
      document.body.classList.remove("loading");
      return;
    }
    if (data.success) {
      document.body.classList.remove("loading");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/dashboard/user/userpage.html";
    } else {
      toast("Something went wrong", "error");
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

    const email = document.querySelector("#loginemail").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast("Enter a valid email", "error");
      return;
    }

    const isServerOnline = await waitForServer();
    if (isServerOnline) {
      document.body.classList.remove("loading");
    } else {
      toast("Server not working", "error");
      document.body.classList.remove("loading");
    }
    document.body.classList.add("loading");

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
      toast("User not found", "error");
      return;
    } else if (res.ok) {
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/dashboard/user/userpage.html";
    } else {
      alert("server not working");
    }
  });
}
