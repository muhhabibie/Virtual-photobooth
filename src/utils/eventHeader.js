// Helper utility to format event header title & branding dynamically for Photobooth Strips
// Handles Wedding, Concert, Exhibition, Festival, Birthday, Corporate & Custom events

export function getEventHeaderTitle(activeEvent) {
  if (!activeEvent) return 'THE WEDDING OF';

  const type = (activeEvent.eventType || '').toLowerCase();
  const name = (activeEvent.eventName || activeEvent.displayName || '').toLowerCase();

  if (type === 'wedding' || name.includes('wedding') || name.includes('pernikahan')) {
    return 'THE WEDDING OF';
  }
  if (type === 'concert' || name.includes('pestapora') || name.includes('konser') || name.includes('fest')) {
    return 'MUSIC FESTIVAL & CONCERT';
  }
  if (type === 'exhibition' || name.includes('pameran') || name.includes('gallery') || name.includes('vision')) {
    return 'ART EXHIBITION & GALLERY';
  }
  if (type === 'festival' || name.includes('bazaar') || name.includes('jakcloth') || name.includes('expo')) {
    return 'FESTIVAL & BAZAAR';
  }
  if (type === 'birthday' || name.includes('birthday') || name.includes('ultah') || name.includes('sweet 17')) {
    return 'HAPPY BIRTHDAY';
  }
  if (type === 'corporate' || type === 'general' || name.includes('gathering') || name.includes('launching')) {
    return 'SPECIAL EVENT';
  }

  if (activeEvent.headerTitle) return activeEvent.headerTitle.toUpperCase();

  return 'OFFICIAL PHOTOBOOTH';
}

export function getEventDisplayName(activeEvent) {
  if (!activeEvent) return 'Sabrina & Raka';
  return activeEvent.displayName || activeEvent.eventName || 'Sabrina & Raka';
}

export function getEventFormattedDate(activeEvent) {
  if (!activeEvent || !activeEvent.eventDate) return '30 · 05 · 2026';
  try {
    const raw = activeEvent.eventDate;
    if (raw.includes('-')) {
      const parts = raw.split('-');
      if (parts.length === 3) {
        return `${parts[2]} · ${parts[1]} · ${parts[0]}`;
      }
    }
    return raw.replace(/-/g, ' · ');
  } catch (e) {
    return '30 · 05 · 2026';
  }
}
