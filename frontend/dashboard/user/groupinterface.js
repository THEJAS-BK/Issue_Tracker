document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
   console.log(params.get("id"))
});