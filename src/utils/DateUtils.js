/**
 * @fileoverview Date Formatter - Utility for human-readable date formatting.
 *
 * @principle SRP - Single Responsibility Principle: This module only formats
 * dates and does not handle any unrelated logic.
 *
 * @module DateUtils
 */

export const DateUtils = {
  /**
   * Formats an ISO date string into a human-readable "Updated …" string.
   *
   * @param {string} dateStr - ISO 8601 date string (e.g. "2022-11-03T07:00:00.000Z").
   * @returns {string} Formatted string, e.g. "Updated November 3, 2022".
   *
   * @example
   * DateUtils.format("2022-11-03T07:00:00.000Z");
   * // => "Updated November 3, 2022"
   */
  format(dateStr) {
    const date = new Date(dateStr);
    return `Updated ${date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
  },

  /**
   * Returns a relative human-readable string such as "2 days ago".
   * Falls back to the full formatted date for older dates (> 30 days).
   *
   * @param {string} dateStr - ISO 8601 date string.
   * @returns {string} Relative time string or formatted date.
   *
   * @example
   * DateUtils.relative("2022-11-01T00:00:00.000Z");
   * // => "Updated November 1, 2022"
   */
  relative(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Updated today";
    if (diffDays === 1) return "Updated 1 day ago";
    if (diffDays < 7) return `Updated ${diffDays} days ago`;
    if (diffDays < 14) return "Updated 1 week ago";
    if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;

    return this.format(dateStr);
  },
};
