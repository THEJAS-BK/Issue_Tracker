import { apiFetch } from "../../utils/helper.js";
import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
//create group option
document.addEventListener("DOMContentLoaded", () => {
  const createGroupForm = document.querySelector("#create-group-form");
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await apiFetch(`${API_BASE}/groups/create`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        groupname: createGroupForm.groupname.value,
        description: createGroupForm.description.value,
        joinapproval: createGroupForm.joinapproval.value,
        imageuploadpermission:createGroupForm.imageuploadpermission.value,
      }),
    });
      if(res.ok){
          window.location.href="/frontend/dashboard/user/userpage.html"
      }
  });
});
