/**
 * South House — Sanity CMS Configuration
 * =========================================
 * Project ID and dataset are public and safe to expose in client-side code.
 * The API token below is a read-only (viewer) token — it can only read
 * published content and cannot write, delete, or access drafts.
 *
 * To update these values:
 *   1. Log in to https://sanity.io/manage
 *   2. Select the "South House" project (ID: g803p2v0)
 *   3. Go to API → Tokens to manage tokens
 *   4. Go to API → CORS Origins to add your production domain
 */

window.SANITY_CONFIG = {
  projectId: 'g803p2v0',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // Read-only viewer token — safe to expose in static sites
  token: 'skKsjXoDSTBNIHK5wpakiizgj1NsINNOdW5KyjVZ8y0BNhMiAzzE4c6O5l4geY6EDx240DzA1SDxdpHLk4jY4gGHt5aiYJb5KbUhs7sLnPIygXca886RcP0YeATThr6nXpb2kkD67Bp0xW7zTUaE9p6rKaDyVVLqlYWVuMw3eR3OghbGvbD6',
};
