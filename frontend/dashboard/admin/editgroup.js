import { apiFetch } from "../../utils/helper.js";
document.addEventListener("DOMContentLoaded", async () => {
  const groupId = new URLSearchParams(window.location.search).get("id");
  if (!groupId) return;

  const res = await apiFetch(
    `http://localhost:8080/api/edit/group/${groupId}/admin`,
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
  const groupVisbility = document.getElementById("visiblity");
  const joinApproval = document.getElementById("join-approval");
  const imageUploadPermission = document.getElementById("image-upload");

  groupName.value = groupDetails.groupname;
  groupDescription.innerText = groupDetails.description;
  groupVisbility.value = groupDetails.visibility;
  joinApproval.value = groupDetails.joinType;
  imageUploadPermission.value = groupDetails.imageuploadpermission;
});
