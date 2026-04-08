from __future__ import annotations

import json
import re
from datetime import datetime
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SITE_DATA_PATH = ROOT / "site_src" / "data" / "site.json"
PAGES_DATA_PATH = ROOT / "site_src" / "data" / "pages.json"
JSONLD_ROOT = ROOT / "site_src" / "data" / "jsonld"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def format_long_date(date_iso: str) -> str:
    return datetime.strptime(date_iso, "%Y-%m-%d").strftime("%B %-d, %Y")


def format_long_date_windows_safe(date_iso: str) -> str:
    try:
        return format_long_date(date_iso)
    except ValueError:
        value = datetime.strptime(date_iso, "%Y-%m-%d")
        return value.strftime("%B %d, %Y").replace(" 0", " ")


def absolute_url(site_url: str, path_or_url: str) -> str:
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        return path_or_url
    if path_or_url == "/":
        return site_url.rstrip("/") + "/"
    return site_url.rstrip("/") + path_or_url


def replace_first(text: str, pattern: str, replacement: str) -> str:
    compiled = re.compile(pattern, re.S)
    if not compiled.search(text):
        return text
    return compiled.sub(lambda _: replacement, text, count=1)


def replace_meta_name(text: str, name: str, value: str) -> str:
    pattern = rf'<meta\s+name="{re.escape(name)}"\s+content=".*?"\s*/?>'
    replacement = f'  <meta name="{name}" content="{escape(value, quote=True)}">'
    return replace_first(text, pattern, replacement)


def replace_meta_property(text: str, prop: str, value: str) -> str:
    pattern = rf'<meta\s+property="{re.escape(prop)}"\s+content=".*?"\s*/?>'
    replacement = f'  <meta property="{prop}" content="{escape(value, quote=True)}">'
    return replace_first(text, pattern, replacement)


def replace_link_rel(text: str, rel: str, href: str) -> str:
    pattern = rf'<link\s+rel="{re.escape(rel)}"\s+href=".*?"\s*/?>'
    replacement = f'  <link rel="{rel}" href="{escape(href, quote=True)}">'
    return replace_first(text, pattern, replacement)


def build_csp(site: dict) -> str:
    directives = "\n".join(f"          {directive};" for directive in site["csp_directives"])
    return (
        '  <meta http-equiv="Content-Security-Policy"\n'
        '        content="\n'
        f"{directives}\n"
        '        ">'
    )


def build_nav(site: dict, active_key: str | None) -> str:
    def build_links(mobile: bool) -> str:
        lines = []
        for item in site["nav"]:
            classes = []
            if active_key and item["key"] == active_key:
                classes.append("active")
            class_attr = f' class="{" ".join(classes)}"' if classes else ""
            target_attr = ""
            rel_attr = ""
            if item.get("external"):
                target_attr = ' target="_blank"'
                rel_attr = ' rel="noopener noreferrer"'
            lines.append(
                f'  <a href="{item["url"]}"{class_attr}{target_attr}{rel_attr}>{escape(item["label"])}</a>'
            )
        return "\n".join(lines)

    desktop_links = build_links(mobile=False).replace("\n  <a", "\n      <a")
    mobile_links = build_links(mobile=True)

    return (
        "<!-- =====================\n"
        "     SITE NAV\n"
        "===================== -->\n"
        '<header class="site-nav">\n'
        '  <div class="site-nav__inner">\n'
        f'    <a href="/" class="brand">{escape(site["site_name"])}</a>\n\n'
        '    <button class="menu-toggle" aria-label="Open menu">\n'
        '      &#9776;\n'
        '    </button>\n\n'
        '    <nav class="site-links" aria-label="Primary">\n'
        f"{desktop_links}\n"
        '    </nav>\n'
        '  </div>\n'
        '</header>\n\n'
        '<nav class="mobile-menu" id="mobileMenu" aria-label="Mobile navigation">\n'
        f"{mobile_links}\n"
        '</nav>\n\n'
        '<div class="menu-overlay" id="menuOverlay"></div>\n'
    )


def build_footer(site: dict, page: dict) -> str:
    date_label = format_long_date_windows_safe(page["date_modified"])
    location = page.get("footer_location")
    parts = [f"&copy; {site['copyright_year']} {escape(site['site_name'])}"]
    if location:
        parts.append(escape(location))
    parts.append(f"Last updated {date_label}")
    footer_text = " &middot; ".join(parts)
    return (
        "<!-- =====================\n"
        "     FOOTER\n"
        "===================== -->\n"
        f'  <footer class="{page["footer_class"]}">\n'
        f"    {footer_text}\n"
        "  </footer>"
    )


def apply_shared_link_replacements(text: str, site: dict) -> str:
    links = site["shared_links"]
    replacements = [
        (r"https://johanajnabi\.com", site["site_url"]),
        (r"/assets/JA_CV\d{4}\.pdf", site["cv_url"]),
        (r"mailto:[^\"'<\s]+", links["email"]),
        (r"https://scholar\.google\.com/citations\?user=[^\"'<\s&]+(?:&hl=en)?", links["scholar"]),
        (r"https://orcid\.org/[0-9X\-]+", links["orcid"]),
        (r"https://in\.linkedin\.com/in/[^\"'<\s]+", links["linkedin"]),
        (r"https://github\.com/[^\"'<\s]+", links["github"]),
        (r"https://bsky\.app/profile/[^\"'<\s]+", links["bluesky"]),
        (r"https://www\.researchgate\.net/profile/[^\"'<\s]+", links["researchgate"]),
        (r"https://x\.com/[^\"'<\s]+", links["x"]),
        (r"https://www\.youtube\.com/@[^\"'<\s/]+/?", links["youtube_jopianotes"]),
        (r"https://www\.instagram\.com/jopianotes/?", links["instagram_jopianotes"]),
        (r"https://www\.instagram\.com/jopxls/?", links["instagram_jopxls"])
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    text = re.sub(
        r'(<meta\s+name="twitter:creator"\s+content=")@[^"]+(")',
        lambda match: f'{match.group(1)}{links["twitter_handle"]}{match.group(2)}',
        text
    )
    text = re.sub(
        r'(<meta\s+name="twitter:site"\s+content=")@[^"]+(")',
        lambda match: f'{match.group(1)}{links["twitter_handle"]}{match.group(2)}',
        text
    )
    return text


def update_head(text: str, site: dict, page: dict) -> str:
    canonical_url = absolute_url(site["site_url"], page["canonical_path"])
    og_image = page.get("og_image", site["default_og_image"]["url"])
    og_image_width = page.get("og_image_width", site["default_og_image"]["width"])
    og_image_height = page.get("og_image_height", site["default_og_image"]["height"])
    og_image_alt = page.get("og_image_alt", site["default_og_image"]["alt"])

    text = replace_first(text, r"<title>.*?</title>", f'  <title>{escape(page["title"])}</title>')
    text = replace_meta_name(text, "robots", page["robots"])
    text = replace_meta_name(text, "description", page["description"])
    text = replace_meta_name(text, "theme-color", site["theme_color"])
    text = replace_meta_name(text, "color-scheme", site["color_scheme"])
    text = replace_meta_name(text, "referrer", site["referrer"])
    text = replace_link_rel(text, "canonical", canonical_url)
    text = replace_meta_property(text, "og:type", page.get("og_type", "website"))
    text = replace_meta_property(text, "og:site_name", site["site_name"])
    text = replace_meta_property(text, "og:title", page.get("og_title", page["title"]))
    text = replace_meta_property(text, "og:description", page.get("og_description", page["description"]))
    text = replace_meta_property(text, "og:url", canonical_url)
    text = replace_meta_property(text, "og:image", absolute_url(site["site_url"], og_image))
    text = replace_meta_property(text, "og:image:width", og_image_width)
    text = replace_meta_property(text, "og:image:height", og_image_height)
    text = replace_meta_property(text, "og:image:alt", og_image_alt)
    text = replace_meta_name(text, "twitter:card", page.get("twitter_card", "summary_large_image"))
    text = replace_meta_name(text, "twitter:title", page.get("twitter_title", page["title"]))
    text = replace_meta_name(text, "twitter:description", page.get("twitter_description", page["description"]))
    text = replace_meta_name(text, "twitter:image", absolute_url(site["site_url"], og_image))
    text = replace_meta_name(text, "twitter:image:alt", og_image_alt)
    text = replace_meta_name(text, "twitter:creator", site["shared_links"]["twitter_handle"])
    text = replace_meta_name(text, "twitter:site", site["shared_links"]["twitter_handle"])
    text = replace_link_rel(text, "icon", site["favicon"])
    text = replace_link_rel(text, "stylesheet", site["stylesheet"])
    text = replace_first(
        text,
        r'<meta\s+http-equiv="Content-Security-Policy"\s+content=".*?">',
        build_csp(site)
    )
    text = re.sub(
        r'("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")',
        lambda match: f'{match.group(1)}{page["date_modified"]}{match.group(2)}',
        text
    )
    return text


def replace_nav_block(text: str, site: dict, page: dict) -> str:
    if not page.get("show_nav"):
        return text
    pattern = r'<!--\s*====================\s*SITE NAV\s*===================== -->.*?<div class="menu-overlay" id="menuOverlay"></div>\s*'
    replacement = build_nav(site, page.get("nav_active"))
    return replace_first(text, pattern, replacement)


def replace_footer_block(text: str, site: dict, page: dict) -> str:
    pattern = r'<!--\s*====================\s*FOOTER\s*===================== -->\s*<footer class="site-footer(?: site-footer--compact)?">.*?</footer>'
    replacement = build_footer(site, page)
    return replace_first(text, pattern, replacement)


def build_jsonld_script(site: dict, page: dict) -> str:
    jsonld_path = JSONLD_ROOT / f'{page["key"]}.json'
    if not jsonld_path.exists():
        return ""

    payload = jsonld_path.read_text(encoding="utf-8").strip()
    payload = apply_shared_link_replacements(payload, site)
    payload = re.sub(
        r'("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}(")',
        lambda match: f'{match.group(1)}{page["date_modified"]}{match.group(2)}',
        payload
    )
    return (
        '  <script type="application/ld+json">\n'
        f"{payload}\n"
        "  </script>"
    )


def replace_jsonld_block(text: str, site: dict, page: dict) -> str:
    marker_pattern = rf'<!--\s*STRUCTURED_DATA:\s*{re.escape(page["key"])}\s*-->'
    script = build_jsonld_script(site, page)
    if re.search(marker_pattern, text):
        return re.sub(marker_pattern, script or "", text, count=1)

    if not script:
        return text

    script_pattern = r'<script type="application/ld\+json">.*?</script>'
    if re.search(script_pattern, text, re.S):
        return replace_first(text, script_pattern, script)

    return text.replace("</head>", f"{script}\n\n</head>", 1)


def replace_visible_updated_label(text: str, page: dict) -> str:
    visible_label = page.get("visible_updated_label")
    if not visible_label:
        return text
    return re.sub(
        r'(<span>)Updated [A-Za-z]+ \d{1,2}, \d{4}(</span>)',
        lambda match: f"{match.group(1)}Updated {visible_label}{match.group(2)}",
        text,
        count=1
    )


def build_page(site: dict, page: dict) -> None:
    source_path = ROOT / page["source"]
    output_path = ROOT / page["output"]
    output_path.parent.mkdir(parents=True, exist_ok=True)

    html = source_path.read_text(encoding="utf-8")
    html = apply_shared_link_replacements(html, site)
    html = update_head(html, site, page)
    html = replace_jsonld_block(html, site, page)
    html = replace_nav_block(html, site, page)
    html = replace_footer_block(html, site, page)
    html = replace_visible_updated_label(html, page)

    output_path.write_text(html, encoding="utf-8", newline="\n")


def build_sitemap(site: dict, pages: list[dict]) -> None:
    urls = []
    for page in pages:
        if not page.get("include_in_sitemap"):
            continue
        loc = absolute_url(site["site_url"], page["canonical_path"])
        urls.append(
            "  <url>\n"
            f"    <loc>{escape(loc)}</loc>\n"
            f"    <lastmod>{page['date_modified']}</lastmod>\n"
            "  </url>"
        )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n'
        + "\n\n".join(urls)
        + "\n\n</urlset>\n"
    )
    (ROOT / "sitemap.xml").write_text(sitemap, encoding="utf-8", newline="\n")


def build_robots(site: dict) -> None:
    robots = (
        "User-agent: *\n"
        "Allow: /\n\n"
        f"Sitemap: {site['site_url'].rstrip('/')}/sitemap.xml\n"
    )
    (ROOT / "robots.txt").write_text(robots, encoding="utf-8", newline="\n")


def main() -> None:
    site = load_json(SITE_DATA_PATH)
    pages = load_json(PAGES_DATA_PATH)["pages"]

    for page in pages:
        build_page(site, page)

    build_sitemap(site, pages)
    build_robots(site)

    print(f"Built {len(pages)} pages, sitemap.xml, and robots.txt")


if __name__ == "__main__":
    main()
