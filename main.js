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

// Detect first authorship
function isFirstAuthor(authors) {
  const first = authors.split(",")[0].trim();
  return /^(Ajnabi\s*,\s*J\.?|J\.?\s*Ajnabi)$/i.test(first);
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

  // Pattern to match "Ajnabi, J." or "J. Ajnabi"
  const MY_NAME_REGEX = /\bAjnabi,\s*J\.?\b|\bJ\.?\s*Ajnabi\b/g;

  // Publication state
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
        <div class="subtitle">${profile.title}<
