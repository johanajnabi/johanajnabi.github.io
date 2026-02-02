// Highlight my name in author lists
function highlightAuthor(authors, nameRegex) {
  return authors.replace(nameRegex, match => `<strong>${match}</strong>`);
}

async function loadJSON(path) { 
  const res = await fetch(path);
  return res.json();
}

async function loadText(path) {
  const res = await fetch(path);
  return res.text();
}

(async function () {

  // Pattern to match "Ajnabi, J." or "J. Ajnabi"
  const MY_NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

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
  } else {
    console.error("Interests JSON is not an array:", interests);
  }

  /* =====================
     PUBLICATIONS
  ====================== */
  document.getElementById("publications").innerHTML = `
    <h2>Publications</h2>
    ${pubs.map((p, i) => `
      <div class="pub">
        ${highlightAuthor(p.authors, MY_NAME_REGEX)}<br>
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

  // Toggle publication details
  document.querySelectorAll(".pub-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const el = document.getElementById(`details-${id}`);

      const isOpen = el.style.display === "block";
      el.style.display = isOpen ? "none" : "block";
      btn.textContent = isOpen ? "Show details" : "Hide details";
    });
  });

  /* =====================
     LINKS (Scholar / ORCID / LinkedIn / Bluesky)
  ====================== */
  if (profile.links) {
  document.getElementById("links").innerHTML = `
    <h2>Links</h2>
    <div class="links">

      <a href="${profile.links["Google Scholar"]}" target="_blank" aria-label="Google Scholar">
        <svg viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M11 12.98L3 9l8-3.98L19 9l-8 3.98z"/>
        </svg>
        Scholar
      </a>

      <a href="${profile.links["ORCID"]}" target="_blank" aria-label="ORCID">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M10 7h2v10h-2zM14 7h2v10h-2z" fill="#fff"/>
        </svg>
        ORCID
      </a>

      <a href="${profile.links["LinkedIn"]}" target="_blank" aria-label="LinkedIn">
        <svg viewBox="0 0 24 24">
          <path d="M4 3a2 2 0 100 4 2 2 0 000-4zM3 8h2v13H3zM9 8h2v2h.03c.28-.53.97-1.09 2-1.09 2.14 0 2.54 1.41 2.54 3.25V21h-2v-7.23c0-1.73-.03-3.95-2.41-3.95-2.41 0-2.78 1.88-2.78 3.82V21H9z"/>
        </svg>
        LinkedIn
      </a>

      <a href="${profile.links["Bluesky"]}" target="_blank" aria-label="Bluesky">
        <svg viewBox="0 0 24 24">
          <path d="M12 2c-1.97 2.8-5.2 6.05-8.47 7.72C1.65 10.6 1.3 12.23 2.2 13.5c.9 1.26 3.1 1.36 5.04.44C9.3 13 11 11.1 12 9.8c1 1.3 2.7 3.2 4.76 4.14 1.94.92 4.14.82 5.04-.44.9-1.27.55-2.9-1.33-3.78C17.2 8.05 13.97 4.8 12 2z"/>
        </svg>
        Bluesky
      </a>

    </div>
  `;
}


})();
