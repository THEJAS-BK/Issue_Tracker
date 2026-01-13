document.addEventListener("DOMContentLoaded",()=>{
    const val =fetch("http://localhost:8080/test",{
        credentials:"include"
    })
    console.log(val)
})