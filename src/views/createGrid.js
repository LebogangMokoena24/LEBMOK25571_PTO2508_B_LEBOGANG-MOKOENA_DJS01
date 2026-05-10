/**
 * @fileoverview createGrid - Factory that builds and manages the podcast grid view.
 *
 * Responsibilities (SRP):
 *  - Render podcast cards into the grid container.
 *  - Handle genre filtering and sort order.
 *  - Re-render on filter/sort change without a page reload.
 *
 * @principle SRP  - Grid logic is isolated from card creation and modal logic.
 * @principle DIP  - Depends on abstractions (createPodcastCard, GenreService)
 *                  rather than concrete implementations.
 * @principle OCP  - New sort strategies can be added without altering core rendering.
 *
 * @module createGrid
 */

import { createPodcastCard } from "../components/createPodcastCard.js";
import { createModal } from "../components/createModal.js";
import { GenreService } from "../utils/GenreService.js";

/* ────────────────────────────────────────────────────────────
   SORT STRATEGIES
   (Functional programming: pure sort comparators)
   ──────────────────────────────────────────────────────────── */

/**
 * Map of sort-key → comparator function.
 * Each comparator is a pure function with no side effects.
 *
 * @type {Object.<string, Function>}
 */
const SORT_STRATEGIES = {
  /**
   * Sort by most-recently updated date, descending.
   * @param {Object} a
   * @param {Object} b
   * @returns {number}
   */
  updated: (a, b) => new Date(b.updated) - new Date(a.updated),

  /**
   * Sort by number of seasons (most popular proxy), descending.
   * @param {Object} a
   * @param {Object} b
   * @returns {number}
   */
  popular: (a, b) => b.seasons - a.seasons,

  /**
   * Sort alphabetically by title, ascending.
   * @param {Object} a
   * @param {Object} b
   * @returns {number}
   */
  newest: (a, b) => a.title.localeCompare(b.title),
};

/* ────────────────────────────────────────────────────────────
   FACTORY FUNCTION
   ──────────────────────────────────────────────────────────── */

/**
 * Creates and returns a grid controller object.
 *
 * The controller exposes a `render` method that populates the genre
 * filter dropdown and renders the initial set of podcast cards.
 * It also wires up the filter/sort change listeners.
 *
 * @returns {{ render: Function }} Grid controller with a `render` method.
 *
 * @example
 * const grid = createGrid();
 * grid.render(podcasts);
 */
export function createGrid() {
  /* DOM references */
  const gridEl = document.getElementById("podcastGrid");
  const genreSelect = document.getElementById("genreFilter");
  const sortSelect = document.getElementById("sortFilter");

  /** @type {Object[]} Full unfiltered podcast list (set on first render). */
  let _allPodcasts = [];

  /* ── Event listeners ── */
  genreSelect.addEventListener("change", _onFilterChange);
  sortSelect.addEventListener("change", _onFilterChange);

  /* ────────────────────────────────────────────────────────
     PRIVATE: filter + sort + render cycle
     ──────────────────────────────────────────────────────── */

  /**
   * Called whenever the genre or sort select changes.
   * Filters and re-sorts the full podcast list, then re-renders the grid.
   *
   * @returns {void}
   * @private
   */
  function _onFilterChange() {
    const filtered = _applyFilters(_allPodcasts);
    _renderCards(filtered);
  }

  /**
   * Filters and sorts a podcast array using the current select values.
   *
   * @param {Object[]} list - Full podcast array.
   * @returns {Object[]} Filtered and sorted subset.
   * @private
   */
  function _applyFilters(list) {
    const genreVal = genreSelect.value;
    const sortVal = sortSelect.value;

    const filtered = list.filter((p) =>
      GenreService.matchesFilter(p.genres, genreVal)
    );

    const comparator = SORT_STRATEGIES[sortVal] ?? SORT_STRATEGIES.updated;
    return [...filtered].sort(comparator);
  }

  /**
   * Clears the grid and appends a new card for each podcast in the list.
   * Shows an empty-state message if the list is empty.
   *
   * @param {Object[]} list - Podcast data objects to render.
   * @returns {void}
   * @private
   */
  function _renderCards(list) {
    gridEl.innerHTML = "";

    if (list.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.setAttribute("role", "status");
      empty.innerHTML = `
        <div class="empty-state__icon" aria-hidden="true">🎙️</div>
        <p class="empty-state__text">No podcasts found for this filter.</p>
      `;
      gridEl.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach((podcast) => {
      const card = createPodcastCard(podcast, _handleCardClick);
      fragment.appendChild(card);
    });
    gridEl.appendChild(fragment);
  }

  /**
   * Handles a podcast card click by opening the detail modal.
   *
   * @param {Object} podcast - The podcast that was clicked.
   * @returns {void}
   * @private
   */
  function _handleCardClick(podcast) {
    createModal.open(podcast);
  }

  /**
   * Populates the genre <select> with options derived from all podcasts.
   *
   * @param {Object[]} list - Full podcast list (used to determine available genres).
   * @returns {void}
   * @private
   */
  function _populateGenreOptions(list) {
    // Collect genre IDs present in this dataset
    const presentIds = new Set(list.flatMap((p) => p.genres));
    const allGenres = GenreService.getAllOptions().filter((g) =>
      presentIds.has(g.id)
    );

    // Clear existing options (keep the "All Genres" default)
    while (genreSelect.options.length > 1) {
      genreSelect.remove(1);
    }

    allGenres.forEach(({ id, title }) => {
      const option = document.createElement("option");
      option.value = String(id);
      option.textContent = title;
      genreSelect.appendChild(option);
    });
  }

  /* ────────────────────────────────────────────────────────
     PUBLIC API
     ──────────────────────────────────────────────────────── */

  return {
    /**
     * Initialises the grid with the full podcast list.
     * Populates genre filters and renders the default sorted view.
     *
     * @param {Object[]} podcasts - Array of podcast data objects.
     * @returns {void}
     */
    render(podcasts) {
      _allPodcasts = podcasts;
      _populateGenreOptions(podcasts);
      const sorted = _applyFilters(podcasts);
      _renderCards(sorted);
    },
  };
}
