import { apiFetch } from "../../utils/helper.js";
//!add issue tab
const addIssueForm = document.querySelector(".issue-form");
addIssueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = await apiFetch(`http://localhost:8080/add/${new URLSearchParams(window.location.search).get("id")}`,
  {
    method: "POST",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: addIssueForm.title.value,
      description: addIssueForm.description.value,
      category: addIssueForm.category.value,
    }),
  });
  if (res.ok) {
    window.location.href = "/frontend/dashboard/user/groupInterface.html?id="+new URLSearchParams(window.location.search).get("id");
  }
});
const cancelBtn = document.querySelector(".cancel")
cancelBtn.addEventListener("click",()=>{
  window.location.href="/frontend/dashboard/user/groupInterface.html?id="+new URLSearchParams(window.location.search).get("id")
})