// Signup page code
//--------------------
// show password toggle
const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("signuppassword");
toggle.addEventListener("change",()=>{
    passwordInput.type=toggle.checked?"text":"password"
})
//form success validations
const signupForm = document.getElementById("signUpForm")
signupForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    console.log("submit successful")
})