// Signup page code

const API_BASE = "https://issue-tracker-ro93.onrender.com"
// const API_BASE="http://localhost:8080"
//--------------------
// show password toggle
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("signuppassword")||document.getElementById("loginPassword")
  toggle.addEventListener("change", () => {
    passwordInput.type = toggle.checked ? "text" : "password";
  });
});

//Signup form success validations
const signupForm = document.getElementById("signUpForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    document.body.classList.add("loading"); 
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
      body: JSON.stringify({
        email: loginForm.email.value,
        password: loginForm.password.value,
      }),
    });
    if (res.status === 401) {
      alert("User not found");
    } else if (res.ok) {

      window.location.href="/dashboard/user/userpage.html";
    } else {
      alert("server not working");
    }
  });
}
