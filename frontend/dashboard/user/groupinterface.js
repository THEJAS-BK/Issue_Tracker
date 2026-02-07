document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
 const id = params.get("id");

  //add issues
  const addIssueBtn = document.querySelector(".addIssue-btn");
  addIssueBtn.addEventListener("click", () => {
        window.location.href=`/frontend/dashboard/user/addIssue.html?id=${id}`
  });
});
