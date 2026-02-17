import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!groupId) return;

  const res = await apiFetch(
    `http://localhost:8080/groups/edit/${groupId}/admin`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  const data = await res.json();
  const groupDetails = data.groupInfo;
  //insert data
  const groupName = document.getElementById("exampleFormControlInput1");
  const groupDescription = document.getElementById(
    "exampleFormControlTextarea1",
  );

  const joinApproval = document.getElementById("join-approval");
  const imageUploadPermission = document.getElementById("image-upload");
  groupName.value = groupDetails.groupname;
  groupDescription.innerText = groupDetails.description;
  joinApproval.value = groupDetails.joinType;
  imageUploadPermission.value = groupDetails.imageuploadpermission;
});

//updation
const createGroupForm = document.querySelector("#create-group-form");
createGroupForm.addEventListener("submit", async (e) => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  e.preventDefault();
  const res = await apiFetch(
    `http://localhost:8080/groups/update/${groupId}/admin`,
    {
      method: "PATCH",
      headers: {
        "Content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        groupname: createGroupForm.groupname.value,
        description: createGroupForm.description.value,
        joinapproval: createGroupForm.joinapproval.value,
        imageuploadpermission: createGroupForm.imageuploadpermission.value,
      }),
    },
  );
  if (res.ok) {
    window.location.href = `/frontend/dashboard/admin/adminPage.html?id=${groupId}`;
  }
});
//cancel btn
document.querySelector(".cancel-update").addEventListener("click", () => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  window.location.href = `/frontend/dashboard/admin/adminPage.html?id=${groupId}`;
});
