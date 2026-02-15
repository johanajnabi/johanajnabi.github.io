/* =========================
   GLOBAL SITE JS
========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     MOBILE MENU
  ====================== */

  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("menuOverlay");

  if (toggle && menu && overlay) {

    toggle.addEventListener("click", () => {
      menu.classList.toggle("open");
      overlay.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });

    overlay.addEventListener("click", () => {
      menu.classList.remove("open");
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        overlay.classList.remove("active");
        document.body.classList.remove("no-scroll");
      });
    });
  }

  /* =====================
     BACK TO TOP
  ====================== */

  const backToTop = document.getElementById("back-to-top");

  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    });
  }

  /* =====================
     FADE-IN (OPTIONAL)
  ====================== */

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("section").forEach(section => {
      observer.observe(section);
    });
  }

});
