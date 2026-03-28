/* =========================================
   GLOBAL SITE JS (PRODUCTION SAFE)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("menuOverlay");
  const backToTop = document.getElementById("back-to-top");

  /* =========================================
     MOBILE MENU SYSTEM
  ========================================= */

  if (toggle && menu && overlay) {

    // Accessibility baseline
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "mobileMenu");

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
      menu.classList.contains("open")
        ? closeMenu()
        : openMenu();
    };

    /* Hamburger click */
    toggle.addEventListener("click", toggleMenu);

    /* Overlay click */
    overlay.addEventListener("click", closeMenu);

    /* Close on link click */
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    /* ESC key */
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeMenu();
    });

    /* Auto close if resizing to desktop */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 600) closeMenu();
    });

  } else {
    console.warn("Mobile menu elements not found on this page.");
  }

  /* =========================================
     BACK TO TOP
  ========================================= */

  if (backToTop) {
    window.addEventListener("scroll", () => {
      const show = window.scrollY > 400;
      backToTop.classList.toggle("visible", show);
    });
  }

  /* =========================================
     FADE IN SECTIONS
  ========================================= */

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // performance boost
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
/* =========================================
   LIGHTBOX (TALK IMAGES + NAVIGATION)
========================================= */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const lightboxClose = document.querySelector(".lightbox-close");

if (lightbox && lightboxImg) {
lightboxImg.addEventListener("click", nextImage);
  let images = [];
  let currentIndex = 0;

  const imageElements = document.querySelectorAll(".talk-images img");

  /* ========= OPEN ========= */
  imageElements.forEach((img, index) => {

    img.addEventListener("click", () => {

      images = Array.from(imageElements);
      currentIndex = index;

      const temp = new Image();
      temp.src = img.src;

      const openLightbox = () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || "";
        lightbox.classList.add("active");
        document.body.classList.add("no-scroll");
      };

      temp.onload = openLightbox;
      temp.onerror = openLightbox;

    });

  });

  /* ========= NAVIGATION ========= */
  const showImage = (index) => {
    const img = images[index];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
  };

  const nextImage = () => {
  if (!images.length) return;
  currentIndex = (currentIndex + 1) % images.length;
  showImage(currentIndex);
};

const prevImage = () => {
  if (!images.length) return;
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showImage(currentIndex);
};

  /* ========= CLOSE ========= */
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.classList.remove("no-scroll");
  };

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ========= KEYBOARD ========= */
  document.addEventListener("keydown", (e) => {

    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();

    if (e.key === "ArrowRight") nextImage();

    if (e.key === "ArrowLeft") prevImage();

  });

}

});
