/* =========================
   ACADEMIC PAGE JS
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const publicationsSection = document.getElementById("publication-record")
    || document.getElementById("publications");
  const navPills = document.querySelectorAll(".nav-pills .pill");
  const sections = [...document.querySelectorAll(".page-hero[id], section[id]")];

  if (!publicationsSection || !navPills.length || !sections.length) return;

  document.documentElement.classList.add("js");

  /* --------------------------------------------------
     PUBLICATION ENHANCEMENTS
  -------------------------------------------------- */

  const publicationGroups = [...publicationsSection.querySelectorAll(".pub-year-group")]
    .map((group, originalIndex) => {
      const heading = group.querySelector("h3");
      const year = Number.parseInt(heading?.textContent?.trim() || "0", 10) || 0;
      const items = [...group.querySelectorAll(".pub")].map(pub => ({
        element: pub,
        type: /biorxiv|preprint/i.test(pub.textContent) ? "preprint" : "peer"
      }));

      return {
        element: group,
        year,
        originalIndex,
        items
      };
    });

  let currentType = "all";
  let sortOrder = "desc";

  const enhancePublicationDetails = () => {
    publicationGroups.forEach(({ items }) => {
      items.forEach(({ element }, index) => {
        const details = [...element.children].find(child => child.tagName === "P");

        if (!details || details.classList.contains("pub-details")) return;

        const lineBreak = document.createElement("br");
        const toggle = document.createElement("button");
        const detailsId = `pub-details-${index}-${Math.abs(details.textContent.length)}`;

        details.classList.add("pub-details");
        details.id = detailsId;
        details.style.display = "none";

        toggle.type = "button";
        toggle.className = "pub-toggle";
        toggle.textContent = "Show details";
        toggle.setAttribute("aria-controls", detailsId);
        toggle.setAttribute("aria-expanded", "false");

        toggle.addEventListener("click", () => {
          const isOpen = details.style.display === "block";

          details.style.display = isOpen ? "none" : "block";
          toggle.textContent = isOpen ? "Show details" : "Hide details";
          toggle.setAttribute("aria-expanded", String(!isOpen));
        });

        element.insertBefore(lineBreak, details);
        element.insertBefore(toggle, details);
      });
    });
  };

  const insertPublicationControls = () => {
    if (!publicationGroups.length || publicationsSection.querySelector(".pub-controls")) return;

    const controls = document.createElement("div");
    const filterWrap = document.createElement("div");
    const sortWrap = document.createElement("div");
    const sortLabel = document.createTextNode("Sort:");
    const sortButton = document.createElement("button");
    const anchor = publicationsSection.querySelector(".publication-record-intro")
      || publicationsSection.querySelector("p")
      || publicationsSection.querySelector("h2");

    controls.className = "pub-controls";

    [
      ["all", "All"],
      ["peer", "Peer-reviewed"],
      ["preprint", "Preprints"]
    ].forEach(([type, label]) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "type-btn";
      button.dataset.type = type;
      button.textContent = label;

      button.addEventListener("click", () => {
        currentType = type;
        updatePublicationState();
      });

      filterWrap.appendChild(button);
    });

    sortButton.type = "button";
    sortButton.id = "sort-toggle";
    sortButton.addEventListener("click", () => {
      sortOrder = sortOrder === "desc" ? "asc" : "desc";
      updatePublicationState();
    });

    sortWrap.appendChild(sortLabel);
    sortWrap.appendChild(sortButton);

    controls.appendChild(filterWrap);
    controls.appendChild(sortWrap);

    anchor?.insertAdjacentElement("afterend", controls);
  };

  const updatePublicationState = () => {
    const filterButtons = publicationsSection.querySelectorAll(".type-btn");
    const sortButton = publicationsSection.querySelector("#sort-toggle");
    const sortedGroups = [...publicationGroups].sort((a, b) => {
      if (a.year === b.year) {
        return a.originalIndex - b.originalIndex;
      }

      return sortOrder === "desc" ? b.year - a.year : a.year - b.year;
    });

    sortedGroups.forEach(({ element }) => {
      publicationsSection.appendChild(element);
    });

    publicationGroups.forEach(({ element, items }) => {
      let visibleCount = 0;

      items.forEach(({ element: pub, type }) => {
        const isVisible = currentType === "all" || currentType === type;

        pub.style.display = isVisible ? "block" : "none";
        visibleCount += isVisible ? 1 : 0;
      });

      element.style.display = visibleCount ? "" : "none";
    });

    filterButtons.forEach(button => {
      button.classList.toggle("active", button.dataset.type === currentType);
    });

    if (sortButton) {
      sortButton.textContent = sortOrder === "desc" ? "Newest first" : "Oldest first";
    }
  };

  enhancePublicationDetails();
  insertPublicationControls();
  updatePublicationState();

  /* --------------------------------------------------
     HASH SCROLL
  -------------------------------------------------- */

  function scrollToHash() {
    const hash = window.location.hash;

    if (!hash) return;

    const target = document.querySelector(hash);

    if (!target) return;

    const headerOffset = 100;
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }

  setTimeout(scrollToHash, 150);
  window.addEventListener("hashchange", scrollToHash);

  /* --------------------------------------------------
     SCROLL SPY
  -------------------------------------------------- */

  const updateActivePill = () => {
    const pos = window.scrollY + 140;
    let current = sections[0]?.id || "";

    sections.forEach(section => {
      if (pos >= section.offsetTop) {
        current = section.id;
      }
    });

    if (current === "publication-record") {
      current = "publications";
    }

    navPills.forEach(pill => {
      pill.classList.toggle("active", pill.getAttribute("href") === `#${current}`);
    });
  };

  updateActivePill();
  window.addEventListener("scroll", updateActivePill, { passive: true });

});
