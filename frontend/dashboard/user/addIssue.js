//!add issue tab
const addIssueForm = document.querySelector(".issue-form")
addIssueForm.addEventListener("submit",async (e)=>{    
  e.preventDefault();
  const res = await fetch("http://localhost:8080/add",{
    method:"POST",
    headers:{"Content-type":"application/json"},
    body:JSON.stringify({
        title:addIssueForm.title.value,
        description:addIssueForm.description.value,
        category:addIssueForm.category.value,
        priority:addIssueForm.priority.value
    }),
    credentials:"include"
  })
  if(!res.ok)return;

    if(res.ok){
        window.location.href="/frontend/dashboard/user/groupInterface.html"
    }
})  