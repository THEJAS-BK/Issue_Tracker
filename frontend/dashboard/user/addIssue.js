import { apiFetch } from "../../utils/helper.js";
//!add issue tab
const addIssueForm = document.querySelector(".issue-form");
addIssueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const res = await apiFetch("http://localhost:8080/add",
  {
    method: "POST",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: addIssueForm.title.value,
      description: addIssueForm.description.value,
      category: addIssueForm.category.value,
      groupId:new URLSearchParams(window.location.search).get("id")
    }),
  });
  if (res.ok) {
    window.location.href = "/frontend/dashboard/user/groupInterface.html?id="+new URLSearchParams(window.location.search).get("id");
  }
});
