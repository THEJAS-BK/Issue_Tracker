import {sendApiBase} from "../../utils/apiBase.js"
const API_BASE = sendApiBase();
export async function apiFetch(url, options = {},retry=true) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });
  if (res.status === 403&&retry) {
    const refresh = await fetch(`${API_BASE}/auth/refreshtoken`, {
      method: "POST",
      credentials: "include",
    });
    if(refresh.ok){
       return apiFetch(url,options,false)
    }
    window.location.href="/index.html"
  }
   if(res.status==401){
    window.location.href="/index.html"
    return;
  }
  return res;
}
