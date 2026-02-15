/* =========================
   GLOBAL SITE JS (PRO)
========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     ELEMENT REFERENCES
  ====================== */

  const body = document.body;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("menuOverlay");
  const backToTop = document.getElementById("back-to-top");

  /* =====================
     SAFE GUARD
  ====================== */

  const hasMobileMenu = toggle && menu && overlay;

  /* =====================
     MOBILE MENU SYSTEM
  ====================== */

  if (hasMobileMenu) {

    const openMenu = () => {
      menu.classList.add("open");
      overlay.classList.add("active");
      body.classList.add("no-scroll");
      toggle.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
      menu.classList.remove("open");
      overlay.classList.remove("active");
      body.classList.remove("no-scroll");
      toggle.setAttribute("aria-expanded", "false");
    };

    const toggleMenu = () => {
      const isOpen = menu.classList.contains("open");
      isOpen ? closeMenu() : openMenu();
    };

    /* Click hamburger */
    toggle.addEventListener("click", toggleMenu);

    /* Click overlay */
    overlay.addEventListener("click", closeMenu);

    /* Click any link inside menu */
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    /* Close with ESC key */
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    /* Auto-reset if resizing to desktop */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 600) {
        closeMenu();
      }
    });
  }

  /* =====================
     BACK TO TOP BUTTON
  ====================== */

  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 400);
    });
  }

  /* =====================
     SECTION FADE-IN
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
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    document.querySelectorAll("section").forEach(section => {
      observer.observe(section);
    });
  }

});
