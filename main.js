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
  if (j.includes("biorxiv") || j.includes("preprint")) return "preprint";
  return "peer";
}

// Detect first authorship
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

  /* ---------------------
     GLOBAL CONSTANTS
  --------------------- */
  const NAV_HEIGHT =
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-height")
    ) || 80;

  const MY_NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

  let currentType = "all";
  let sortOrder = "desc";

  /* ---------------------
     LOAD DATA
  --------------------- */
  const profile = await loadJSON("data/profile.json");
  const about = await loadText("content/about.md");
  const interests = await loadJSON("data/interests.json");
  const experience = await loadJSON("data/experience.json");
  const pubs = await loadJSON("data/publications.json");

  /* ---------------------
     BUILD CITATION MAP
     {ajnabi_2026 → pub}
  --------------------- */
  const citationMap = {};

  pubs.forEach(p => {
    const firstAuthor =
      p.authors.split(",")[0].toLowerCase().replace(/\s+/g, "");
    const key = `${firstAuthor}_${p.year}`;
    citationMap[key] = p;
  });

  function linkCitations(text) {
    return text.replace(/\{([a-z]+_\d{4})\}/gi, (match, key) => {
      const pub = citationMap[key.toLowerCase()];
      if (!pub) return match;

      const firstAuthor = pub.authors.split(",")[0];
      const authorText = `${firstAuthor} et al., ${pub.year}`;

      return `(
        <strong>${pub.journal}</strong>,
        <a href="${pub.link}" target="_blank">${authorText}</a>
      )`;
    });
  }

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
     EXPERIENCE
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
          ${exp.points.map(p =>
            `<li>${linkCitations(p)}</li>`
          ).join("")}
        </ul>
      </div>
    `).join("")}
  `;

  /* =====================
     PUBLICATIONS
  ====================== */
  function renderPublications() {

    let filtered = [...pubs];

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
          <a href="${p.link}" target="_blank">[${p.authors.split(",")[0]} et al., ${p.year}]</a>

          ${(p.summary || p.abstract) ? `
            <br>
            <button class="pub-toggle" data-id="${i}">Show details</button>
            <div class="pub-details" id="details-${i}">
              ${p.summary ? `<p><strong>Summary:</strong> ${p.summary}</p>` : ``}
              ${p.abstract ? `<p><strong>Abstract:</strong> ${p.abstract}</p>` : ``}
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
     NAV HIGHLIGHT
  ====================== */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-pills .pill");

  window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - NAV_HEIGHT - 10) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === `#${current}`
      );
    });
  });

})();
