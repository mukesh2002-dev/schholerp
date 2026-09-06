/**
 * Centralised school / app identity config.
 *
 * Single source of truth for:
 * - school name
 * - country name (+ ISO code + number/date locale)
 * - country currency (ISO 4217 code)
 * - app name / tagline
 * - app logo path (file lives in `public/`, referenced as "/logo.png")
 *
 * To rebrand: edit ONLY the `SCHOOL_DATA` object below — sidebar, login,
 * page metadata and `formatCurrency` all read from here.
 */

export interface SchoolData {
  /** Product name shown in sidebar, login, browser tab. e.g. "Apex ERP" */
  appName: string;
  /** Small uppercase line under the app name. e.g. "Multi-Campus Group" */
  appTagline: string;
  /** Official school / group name. e.g. "Apex Global Campus" */
  schoolName: string;
  /** Country name. e.g. "India" */
  countryName: string;
  /** ISO 3166-1 alpha-2 country code. e.g. "IN" */
  countryCode: string;
  /** ISO 4217 currency code used by `formatCurrency`. e.g. "INR" */
  currencyCode: string;
  /** BCP 47 locale for number/date formatting. e.g. "en-IN" */
  locale: string;
  /**
   * App logo path, served from `public/`.
   * e.g. "/logo.png" → place the file at `schholerp/public/logo.png`.
   * Brand components fall back to a built-in icon when the file is missing.
   */
  logoPath: string;
}

export const SCHOOL_DATA: SchoolData = {
  appName: "Apex ERP",
  appTagline: "Multi-Campus Group",
  schoolName: "Apex Global Campus",
  countryName: "India",
  countryCode: "IN",
  currencyCode: "INR",
  locale: "en-IN",
  logoPath: "/logo.png",
};
