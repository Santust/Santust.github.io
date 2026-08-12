# santust.github.io

My portfolio and CTF writeups — [santust.github.io](https://santust.github.io)

Static site with no framework and no build step: plain HTML, CSS and vanilla JS,
served from GitHub Pages.

## Structure

    index.html               page content
    assets/css/style.css     styling and theme variables
    assets/js/site.js        boot sequence, nav, writeups loader
    assets/js/atmosphere.js  cursor and background particles
    writeups/                CTF writeups as markdown

## Writeups

Writeups are markdown files in `writeups/`, loaded from this repo at runtime and
rendered client-side — publishing one is just adding a file and pushing. Images
go in `writeups/images/<room>/`. Files prefixed with `_` are treated as drafts
and stay off the site.
