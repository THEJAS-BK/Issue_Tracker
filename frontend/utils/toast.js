export function toast(message, type = "info") {

  let container = document.getElementById("toast-container");

  // SPA safety (in case layout reloads)
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;

  container.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.add("show");
  });

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}