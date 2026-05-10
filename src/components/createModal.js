/**
 * @fileoverview createModal - Controls the podcast detail modal.
 *
 * Responsibilities (SRP):
 *  - Build modal inner HTML from a podcast data object.
 *  - Open and close the modal with accessible aria attributes.
 *  - Trap focus within the modal while it is open.
 *
 * @principle SRP  - Modal rendering and lifecycle are isolated here.
 * @principle DRY  - Shared SVG icons defined as constants.
 *
 * @module createModal
 */

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";
import { seasons } from "../data.js";

/* ────────────────────────────────────────────────────────────
   CONSTANTS – shared SVG icons
   ──────────────────────────────────────────────────────────── */

/**
 * Close (×) button SVG.
 * @type {string}
 */
const CLOSE_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2.5"
       stroke-linecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6"  y1="6" x2="18" y2="18"/>
  </svg>`;

/**
 * Calendar icon SVG for the "last updated" line.
 * @type {string}
 */
const CALENDAR_ICON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>`;

/* ────────────────────────────────────────────────────────────
   MODULE STATE
   ──────────────────────────────────────────────────────────── */

/** @type {HTMLElement|null} Element that triggered the modal (for focus restore). */
let _previouslyFocusedElement = null;

/* ────────────────────────────────────────────────────────────
   PUBLIC API
   ──────────────────────────────────────────────────────────── */

/**
 * Modal controller object.
 * Exposes `open(podcast)` and `close()`.
 *
 * @namespace createModal
 */
export const createModal = {
  /**
   * Populates and opens the podcast detail modal.
   *
   * @param {Object}   podcast         - Podcast data object.
   * @param {string}   podcast.id      - Unique identifier.
   * @param {string}   podcast.title   - Show title.
   * @param {string}   podcast.image   - Cover image URL.
   * @param {string}   podcast.description - Full description text.
   * @param {number[]} podcast.genres  - Genre ID array.
   * @param {string}   podcast.updated - ISO date string.
   * @returns {void}
   */
  open(podcast) {
    _previouslyFocusedElement = document.activeElement;

    const modal = document.getElementById("podcastModal");
    const contentEl = document.getElementById("modalContent");

    contentEl.innerHTML = _buildModalHTML(podcast);

    // Wire close button
    contentEl
      .querySelector(".modal__close")
      ?.addEventListener("click", this.close.bind(this));

    // Wire backdrop click
    document
      .getElementById("modalBackdrop")
      ?.addEventListener("click", this.close.bind(this), { once: true });

    // Show modal
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    // Focus the close button for keyboard users
    const closeBtn = contentEl.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();

    // Trap focus & ESC key
    modal.addEventListener("keydown", _handleKeydown);
    document.body.style.overflow = "hidden";
  },

  /**
   * Closes the modal and restores focus to the previously active element.
   *
   * @returns {void}
   */
  close() {
    const modal = document.getElementById("podcastModal");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.removeEventListener("keydown", _handleKeydown);
    document.body.style.overflow = "";

    if (_previouslyFocusedElement) {
      _previouslyFocusedElement.focus();
      _previouslyFocusedElement = null;
    }
  },
};

/* ────────────────────────────────────────────────────────────
   PRIVATE HELPERS
   ──────────────────────────────────────────────────────────── */

/**
 * Builds the full inner HTML string for the modal content area.
 *
 * @param {Object} podcast - Podcast data object.
 * @returns {string} HTML string.
 * @private
 */
function _buildModalHTML(podcast) {
  const genreNames = GenreService.getNames(podcast.genres);
  const formattedDate = DateUtils.format(podcast.updated);
  const seasonData = _getSeasonData(podcast.id);

  const genreTagsHTML = genreNames
    .map((name) => `<span class="tag">${name}</span>`)
    .join("");

  const seasonsListHTML = seasonData
    .map(
      ({ title, episodes }) => `
      <li class="season-item">
        <span class="season-item__title">${_escapeHTML(title)}</span>
        <span class="season-item__episodes">${episodes} episode${episodes !== 1 ? "s" : ""}</span>
      </li>`
    )
    .join("");

  return `
    <!-- Header -->
    <div class="modal__header">
      <h2 class="modal__title" id="modalTitle">${_escapeHTML(podcast.title)}</h2>
      <button class="modal__close" aria-label="Close modal">
        ${CLOSE_ICON_SVG}
      </button>
    </div>

    <!-- Body -->
    <div class="modal__body">
      <!-- Top: image + info -->
      <div class="modal__top">
        <div class="modal__image-wrap">
          <img
            src="${podcast.image}"
            alt="Cover art for ${_escapeHTML(podcast.title)}"
            loading="eager"
          />
        </div>

        <div class="modal__info">
          <div>
            <p class="modal__section-label">Description</p>
            <p class="modal__description">${_escapeHTML(podcast.description)}</p>
          </div>

          <div>
            <p class="modal__section-label">Genres</p>
            <div class="modal__genres">${genreTagsHTML}</div>
          </div>

          <p class="modal__updated">
            ${CALENDAR_ICON_SVG}
            <span>Last updated: ${_escapeHTML(formattedDate.replace("Updated ", ""))}</span>
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div class="modal__divider"></div>

      <!-- Seasons -->
      <h3 class="modal__seasons-heading">Seasons</h3>
      <ul class="modal__seasons-list" aria-label="Seasons list">
        ${seasonsListHTML}
      </ul>
    </div>
  `;
}

/**
 * Retrieves season details for a given podcast ID.
 *
 * @param {string} podcastId - The podcast's unique ID.
 * @returns {{ title: string, episodes: number }[]} Array of season objects.
 * @private
 */
function _getSeasonData(podcastId) {
  const match = seasons.find((s) => s.id === podcastId);
  return match?.seasonDetails ?? [];
}

/**
 * Handles keydown events inside the open modal.
 * - ESC closes the modal.
 * - Tab/Shift+Tab traps focus within focusable elements.
 *
 * @param {KeyboardEvent} e
 * @private
 */
function _handleKeydown(e) {
  const modal = document.getElementById("podcastModal");

  if (e.key === "Escape") {
    createModal.close();
    return;
  }

  if (e.key === "Tab") {
    const focusable = [
      ...modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ),
    ].filter((el) => !el.disabled);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/**
 * Escapes special HTML characters to prevent XSS.
 *
 * @param {string} str - Raw string.
 * @returns {string} Escaped string safe for innerHTML insertion.
 * @private
 */
function _escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
