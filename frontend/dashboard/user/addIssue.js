import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
//!add issue tab
const addIssueForm = document.querySelector(".issue-form");
addIssueForm.addEventListener("submit", async (e) => {
  const groupId=new URLSearchParams(window.location.search).get("id");
  if(!groupId) {
    alert("Invalid group ID");
    return;
  }
  e.preventDefault();
  const anonSwitch = document.getElementById("anonymousSwitch").checked;
  const res = await apiFetch(`${API_BASE}/issues/add/${groupId}`,
  {
    method: "POST",
    headers: { "Content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      title: addIssueForm.title.value,
      description: addIssueForm.description.value,
      stayAnonymous:anonSwitch
    }),
  });
  if (res.ok) {
    window.location.href = "./groupInterface.html?id="+groupId;
  }
});
const cancelBtn = document.querySelector(".cancel")
cancelBtn.addEventListener("click",()=>{
  window.location.href="./groupInterface.html?id="+groupId
})