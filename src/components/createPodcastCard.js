/**
 * @fileoverview createPodcastCard - Factory function that creates a podcast
 * preview card DOM element.
 *
 * @principle OCP  - Open/Closed: Cards can be extended (e.g. new badge types)
 *                  without modifying core rendering logic.
 * @principle SRP  - Only responsible for building the card DOM node.
 *
 * @module createPodcastCard
 */

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";

/**
 * SVG markup for the "seasons" book/disc icon used inside cards.
 * Defined once and reused to avoid duplication (DRY).
 *
 * @type {string}
 */
const SEASONS_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>`;

/**
 * Creates and returns a podcast preview card as a DOM element.
 *
 * @param {Object}   podcast            - Podcast data object.
 * @param {string}   podcast.id         - Unique identifier.
 * @param {string}   podcast.title      - Show title.
 * @param {string}   podcast.image      - URL of the cover image.
 * @param {number}   podcast.seasons    - Number of seasons.
 * @param {number[]} podcast.genres     - Array of genre IDs.
 * @param {string}   podcast.updated    - ISO date string of last update.
 * @param {Function} onClickCallback    - Called with the podcast object when card is clicked.
 * @returns {HTMLElement} The fully constructed card element.
 *
 * @example
 * const card = createPodcastCard(podcastData, (p) => openModal(p));
 * document.getElementById('grid').appendChild(card);
 */
export function createPodcastCard(podcast, onClickCallback) {
  const genreNames = GenreService.getNames(podcast.genres);
  const relativeDate = DateUtils.relative(podcast.updated);

  /* ── Root element ── */
  const article = document.createElement("article");
  article.className = "podcast-card";
  article.setAttribute("role", "listitem");
  article.setAttribute("tabindex", "0");
  article.setAttribute("aria-label", `${podcast.title}, ${podcast.seasons} seasons`);

  /* ── Cover image ── */
  const coverDiv = _createElement("div", "podcast-card__cover");
  const img = document.createElement("img");
  img.src = podcast.image;
  img.alt = `Cover art for ${podcast.title}`;
  img.loading = "lazy";
  img.decoding = "async";
  coverDiv.appendChild(img);

  /* ── Card body ── */
  const bodyDiv = _createElement("div", "podcast-card__body");

  const title = _createElement("h2", "podcast-card__title");
  title.textContent = podcast.title;

  const seasonsEl = _createElement("p", "podcast-card__seasons");
  seasonsEl.innerHTML = `${SEASONS_ICON_SVG}
    <span>${podcast.seasons} season${podcast.seasons !== 1 ? "s" : ""}</span>`;

  const tagsDiv = _createElement("div", "podcast-card__tags");
  genreNames.forEach((name) => {
    const tag = _createElement("span", "tag");
    tag.textContent = name;
    tagsDiv.appendChild(tag);
  });

  const updatedEl = _createElement("p", "podcast-card__updated");
  updatedEl.textContent = relativeDate;

  bodyDiv.append(title, seasonsEl, tagsDiv, updatedEl);
  article.append(coverDiv, bodyDiv);

  /* ── Interaction ── */
  const handleActivate = () => onClickCallback(podcast);
  article.addEventListener("click", handleActivate);
  article.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  });

  return article;
}

/* ────────────────────────────────────────────────────────────
   PRIVATE HELPERS
   ──────────────────────────────────────────────────────────── */

/**
 * Factory helper: creates a DOM element with a given class name.
 *
 * @param {string} tag       - HTML tag name.
 * @param {string} className - CSS class to assign.
 * @returns {HTMLElement}
 * @private
 */
function _createElement(tag, className) {
  const el = document.createElement(tag);
  el.className = className;
  return el;
}
