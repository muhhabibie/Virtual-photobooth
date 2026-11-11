// Helper utility to format event header title & branding dynamically for Photobooth Strips
// Handles Wedding, Concert, Exhibition, Festival, Birthday, Corporate & Custom events

export function getEventHeaderTitle(activeEvent, slug = '') {
  const name = (activeEvent?.eventName || activeEvent?.displayName || slug || '').toLowerCase();
  const type = (activeEvent?.eventType || '').toLowerCase();

  if (name.includes('cfd') || name.includes('car free day') || slug === 'cfd') {
    return 'CAR FREE DAY MALANG';
  }
  if (name.includes('pestapora') || type === 'concert' || name.includes('konser') || name.includes('fest')) {
    return 'MUSIC FESTIVAL & CONCERT';
  }
  if (name.includes('vision') || type === 'exhibition' || name.includes('pameran') || name.includes('gallery')) {
    return 'ART EXHIBITION & GALLERY';
  }
  if (name.includes('jakcloth') || type === 'festival' || name.includes('bazaar') || name.includes('expo')) {
    return 'FESTIVAL & BAZAAR';
  }
  if (type === 'birthday' || name.includes('birthday') || name.includes('ultah') || name.includes('sweet 17')) {
    return 'HAPPY BIRTHDAY';
  }
  if (type === 'corporate' || type === 'general' || name.includes('gathering') || name.includes('launching')) {
    return 'SPECIAL EVENT';
  }
  if (type === 'wedding' || name.includes('wedding') || name.includes('pernikahan') || name.includes('sabrina') || name.includes('raka') || name.includes('mempelai')) {
    return 'THE WEDDING OF';
  }

  if (activeEvent?.headerTitle) return activeEvent.headerTitle.toUpperCase();

  if (slug && !slug.includes('wedding') && !slug.includes('raka') && !slug.includes('sabrina')) {
    return 'OFFICIAL PHOTOBOOTH';
  }

  return 'THE WEDDING OF';
}

export function getEventDisplayName(activeEvent, slug = '') {
  if (activeEvent && (activeEvent.displayName || activeEvent.eventName)) {
    return activeEvent.displayName || activeEvent.eventName;
  }
  if (slug) {
    const cleanSlug = slug.replace(/[-_]/g, ' ').trim();
    if (cleanSlug.toLowerCase() === 'cfd' || cleanSlug.toLowerCase() === 'car free day') return 'Car Free Day Malang';
    if (cleanSlug.toLowerCase() === 'pestapora') return 'Pestapora 2026';
    if (cleanSlug.toLowerCase() === 'void vision' || cleanSlug.toLowerCase() === 'void-vision') return 'Void Vision';
    if (cleanSlug.toLowerCase() === 'jakcloth') return 'Jakcloth Fest';
    return cleanSlug.replace(/\b\w/g, c => c.toUpperCase());
  }
  return 'Car Free Day Malang';
}

export function getEventFormattedDate(activeEvent) {
  if (!activeEvent || !activeEvent.eventDate) return '15 - 11 - 2026';
  try {
    const raw = String(activeEvent.eventDate).trim();
    if (raw.includes('-')) {
      const parts = raw.split('-');
      if (parts.length === 3) {
        // If YYYY-MM-DD
        if (parts[0].length === 4) {
          return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
        }
        // If DD-MM-YYYY
        return `${parts[0]} - ${parts[1]} - ${parts[2]}`;
      }
    }
    if (raw.includes('/')) {
      const parts = raw.split('/');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
        }
        return `${parts[0]} - ${parts[1]} - ${parts[2]}`;
      }
    }
    return raw.replace(/·/g, '-');
  } catch (e) {
    return '15 - 11 - 2026';
  }
}
