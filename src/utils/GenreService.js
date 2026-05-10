/**
 * @fileoverview GenreService - Maps genre IDs to human-readable genre titles.
 *
 * @principle SRP - Single Responsibility Principle: Only responsible for
 * resolving genre IDs to names. Does not handle rendering or data fetching.
 *
 * @module GenreService
 */

import { genres } from "../data.js";

export const GenreService = {
  /**
   * Resolves an array of genre IDs into an array of genre title strings.
   *
   * @param {number[]} genreIds - Array of numeric genre IDs.
   * @returns {string[]} Array of matching genre title strings.
   *
   * @example
   * GenreService.getNames([1, 3]);
   * // => ["Personal Growth", "History"]
   */
  getNames(genreIds) {
    return genreIds.map(
      (id) => genres.find((g) => g.id === id)?.title ?? "Unknown"
    );
  },

  /**
   * Returns all available genres as an array of { id, title } objects.
   * Useful for populating filter dropdowns.
   *
   * @returns {{ id: number, title: string }[]} Array of genre option objects.
   */
  getAllOptions() {
    return genres.map(({ id, title }) => ({ id, title }));
  },

  /**
   * Checks whether a podcast belongs to a given genre ID.
   *
   * @param {number[]} podcastGenreIds - Genre IDs assigned to the podcast.
   * @param {number|string}  filterGenreId - The genre ID to filter by ("all" skips filter).
   * @returns {boolean} True if the podcast matches the filter.
   */
  matchesFilter(podcastGenreIds, filterGenreId) {
    if (filterGenreId === "all") return true;
    return podcastGenreIds.includes(Number(filterGenreId));
  },
};
