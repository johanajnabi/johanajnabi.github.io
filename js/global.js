/* =========================
   GLOBAL SITE JS
========================= */

document.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.classList.add("js");

  const body = document.body;
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("menuOverlay");
  const backToTop = document.getElementById("back-to-top");

  /* =========================
     NAV + MOBILE MENU
  ========================= */

  const setNavShadow = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 18);
  };

  setNavShadow();
  window.addEventListener("scroll", setNavShadow, { passive: true });

  if (toggle && menu && overlay) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "mobileMenu");

    const closeMenu = () => {
      menu.classList.remove("open");
      overlay.classList.remove("active");
      body.classList.remove("no-scroll");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      menu.classList.add("open");
      overlay.classList.add("active");
      body.classList.add("no-scroll");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
      if (menu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closeMenu();
      }
    });
  }

  /* =========================
     BACK TO TOP
  ========================= */

  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle("visible", window.scrollY > 420);
    };

    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
  }

  /* =========================
     REVEAL ANIMATION
  ========================= */

  const revealTargets = [...document.querySelectorAll(".reveal")];

  if ("IntersectionObserver" in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  /* =========================
     SECTION NAV ACTIVE STATE
  ========================= */

  document.querySelectorAll(".section-nav").forEach((navElement) => {
    const links = [...navElement.querySelectorAll('a[href^="#"]')];
    const sections = links
      .map((link) => ({
        link,
        target: document.querySelector(link.getAttribute("href"))
      }))
      .filter((item) => item.target);

    if (!sections.length) return;

    const updateActiveLink = () => {
      const marker = window.scrollY + 160;
      let current = sections[0];

      sections.forEach((item) => {
        if (marker >= item.target.offsetTop) {
          current = item;
        }
      });

      links.forEach((link) => {
        const isActive = current && link === current.link;
        link.classList.toggle("active", isActive);
        link.classList.toggle("is-active", isActive);
      });
    };

    updateActiveLink();
    window.addEventListener("scroll", updateActiveLink, { passive: true });
    window.addEventListener("hashchange", updateActiveLink);
  });

  /* =========================
     BEYOND GALLERY
  ========================= */

  const captureGallery = document.querySelector(".capture-gallery[data-autoload]");

  if (captureGallery) {
    const emptyState = document.querySelector(".capture-empty");
    const galleryData = document.getElementById("beyond-gallery-data");
    const basePath = captureGallery.dataset.basePath || "/assets/beyond";
    const extensions = (captureGallery.dataset.extensions || "webp,png,jpg,jpeg")
      .split(",")
      .map((extension) => extension.trim())
      .filter(Boolean);
    const maxItems = Number.parseInt(captureGallery.dataset.maxItems || "24", 10) || 24;

    let metadataEntries = [];
    let metadataMap = new Map();

    if (galleryData) {
      try {
        metadataEntries = JSON.parse(galleryData.textContent || "[]");
        metadataMap = new Map(
          metadataEntries.map((item) => [
            String(item.file || "").replace(/\.[^.]+$/, ""),
            item
          ])
        );
      } catch (error) {
        console.warn("Beyond gallery metadata could not be parsed.", error);
      }
    }

    const escapeHtml = (value = "") => String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    const findImageSource = (stem) => new Promise((resolve) => {
      let pointer = 0;

      const tryNext = () => {
        if (pointer >= extensions.length) {
          resolve(null);
          return;
        }

        const src = `${basePath}/${stem}.${extensions[pointer]}`;
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

    const galleryTargets = metadataEntries.length
      ? metadataEntries.map((item, originalIndex) => ({
          stem: String(item.file || `${originalIndex + 1}`).replace(/\.[^.]+$/, ""),
          index: originalIndex + 1
        }))
      : Array.from({ length: maxItems }, (_, offset) => ({
          stem: String(offset + 1),
          index: offset + 1
        }));

    const resolvedTargets = await Promise.all(
      galleryTargets.map(async (target) => ({
        ...target,
        src: await findImageSource(target.stem)
      }))
    );

    const fragment = document.createDocumentFragment();
    let foundCount = 0;

    for (const target of resolvedTargets) {
      const { stem, index, src } = target;
      if (!src) continue;

      foundCount += 1;

      const metadata = metadataMap.get(stem) || {};
      const commonName = String(metadata.common || "").trim();
      const scientificName = String(metadata.scientific || "").trim();
      const location = String(metadata.location || "").trim();
      const note = String(metadata.note || "").trim();
      const frameLabel = `Frame ${String(index).padStart(2, "0")}`;
      const speciesLabel = commonName || frameLabel;
      const captionHtml = commonName
        ? `${escapeHtml(commonName)}${scientificName ? ` <em>(${escapeHtml(scientificName)})</em>` : ""}${location ? ` &middot; ${escapeHtml(location)}` : ""}`
        : frameLabel;
      const lightboxCaption = note
        ? `${captionHtml}<span class="lightbox-note">${escapeHtml(note)}</span>`
        : captionHtml;

      const frame = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("figcaption");

      frame.className = "media-card lightbox-trigger";
      frame.tabIndex = 0;
      frame.setAttribute("role", "button");
      frame.setAttribute("aria-label", `Open ${speciesLabel} in lightbox`);
      frame.dataset.lightboxCaption = lightboxCaption;

      image.src = src;
      image.alt = commonName
        ? `${commonName}${scientificName ? ` (${scientificName})` : ""}${location ? `, ${location}` : ""}`
        : `Wildlife photograph ${index} by Johan Ajnabi`;
      image.loading = "lazy";
      image.decoding = "async";

      caption.className = "media-card__caption";
      caption.innerHTML = captionHtml;

      frame.appendChild(image);
      frame.appendChild(caption);

      if (note) {
        const detail = document.createElement("span");
        detail.className = "capture-detail";
        detail.textContent = note;
        frame.appendChild(detail);
      }

      fragment.appendChild(frame);
    }

    if (foundCount > 0) {
      captureGallery.appendChild(fragment);
      emptyState?.setAttribute("hidden", "");
    } else {
      emptyState?.removeAttribute("hidden");
    }
  }

  /* =========================
     LIGHTBOX
  ========================= */

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.querySelector(".lightbox-img");
  const lightboxCaption = document.querySelector(".lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxNext = document.querySelector(".lightbox-next");
  const lightboxPrev = document.querySelector(".lightbox-prev");

  if (lightbox && lightboxImg && lightboxCaption) {
    let currentIndex = 0;

    const collectItems = () => [...document.querySelectorAll(".lightbox-trigger")]
      .map((trigger) => ({
        trigger,
        image: trigger.querySelector("img"),
        caption: trigger.dataset.lightboxCaption
          || trigger.querySelector(".media-card__caption, .talk-caption")?.innerHTML
          || ""
      }))
      .filter((item) => item.image);

    const showImage = (index) => {
      const items = collectItems();
      const item = items[index];
      if (!item) return;

      lightboxImg.style.opacity = "0";

      window.setTimeout(() => {
        lightboxImg.src = item.image.src;
        lightboxImg.alt = item.image.alt || "";
        lightboxCaption.innerHTML = item.caption;
        lightboxImg.style.opacity = "1";
      }, 100);
    };

    const openLightbox = (index) => {
      const items = collectItems();
      if (!items.length) return;

      currentIndex = index;
      showImage(currentIndex);
      lightbox.classList.add("active");
      body.classList.add("no-scroll");
      lightbox.setAttribute("aria-hidden", "false");
    };

    const closeLightbox = () => {
      lightbox.classList.remove("active");
      body.classList.remove("no-scroll");
      lightbox.setAttribute("aria-hidden", "true");
    };

    const nextImage = () => {
      const items = collectItems();
      if (!items.length) return;
      currentIndex = (currentIndex + 1) % items.length;
      showImage(currentIndex);
    };

    const prevImage = () => {
      const items = collectItems();
      if (!items.length) return;
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      showImage(currentIndex);
    };

    const bindLightboxTriggers = () => {
      collectItems().forEach(({ trigger }) => {
        if (trigger.dataset.lightboxBound === "true") return;

        const openFromTrigger = () => {
          const items = collectItems();
          const index = items.findIndex((item) => item.trigger === trigger);
          if (index >= 0) openLightbox(index);
        };

        trigger.dataset.lightboxBound = "true";
        trigger.addEventListener("click", openFromTrigger);
        trigger.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFromTrigger();
          }
        });
      });
    };

    bindLightboxTriggers();

    lightboxClose?.addEventListener("click", closeLightbox);
    lightboxNext?.addEventListener("click", (event) => {
      event.stopPropagation();
      nextImage();
    });
    lightboxPrev?.addEventListener("click", (event) => {
      event.stopPropagation();
      prevImage();
    });

    lightboxImg.addEventListener("click", (event) => {
      event.stopPropagation();
      nextImage();
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("active")) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") prevImage();
    });

    const galleryObserver = new MutationObserver(() => {
      bindLightboxTriggers();
    });

    galleryObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});
