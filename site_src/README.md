# Site Source

This folder is the editable source for the small site build system.

What lives here:
- `pages/` contains the page templates you edit by hand
- `data/site.json` contains shared site-wide values
- `data/pages.json` contains page-specific metadata and build settings
- `data/jsonld/` contains page-specific structured-data payloads

Build command:

```powershell
python tools/build_site.py
```

The build script regenerates:
- top navigation
- mobile navigation
- footer dates
- canonical/meta/social tags
- structured-data script blocks
- shared CV and social links
- `sitemap.xml`
- `robots.txt`

Edit `site_src/pages/...` rather than the generated root HTML whenever possible.
