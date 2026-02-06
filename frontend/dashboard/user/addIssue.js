//!add issue tab
const addIssueForm = document.querySelector(".issue-form");
addIssueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  async function sendAddReq() {
    return await fetch("http://localhost:8080/add", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: addIssueForm.title.value,
        description: addIssueForm.description.value,
        category: addIssueForm.category.value,
        priority: addIssueForm.priority.value,
      }),
    });
  }

  let res =await sendAddReq();

  if (res.status === 403) {
    const resfreshRes = fetch("http://localhost:8080/auth/refreshtoken", {
      method: "POST",
      credentials: "include",
    });
    if(!resfreshRes.ok){
      window.location.redirect="/frontend/auth/index.html"
    }
    else{
      res
    }
  }
  if (!res.ok) return;

  if (res.ok) {
    window.location.href = "/frontend/dashboard/user/groupInterface.html";
  }
});
