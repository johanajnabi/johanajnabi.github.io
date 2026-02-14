/* =====================
   UTILITIES
====================== */

function highlightAuthor(authors, regex) {
  return authors.replace(regex, m => `<strong>${m}</strong>`);
}

function getPubType(pub) {
  const j = pub.journal.toLowerCase();
  return (j.includes("biorxiv") || j.includes("preprint"))
    ? "preprint"
    : "peer";
}

function isFirstAuthor(authors) {
  return /^(\s*)?(Ajnabi,\s*J\.?|J\.?\s*Ajnabi)\b/i.test(authors);
}

/* =====================
   CITATION FORMATTING
====================== */

function parseAuthors(authors) {
  return authors
    .split(",")
    .map(a => a.trim())
    .filter(a => a.length > 1);
}

function formatCitation(authors, year) {
  const names = parseAuthors(authors);
  if (names.length === 1) {
    return `${names[0]}, ${year}`;
  }
  return `${names[0]} et al., ${year}`;
}

/* =====================
   EXPERIENCE CITATIONS
====================== */

function linkInlineCitations(text, pubs) {
  return text.replace(/\(\{([a-z0-9_]+)\}\)/gi, (_, key) => {

    const pub = pubs.find(p => {
      const first = p.authors
        .split(",")[0]
        .toLowerCase()
        .replace(/\s+/g, "");
      return `${first}_${p.year}` === key.toLowerCase();
    });

    if (!pub) return "";

    const isPreprint = /biorxiv|preprint/i.test(pub.journal);
    const journal = pub.journal.replace(/\s*\(preprint\)/i, "").trim();

    return `
      <span class="exp-citation">
        <strong>${journal}${isPreprint ? " (preprint)" : ""}</strong>, ${pub.year}
        <a href="${pub.link}" target="_blank" rel="noopener noreferrer">
          [${formatCitation(pub.authors, pub.year)}]
        </a>
      </span>
    `;
  });
}

function renderExperiencePoint(point, pubs) {
  if (typeof point === "string") {
    return `<li>${linkInlineCitations(point, pubs)}</li>`;
  }

  if (point.paper) {
    const p = point.paper;
    return `
      <li>
        ${point.text}
        <br>
        <span class="exp-citation">
          <strong>${p.journal}</strong>, ${p.year}
          <a href="${p.link}" target="_blank" rel="noopener noreferrer">
            [${formatCitation(p.authors, p.year)}]
          </a>
        </span>
      </li>
    `;
  }

  return "";
}

/* =====================
   DATA LOADERS
====================== */

const loadJSON = path => fetch(path).then(r => r.json());
const loadText = path => fetch(path).then(r => r.text());

/* =====================
   MAIN
====================== */

(async function () {

  const NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

  let currentType = "all";
  let sortOrder = "desc";

  const [
    profile,
    about,
    interests,
    experience,
    publications
  ] = await Promise.all([
   loadJSON("data/profile.json")
loadText("content/about.md")
loadJSON("data/interests.json")
loadJSON("data/experience.json")
loadJSON("data/publications.json")
  ]);

  /* =====================
     PROFILE
  ====================== */

  document.getElementById("profile").innerHTML = `
  <div class="profile">
    <img src="/assets/profile.jpg"
         alt="Johan Ajnabi"
         fetchpriority="high"
         class="profile-photo">

    <div class="profile-text">
      <h1>${profile.name}</h1>
      <div class="subtitle">${profile.title}</div>
      <div class="subtitle">${profile.focus}</div>
      <div class="subtitle">${profile.affiliation.join("<br>")}</div>

      <div class="profile-links">
        ${profile.email ? `
          <a href="mailto:${profile.email}" aria-label="Email">
            ${iconMail()}
          </a>` : ``}

     <a href="${profile.links["Google Scholar"]}"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="Google Scholar">
  ${iconScholar()}
</a>

<a href="${profile.links["ORCID"]}"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="ORCID">
  ${iconORCID()}
</a>

<a href="${profile.links["LinkedIn"]}"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="LinkedIn">
  ${iconLinkedIn()}
</a>

<a href="${profile.links["BlueSky"]}"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="BlueSky">
  ${iconBlueSky()}
</a>

      </div>
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
     INTERESTS
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
          ${exp.points.map(p => renderExperiencePoint(p, publications)).join("")}
        </ul>
      </div>
    `).join("")}
  `;

  /* =====================
     PUBLICATIONS
  ====================== */

  function renderPublications() {

    let list = publications.slice();

    if (currentType !== "all") {
      list = list.filter(p => getPubType(p) === currentType);
    }

   list.sort((a, b) =>
  sortOrder === "desc"
    ? new Date(b.year, 0, 1) - new Date(a.year, 0, 1)
    : new Date(a.year, 0, 1) - new Date(b.year, 0, 1)
);
    document.getElementById("publications").innerHTML = `
      <h2>Publications</h2>

      <div class="pub-controls">
        <div>
          ${["all","peer","preprint"].map(t => `
            <button class="type-btn ${currentType===t?"active":""}"
                    data-type="${t}">
              ${t === "all" ? "All" :
                t === "peer" ? "Peer-reviewed" : "Preprints"}
            </button>
          `).join("")}
        </div>

        <div>
          Sort:
          <button id="sort-toggle">
            ${sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      ${list.map((p, i) => `
        <div class="pub">
          ${highlightAuthor(p.authors, NAME_REGEX)}
          ${isFirstAuthor(p.authors) ? `<span class="first-author">★ First author</span>` : ``}
          <br>
          <em>${p.title}</em><br>
          ${p.journal}, ${p.year}
         <a href="${p.link}" target="_blank" rel="noopener noreferrer">
  [${formatCitation(p.authors, p.year)}]
</a>

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

  const sections = [...document.querySelectorAll("section[id]")];
  const pills = document.querySelectorAll(".nav-pills .pill");

  window.addEventListener("scroll", () => {
    const pos = window.scrollY + 120;
    let current = "";

    for (const s of sections) {
      if (pos >= s.offsetTop) current = s.id;
    }

    pills.forEach(p =>
      p.classList.toggle("active", p.getAttribute("href") === `#${current}`)
    );
  });

  /* =====================
     FADE-IN
  ====================== */

  const observer = new IntersectionObserver(
    entries => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.1 }
  );

  document.querySelectorAll("section").forEach(s => observer.observe(s));

  /* =====================
     BACK TO TOP
  ====================== */

  const backToTop = document.getElementById("back-to-top");
  window.addEventListener("scroll", () =>
    backToTop.classList.toggle("visible", window.scrollY > 400)
  );

})();

/* =====================
   INLINE SVG ICONS
====================== */

function iconMail() {
  return `<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4z"/><path d="M4 6l8 6 8-6"/></svg>`;
}
function iconScholar() {
  return `<svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5z"/><path d="M5 13v4c0 1.5 3 3 7 3s7-1.5 7-3v-4"/></svg>`;
}
function iconORCID() {
  return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 8v8M13 8h2a3 3 0 010 6h-2z"/></svg>`;
}
function iconLinkedIn() {
  return `<svg viewBox="0 0 24 24"><path d="M6 9v9M6 6v.01M10 9v9M10 13c0-4 6-4 6 0v5"/></svg>`;
}
function iconBlueSky() {
  return `<svg viewBox="0 0 24 24"><path d="M12 12c-2-4-6-6-8-7 0 7 4 10 8 12 4-2 8-5 8-12-2 1-6 3-8 7z"/></svg>`;
}
