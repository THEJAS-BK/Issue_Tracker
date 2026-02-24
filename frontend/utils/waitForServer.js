import { sendApiBase } from "../../utils/apiBase.js";
const API_BASE = sendApiBase();
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
export async function waitForServer(maxWait = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`${API_BASE}/hel`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) return true;
    } catch (err) {
      continue;
    }
    await sleep(3000);
  }
  throw new Error("Server did not respond within the timeout period");
}
