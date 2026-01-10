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
signupForm.addEventListener("submit",async (e)=>{
    e.preventDefault();
    const res = await fetch("http://localhost:8080/signup",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            name:signupForm.name.value,
            email:signupForm.email.value,
            password:signupForm.password.value
        })
    })
    const data = await res.json();
    if(data.success===true){
        window.location.href="/frontend/auth/index.html"
    }
    else{   
        alert("Something went wrong")
        window.location.reload();
    }
})