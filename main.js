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
  // Matches: "Ajnabi, J., ..." OR "J. Ajnabi, ..."
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

  // Pattern to match "Ajnabi, J." or "J. Ajnabi" anywhere
  const MY_NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

  // Publication UI state
  let currentType = "all";   // all | peer | preprint
  let sortOrder = "desc";    // newest first

  const profile = await loadJSON("data/profile.json");
  const about = await loadText("content/about.md");
  const interests = await loadJSON("data/interests.json");
  const pubs = await loadJSON("data/publications.json");

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
  if (Array.isArray(interests)) {
    document.getElementById("interests").innerHTML = `
      <h2>Research Interests</h2>
      <ul>
        ${interests.map(i => `<li>${i}</li>`).join("")}
      </ul>
    `;
  }

  /* =====================
     PUBLICATIONS
  ====================== */
  function renderPublications() {

    let filtered = pubs.slice();

    // Filter by type
    if (currentType !== "all") {
      filtered = filtered.filter(p => getPubType(p) === currentType);
    }

    // Sort by year
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
          ${p.details ? `
            <br>
            <button class="pub-toggle" data-id="${i}">
              Show details
            </button>
            <div class="pub-details" id="details-${i}">
              ${p.details}
            </div>
          ` : ``}
        </div>
      `).join("")}
    `;

    // Toggle abstract/details
    document.querySelectorAll(".pub-toggle").forEach(btn => {
      btn.onclick = () => {
        const el = document.getElementById(`details-${btn.dataset.id}`);
        const open = el.style.display === "block";
        el.style.display = open ? "none" : "block";
        btn.textContent = open ? "Show details" : "Hide details";
      };
    });

    // Type filters
    document.querySelectorAll(".type-btn").forEach(btn => {
      btn.onclick = () => {
        currentType = btn.dataset.type;
        renderPublications();
      };
    });

    // Sort toggle
    document.getElementById("sort-toggle").onclick = () => {
      sortOrder = sortOrder === "desc" ? "asc" : "desc";
      renderPublications();
    };
  }

  renderPublications();

  /* =====================
     LINKS
  ====================== */
  if (profile.links) {
    document.getElementById("links").innerHTML = `
      <h2>Links</h2>
      <div class="links">
        <a href="${profile.links["Google Scholar"]}" target="_blank">🎓 Scholar</a>
        <a href="${profile.links["ORCID"]}" target="_blank">🆔 ORCID</a>
        <a href="${profile.links["LinkedIn"]}" target="_blank">💼 LinkedIn</a>
        <a href="${profile.links["BlueSky"]}" target="_blank">🦋 BlueSky</a>
      </div>
    `;
  }

})();
