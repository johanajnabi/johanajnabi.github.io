async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function loadText(path) {
  const res = await fetch(path);
  return res.text();
}

(async function () {

  const profile = await loadJSON("data/profile.json");
  const about = await loadText("content/about.md");
  const interests = await loadJSON("data/interests.json");
  const pubs = await loadJSON("data/publications.json");

  document.getElementById("profile").innerHTML = `
    <div class="profile">
      <img src="assets/profile.jpg">
      <div>
        <h1>${profile.name}</h1>
        <div class="subtitle">${profile.title}</div>
        <div class="subtitle">${profile.focus}</div>
        <div class="subtitle">${profile.affiliation.join("<br>")}</div>
      </div>
    </div>
  `;

  document.getElementById("about").innerHTML = `
    <h2>About</h2>
    <p>${about.replace(/\n\n/g, "</p><p>")}</p>
  `;

  document.getElementById("interests").innerHTML = `
    <h2>Research Interests</h2>
    <ul>${interests.map(i => `<li>${i}</li>`).join("")}</ul>
  `;

  document.getElementById("publications").innerHTML = `
    <h2>Publications</h2>
    ${pubs.map(p => `
      <div class="pub">
        <strong>${p.authors}</strong><br>
        <em>${p.title}</em><br>
        ${p.journal}, ${p.year}.
        <a href="${p.link}" target="_blank">[link]</a>
      </div>
    `).join("")}
  `;

})();
