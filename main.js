/* =====================
   HELPERS
====================== */

// Highlight my name in author lists
function highlightAuthor(authors, nameRegex) {
  return authors.replace(nameRegex, match => `<strong>${match}</strong>`);
}

// Determine publication type
function getPubType(pub) {
  const j = pub.journal.toLowerCase();
  if (j.includes("biorxiv") || j.includes("preprint")) {
    return "preprint";
  }
  return "peer";
}

// Detect first authorship (ROBUST)
function isFirstAuthor(authors) {
  return /^(\s*)?(Ajnabi,\s*J\.?|J\.?\s*Ajnabi)\b/i.test(authors);
}

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function loadText(path) {
  const res = await fetch(path);
  return res.text();
}

/* =====================
   MAIN
====================== */
(async function () {

  // Read nav height from CSS (single source of truth)
  const NAV_HEIGHT =
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-height")
    ) || 80;

  // Pattern to match your name
  const MY_NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

  let currentType = "all";
  let sortOrder = "desc";

  const profile = await loadJSON("data/profile.json");
  const about = await loadText("content/about.md");
  const interests = await loadJSON("data/interests.json");
  const experience = await loadJSON("data/experience.json");
  const pubs = await loadJSON("data/publications.json");
   /* =====================
   BUILD CITATION MAP
====================== */

// auto-generate citation keys: {ajnabi_2026 → pub}
const citationMap = {};

pubs.forEach(p => {
  const firstAuthor = p.authors.split(",")[0].toLowerCase();
  const year = p.year;
  const key = `${firstAuthor}_${year}`;
  citationMap[key] = p;
});

  /* =====================
     PROFILE
  ====================== */
  document.getElementById("profile").innerHTML = `
    <div class="profile">
      <img src="assets/profile.jpg" alt="Johan Ajnabi">
      <div>
        <h1>${profile.name}</h1>
        <div class="subtitle">${profile.title}</div>
        <div class="subtitle">${profile.focus}</div>
        <div class="subtitle">${profile.affiliation.join("<br>")}</div>
      </div>
    </div>
  `;

  /* =====================
     ABOUT
  ====================== */
  document.getElementById("about").innerHTML = `
    <h2>About</h2>
    <p>${about.replace(/\n\n/g, "</p><p>")}</p>
  `;

  /* =====================
     RESEARCH INTERESTS
  ====================== */
  document.getElementById("interests").innerHTML = `
    <h2>Research Interests</h2>
    <ul>${interests.map(i => `<li>${i}</li>`).join("")}</ul>
  `;

  /* =====================
   EXPERIENCE (UPGRADED)
====================== */
document.getElementById("experience").innerHTML = `
  <h2>Research Experience</h2>

  ${experience.map(exp => `
    <div class="experience-block">
      <p>
        <strong>${exp.role}</strong><br>
        ${exp.institution}<br>
        <em>${exp.period}</em><br>
        Supervisor: ${exp.supervisor}
      </p>

      <ul>
        ${exp.points.map(point => {
          // Plain string bullet
          if (typeof point === "string") {
            return `<li>${point}</li>`;
          }

          // Bullet with linked paper
          if (typeof point === "object" && point.paper) {
  const p = point.paper;
  return `
    <li>
      ${point.text}
      <br>
      (<strong>${p.journal}</strong>,
      <a href="${p.link}" target="_blank">
        ${p.authors}, ${p.year}
      </a>)
    </li>
  `;
}


          return "";
        }).join("")}
      </ul>
    </div>
  `).join("")}
`;

  /* =====================
     PUBLICATIONS
  ====================== */
  function renderPublications() {

    let filtered = pubs.slice();

    if (currentType !== "all") {
      filtered = filtered.filter(p => getPubType(p) === currentType);
    }

    filtered.sort((a, b) =>
      sortOrder === "desc" ? b.year - a.year : a.year - b.year
    );

    document.getElementById("publications").innerHTML = `
      <h2>Publications</h2>

      <div class="pub-controls">
        <div>
          <button class="type-btn" data-type="all">All</button>
          <button class="type-btn" data-type="peer">Peer-reviewed</button>
          <button class="type-btn" data-type="preprint">Preprints</button>
        </div>
        <div>
          Sort:
          <button id="sort-toggle">
            ${sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      ${filtered.map((p, i) => `
        <div class="pub">
          ${highlightAuthor(p.authors, MY_NAME_REGEX)}
          ${isFirstAuthor(p.authors)
            ? `<span class="first-author">★ First author</span>`
            : ``}
          <br>
          <em>${p.title}</em><br>
          ${p.journal}, ${p.year}.
          <a href="${p.link}" target="_blank">[link]</a>

          ${(p.summary || p.abstract || p.details) ? `
            <br>
            <button class="pub-toggle" data-id="${i}">Show details</button>
            <div class="pub-details" id="details-${i}">
              ${p.summary ? `<p><strong>Summary:</strong> ${p.summary}</p>` : ``}
              ${p.abstract ? `<p><strong>Abstract:</strong> ${p.abstract}</p>` : ``}
              ${(!p.summary && !p.abstract && p.details)
                ? `<p>${p.details}</p>`
                : ``}
            </div>
          ` : ``}
        </div>
      `).join("")}
    `;

    document.querySelectorAll(".pub-toggle").forEach(btn => {
      btn.onclick = () => {
        const el = document.getElementById(`details-${btn.dataset.id}`);
        const open = el.style.display === "block";
        el.style.display = open ? "none" : "block";
        btn.textContent = open ? "Show details" : "Hide details";
      };
    });

    document.querySelectorAll(".type-btn").forEach(btn => {
      btn.onclick = () => {
        currentType = btn.dataset.type;
        renderPublications();
      };
    });

    document.getElementById("sort-toggle").onclick = () => {
      sortOrder = sortOrder === "desc" ? "asc" : "desc";
      renderPublications();
    };
  }

  renderPublications();

  /* =====================
     LINKS
  ====================== */
  document.getElementById("links").innerHTML = `
    <h2>Links</h2>
    <div class="links">
      <a href="${profile.links["Google Scholar"]}" target="_blank">🎓 Scholar</a>
      <a href="${profile.links["ORCID"]}" target="_blank">🆔 ORCID</a>
      <a href="${profile.links["LinkedIn"]}" target="_blank">💼 LinkedIn</a>
      <a href="${profile.links["BlueSky"]}" target="_blank">🦋 BlueSky</a>
    </div>
  `;

  /* =====================
     AUTO-HIGHLIGHT NAV PILLS ON SCROLL
  ====================== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-pills .pill");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      const sectionTop = section.offsetTop - NAV_HEIGHT - 10;
      if (window.scrollY >= sectionTop) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });

  /* =====================
     FADE-IN SECTIONS ON SCROLL
  ====================== */
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

  /* =====================
     KEYBOARD NAV FOR PILLS
  ====================== */
  const pills = Array.from(document.querySelectorAll(".nav-pills .pill"));

  document.addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;

    const activeIndex = pills.findIndex(p =>
      p.classList.contains("active")
    );
    if (activeIndex === -1) return;

    const nextIndex =
      e.key === "ArrowRight"
        ? (activeIndex + 1) % pills.length
        : (activeIndex - 1 + pills.length) % pills.length;

    pills[nextIndex].focus();
    pills[nextIndex].click();
  });
/* =====================
   BACK TO TOP VISIBILITY
====================== */

const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    backToTop.classList.add("visible");
  } else {
    backToTop.classList.remove("visible");
  }
});

})();
