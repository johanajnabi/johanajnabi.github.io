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
      <p>
        ${Object.entries(profile.links)
          .map(([name, url]) => `<a href="${url}" target="_blank">${name}</a>`)
          .join(" · ")}
      </p>
    `;
  }

})();
