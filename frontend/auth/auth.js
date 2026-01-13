// Signup page code
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
    e.preventDefault();
    const res = await fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signupForm.name.value,
        email: signupForm.email.value,
        password: signupForm.password.value,
      }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.href = "/frontend/auth/index.html";
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
    const res = await fetch("http://localhost:8080/login", {
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
    } else if (res.status === 200) {
      sendTestData();
      // window.location.href="/frontend/dashboard/user/userpage.html";
    } else {
      alert("server not working");
    }
  });
}
async function sendTestData(){
 fetch("http://localhost:8080/test",{
    method:"GET",
    credentials:"include",
  })
  setTimeout(async()=>{
    console.log("accessing after 15 sec")
    const res = await fetch("http://localhost:8080/test",{
    method:"GET",
    credentials:"include",
  })
  console.log(res)
  },15000)
}