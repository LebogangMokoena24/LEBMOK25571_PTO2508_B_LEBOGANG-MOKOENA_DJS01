/**
 * @fileoverview Application entry point for PodcastApp.
 *
 * Bootstraps the app by:
 *  1. Importing podcast data.
 *  2. Creating the grid view.
 *  3. Rendering the initial podcast list.
 *
 * @principle SRP - Only responsible for application startup logic:
 *                  wiring event listeners and triggering the initial render.
 *
 * @module index
 */

import { podcasts } from "./data.js";
import { createGrid } from "./views/createGrid.js";

/**
 * Initializes the PodcastApp.
 *
 * Creates the grid controller and renders the full list of podcasts.
 * The grid controller internally handles filter/sort event binding.
 *
 * @returns {void}
 */
function init() {
  const grid = createGrid();
  grid.render(podcasts);
}

// Kick off once the DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
