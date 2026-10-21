# Salim Portfolio — First Theme, Multi-page Revision

This revision keeps the visual theme from the first portfolio build and only borrows the sliding header/menu interaction from the reference files you supplied.

## Pages
- index.html — Home
- about.html — About
- tech.html — Tech Portfolio
- projects.html — Projects
- academics.html — Academic Portfolio
- free-time.html — Writing & Photography
- contact.html — Contact

##  reminder for self: Replace these images
- `assets/img/logo.png` — site logo and favicon
- `assets/img/profile-bw.jpg` — black-and-white hero portrait
- `assets/img/utp-logo.png` — UTP logo
- `assets/img/gallery/*` — photography placeholders

## Update content
Edit `assets/js/data.js`. It controls project data, project count, developer start year (2020), teaching hours/courses, research/publication summaries, writing, photography and contact details.

The developer experience displayed on the site is calculated as `currentYear - developerStartYear`. Project count is calculated from `projects.length`.

Open `index.html` directly; no build step is required.
