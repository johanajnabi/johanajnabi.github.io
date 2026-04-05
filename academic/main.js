/* =========================
   ACADEMIC PAGE JS
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const publicationsSection = document.getElementById("publications")
    || document.getElementById("publication-record");

  if (!publicationsSection) return;

  const groupsContainer = publicationsSection.querySelector(".pub-groups") || publicationsSection;
  const publicationGroups = [...groupsContainer.querySelectorAll(".pub-year-group")]
    .map((group, originalIndex) => {
      const heading = group.querySelector("h3");
      const year = Number.parseInt(heading?.textContent?.trim() || "0", 10) || 0;
      const items = [...group.querySelectorAll(".pub")].map((pub) => ({
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

  if (!publicationGroups.length) return;

  let currentType = "all";
  let sortOrder = "desc";

  /* =========================
     PUBLICATION DETAIL TOGGLES
  ========================= */

  const enhancePublicationDetails = () => {
    publicationGroups.forEach(({ items }) => {
      items.forEach(({ element }, index) => {
        const details = [...element.children].find((child) => child.tagName === "P");

        if (!details || details.classList.contains("pub-details")) return;

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

        element.insertBefore(toggle, details);
      });
    });
  };

  /* =========================
     FILTER + SORT CONTROLS
  ========================= */

  const insertPublicationControls = () => {
    if (publicationsSection.querySelector(".pub-controls")) return;

    const controls = document.createElement("div");
    const filterWrap = document.createElement("div");
    const sortWrap = document.createElement("div");
    const sortLabel = document.createElement("span");
    const sortButton = document.createElement("button");
    const anchor = publicationsSection.querySelector(".publication-record-intro")
      || publicationsSection.querySelector("h2");

    controls.className = "pub-controls";
    sortLabel.textContent = "Sort:";

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

  /* =========================
     FILTER STATE
  ========================= */

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
      groupsContainer.appendChild(element);
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

    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.type === currentType);
    });

    if (sortButton) {
      sortButton.textContent = sortOrder === "desc" ? "Newest first" : "Oldest first";
    }
  };

  enhancePublicationDetails();
  insertPublicationControls();
  updatePublicationState();
});
