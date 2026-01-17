async function apiFetch(url, options = {}, retired = false) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });
  if (res.status === 401 && !retired) {
    const refresh = await fetch("http://localhost:8080/refreshtoken", {
      method: "POST",
      credentials: "include",
    });
    if (!refresh.ok) {
      window.location.href = "/frontend/auth/index.html";
      return;
    }
    return apiFetch(url, options, true);
  }
  return res;
}
//create group option
document.addEventListener("DOMContentLoaded", () => {
  const createGroupForm = document.querySelector("#create-group-form");
  createGroupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await apiFetch("http://localhost:8080/creategroup", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        groupname: createGroupForm.groupname.value,
        description: createGroupForm.description.value,
        category: createGroupForm.category.value,
        visibility: createGroupForm.visibility.value,
        joinapproval: createGroupForm.joinapproval.value,
      }),
    });
    if(!res.ok)return;

      if(res.ok){
          window.location.href="/frontend/dashboard/user/userpage.html"
      }
  });
});
