/**
 * South House — Events CMS Integration
 * ======================================
 * Fetches events from Sanity and renders them into the two zones on home.html:
 *   Zone 1 — Featured Events  (#featured-events-zone)
 *   Zone 2 — Events Archive   (#archived-events-zone)
 *
 * Progressive enhancement: if the API is unavailable or returns no data,
 * the loading placeholder remains visible.
 */

(function () {
  'use strict';

  const cfg = window.SANITY_CONFIG;
  if (!cfg || !cfg.projectId) {
    console.warn('[South House Events] No Sanity config found. Skipping CMS fetch.');
    return;
  }

  // ── Sanity image URL builder ──────────────────────────────────────────────
  function imageUrl(asset, width) {
    if (!asset || !asset._ref) return null;
    const ref = asset._ref;
    const parts = ref.split('-');
    const id = parts[1];
    const dimensions = parts[2];
    const format = parts[3];
    const base = 'https://cdn.sanity.io/images/' + cfg.projectId + '/' + cfg.dataset + '/' + id + '-' + dimensions + '.' + format;
    return width ? base + '?w=' + width + '&auto=format&fit=max' : base;
  }

  // ── Date formatter ────────────────────────────────────────────────────────
  function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return mm + '.' + dd + '.' + yyyy;
  }

  // ── GROQ query ────────────────────────────────────────────────────────────
  const query = encodeURIComponent(
    '*[_type == "event" && published == true] | order(eventDate asc) {' +
      '_id, title, status, eventDate, location, ' +
      '"coverImage": coverImage.asset, ' +
      '"thumbImage": thumbImage.asset, ' +
      'description, rsvpLink, infoLink' +
    '}'
  );

  const endpoint = 'https://' + cfg.projectId + '.api.sanity.io/v' + cfg.apiVersion + '/data/query/' + cfg.dataset + '?query=' + query;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  fetch(endpoint, {
    headers: cfg.token ? { Authorization: 'Bearer ' + cfg.token } : {},
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Sanity API returned ' + res.status);
      return res.json();
    })
    .then(function (data) {
      const events = data.result || [];

      // Linktree specific order for Featured events
      const linktreeOrder = [
        "South House vs Naija House - Say Twin Edition @ Elsewhere (05/02)",
        "The South House After Party - Say Twin (05/02) @ 3 Dollar Bill",
        "South House vs Naija House - Cinco De Mayo wknd @ Johnny Cabron’s (05/01)",
        "South House vs Naija House Night Party @ Rosemary Beauty & Queen (05/08)",
        "South House vs Naija House Day Party @ El Malo (05/09)",
        "The South House After Party at Knock House Music - Atlanta (10pm - 3am)",
        "Clock It - An After Work Happy Hour Series in LES (05/15)",
        "South House vs Naija House Night Party @ Strand - D.C. (05/15)",
        "South House vs Naija House Night Party @ The Pearl - Toronto (05/16)"
      ];

      const featured = events
        .filter(function (e) { return e.status === 'featured'; })
        .sort(function (a, b) {
          const indexA = linktreeOrder.indexOf(a.title);
          const indexB = linktreeOrder.indexOf(b.title);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return new Date(a.eventDate) - new Date(b.eventDate);
        });

      const archived = events
        .filter(function (e) { return e.status === 'archived'; })
        .sort(function (a, b) { return new Date(b.eventDate) - new Date(a.eventDate); });

      if (featured.length > 0) renderFeatured(featured.slice(0, 10));
      else clearZone('featured-events-zone', 'No featured events at the moment.');

      if (archived.length > 0) renderArchive(archived);
      else clearZone('archived-events-zone', 'No past events yet.');
    })
    .catch(function (err) {
      console.warn('[South House Events] Could not load events from CMS:', err.message);
      clearZone('featured-events-zone', 'Could not load events.');
      clearZone('archived-events-zone', 'Could not load archive.');
    });

  // ── Render: Featured Event ────────────────────────────────────────────────
  function renderFeatured(events) {
    const container = document.getElementById('featured-events-zone');
    if (!container) return;

    container.innerHTML = events.map(function(event) {
      const imgSrc = imageUrl(event.coverImage, 900);
      const dateStr = formatDate(event.eventDate);
      const metaParts = [];
      if (dateStr) metaParts.push(dateStr);
      if (event.location) metaParts.push(event.location);
      const meta = metaParts.join(' · ') || 'Upcoming';

      const link = event.rsvpLink || event.infoLink || null;

      if (link) {
        return (
          '<a href="' + escHtml(link) + '" target="_blank" rel="noopener" class="event-card-featured">' +
            (imgSrc ? '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(event.title) + '" class="event-card-featured__image">' : '') +
            '<div class="event-card-featured__body">' +
              '<h3 class="event-card-featured__title">' + escHtml(event.title) + '</h3>' +
              '<div class="event-card-featured__meta">' + meta + '</div>' +
              (event.description ? '<p class="event-card-featured__description">' + escHtml(event.description) + '</p>' : '') +
              '<span class="event-card-featured__cta">Get Tickets →</span>' +
            '</div>' +
          '</a>'
        );
      } else {
        return (
          '<div class="event-card-featured">' +
            (imgSrc ? '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(event.title) + '" class="event-card-featured__image">' : '') +
            '<div class="event-card-featured__body">' +
              '<h3 class="event-card-featured__title">' + escHtml(event.title) + '</h3>' +
              '<div class="event-card-featured__meta">' + meta + '</div>' +
              (event.description ? '<p class="event-card-featured__description">' + escHtml(event.description) + '</p>' : '') +
            '</div>' +
          '</div>'
        );
      }
    }).join('');
  }

  // ── Render: Archive Grid ──────────────────────────────────────────────────
  function renderArchive(events) {
    const container = document.getElementById('archived-events-zone');
    if (!container) return;

    container.innerHTML = events.map(function (event) {
      const thumbAsset = event.thumbImage || event.coverImage;
      const thumbSrc = imageUrl(thumbAsset, 320);
      const dateStr = formatDate(event.eventDate);
      const link = event.rsvpLink || event.infoLink || null;

      const cardInner =
        (thumbSrc ? '<img src="' + escHtml(thumbSrc) + '" alt="' + escHtml(event.title) + '" class="event-card-archive__thumbnail">' : '') +
        '<div class="event-card-archive__content">' +
          '<div class="event-card-archive__title">' + escHtml(event.title) + '</div>' +
          '<div class="event-card-archive__meta">' + dateStr + '</div>' +
        '</div>';

      if (link) {
        return '<a href="' + escHtml(link) + '" target="_blank" rel="noopener" class="event-card-archive">' + cardInner + '</a>';
      }
      return '<div class="event-card-archive">' + cardInner + '</div>';
    }).join('');
  }

  // ── Clear zone with message ───────────────────────────────────────────────
  function clearZone(zoneId, message) {
    const el = document.getElementById(zoneId);
    if (el) {
      el.innerHTML = '<div style="color:var(--text-muted);text-align:center;padding:2rem 1rem;">' + message + '</div>';
    }
  }

  // ── Utility: HTML escape ──────────────────────────────────────────────────
  function escHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

})();
