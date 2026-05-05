document.body.classList.add("is-loading");

const siteLoader = document.querySelector(".site-loader");

function hideLoader() {
  document.body.classList.remove("is-loading");
  if (!siteLoader) {
    return;
  }
  siteLoader.classList.add("is-hidden");
  window.setTimeout(() => {
    siteLoader.remove();
  }, 420);
}

window.addEventListener("load", () => {
  window.setTimeout(hideLoader, 720);
});

window.setTimeout(hideLoader, 1800);

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

if (menuToggle && siteNav) {
  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
  }

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}
