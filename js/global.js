/* =========================================
   GLOBAL SITE JS (PRODUCTION SAFE)
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

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
     BEYOND GALLERY AUTOLOAD
  ========================================= */

  const captureGallery = document.querySelector(".capture-gallery[data-autoload]");

  if (captureGallery) {
    const emptyState = document.querySelector(".capture-empty");
    const previewFigure = document.querySelector(".capture-preview-figure");
    const previewImage = document.querySelector(".capture-preview-img[data-autopreview]");
    const galleryData = document.getElementById("beyond-gallery-data");
    const basePath = captureGallery.dataset.basePath || "/assets/beyond";
    const extensions = (captureGallery.dataset.extensions || "png,jpg,jpeg,webp")
      .split(",")
      .map(ext => ext.trim())
      .filter(Boolean);
    const maxItems = Number.parseInt(captureGallery.dataset.maxItems || "24", 10) || 24;
    let metadataMap = new Map();

    if (galleryData) {
      try {
        const parsed = JSON.parse(galleryData.textContent || "[]");
        metadataMap = new Map(parsed.map(item => [item.file, item]));
      } catch (error) {
        console.warn("Beyond gallery metadata could not be parsed.", error);
      }
    }

    const escapeHtml = (value = "") => String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const findImageSource = (index) => new Promise(resolve => {
      let pointer = 0;

      const tryNext = () => {
        if (pointer >= extensions.length) {
          resolve(null);
          return;
        }

        const src = `${basePath}/${index}.${extensions[pointer]}`;
        const probe = new Image();

        probe.onload = () => resolve(src);
        probe.onerror = () => {
          pointer += 1;
          tryNext();
        };
        probe.src = src;
      };

      tryNext();
    });

    const fragment = document.createDocumentFragment();
    let foundCount = 0;
    let firstFoundSrc = "";

    for (let index = 1; index <= maxItems; index += 1) {
      const src = await findImageSource(index);

      if (!src) break;

      foundCount += 1;
      if (!firstFoundSrc) firstFoundSrc = src;

      const frame = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("span");
      const detail = document.createElement("figcaption");
      const frameLabel = `Frame ${String(index).padStart(2, "0")}`;
      const filename = src.split("/").pop() || "";
      const metadata = metadataMap.get(filename) || {};
      const commonName = String(metadata.common || "").trim();
      const scientificName = String(metadata.scientific || "").trim();
      const location = String(metadata.location || "").trim();
      const note = String(metadata.note || "").trim();
      const speciesLabel = commonName || frameLabel;
      const captionHtml = commonName
        ? `${escapeHtml(commonName)}${scientificName ? ` <em>(${escapeHtml(scientificName)})</em>` : ""}${location ? ` · ${escapeHtml(location)}` : ""}`
        : frameLabel;
      const lightboxCaption = note
        ? `${captionHtml}<span class="lightbox-note">${escapeHtml(note)}</span>`
        : captionHtml;

      frame.className = "talk-img-wrap capture-frame";
      frame.tabIndex = 0;
      frame.dataset.lightboxCaption = lightboxCaption;
      frame.setAttribute("role", "button");
      frame.setAttribute("aria-label", `Open ${speciesLabel} in lightbox`);

      image.src = src;
      image.alt = commonName
        ? `${commonName}${scientificName ? ` (${scientificName})` : ""}${location ? `, ${location}` : ""}`
        : `Wildlife photograph ${index} by Johan Ajnabi`;
      image.loading = "lazy";

      caption.className = "talk-caption";
      caption.innerHTML = captionHtml;

      if (note) {
        detail.className = "capture-detail";
        detail.textContent = note;
      }

      frame.appendChild(image);
      frame.appendChild(caption);
      if (note) frame.appendChild(detail);
      fragment.appendChild(frame);
    }

    if (foundCount > 0) {
      captureGallery.appendChild(fragment);
      emptyState?.setAttribute("hidden", "");
      if (previewFigure && previewImage && firstFoundSrc) {
        previewImage.src = firstFoundSrc;
        previewFigure.hidden = false;
      }
    } else {
      emptyState?.removeAttribute("hidden");
    }
  }
/* =========================================
   LIGHTBOX (PRO+ : NAV + CAPTION + UX)
========================================= */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.querySelector(".lightbox-img");
const lightboxCaption = document.querySelector(".lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const btnNext = document.querySelector(".lightbox-next");
const btnPrev = document.querySelector(".lightbox-prev");

if (lightbox && lightboxImg) {

  /* ========= STATE ========= */
  let items = [];
  let currentIndex = 0;

  const wrappers = document.querySelectorAll(".talk-img-wrap");

  /* ========= INIT ========= */
  items = Array.from(wrappers).map(wrap => ({
    img: wrap.querySelector("img"),
    caption: wrap.dataset.lightboxCaption || wrap.querySelector(".talk-caption")?.innerHTML || ""
  }));

  /* ========= CORE ========= */

  const showImage = (index) => {
    const item = items[index];

    if (!item) return;

    // Smooth fade
    lightboxImg.style.opacity = 0;

    setTimeout(() => {
      lightboxImg.src = item.img.src;
      lightboxImg.alt = item.img.alt || "";
      lightboxCaption.innerHTML = item.caption;

      lightboxImg.style.opacity = 1;
    }, 120);
  };

  const openLightbox = (index) => {
    currentIndex = index;

    showImage(currentIndex);

    lightbox.classList.add("active");
    document.body.classList.add("no-scroll");

    // accessibility
    lightbox.setAttribute("aria-hidden", "false");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.classList.remove("no-scroll");

    lightbox.setAttribute("aria-hidden", "true");
  };

  const nextImage = () => {
    currentIndex = (currentIndex + 1) % items.length;
    showImage(currentIndex);
  };

  const prevImage = () => {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showImage(currentIndex);
  };

  /* ========= OPEN ========= */

  wrappers.forEach((wrap, index) => {
    const openFromWrapper = () => {

      const temp = new Image();
      temp.src = items[index].img.src;

      const safeOpen = () => openLightbox(index);

      temp.onload = safeOpen;
      temp.onerror = safeOpen;
    };

    wrap.addEventListener("click", openFromWrapper);
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFromWrapper();
      }
    });
  });

  /* ========= BUTTON NAV ========= */

  btnNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    nextImage();
  });

  btnPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    prevImage();
  });

  /* ========= IMAGE CLICK NAV ========= */

  lightboxImg.addEventListener("click", (e) => {
    e.stopPropagation();
    nextImage();
  });

  /* ========= CLOSE ========= */

  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* ========= KEYBOARD ========= */

  document.addEventListener("keydown", (e) => {

    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowRight":
        nextImage();
        break;
      case "ArrowLeft":
        prevImage();
        break;
    }

  });

}
   
});
