/**
 * South House — Sanity CMS Configuration
 * =========================================
 * Project ID and dataset are public and safe to expose in client-side code.
 * The API token below is a read-only (viewer) token — it can only read
 * published content and cannot write, delete, or access drafts.
 *
 * To update these values:
 *   1. Log in to https://sanity.io/manage
 *   2. Select the "South House" project (ID: t3aexvm4)
 *   3. Go to API → Tokens to manage tokens
 *   4. Go to API → CORS Origins to add your production domain
 */

window.SANITY_CONFIG = {
  projectId: 't3aexvm4',
  dataset: 'production',
  apiVersion: '2024-01-01',
  // Read-only viewer token — safe to expose in static sites
  token: 'sk9cDbbcVnz9xGkj4uOxcEMeiYcgAGsDtnsxMEkdMP1L4gMcB778yQwO3YoYMlO67VgnnaUECx3O5isbsfswm6a4RySpta352rGfFYIC84JHPEVupeEpRKb48eJ0YKbQnAXnMIgttBYAws31v6qpaPFOdfjiw5wk04RixOgFNGAbTLs29d4C',
};
