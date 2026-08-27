export const formatDate = (date) => {
  if (!date) return '';

  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${parsedDate.getFullYear()}`;
};

/**
 * Checks if an event has already passed based on its event date and time.
 * @param {Object} event - Event object containing `date` and optional `time`
 * @returns {boolean} - True if the event date/time is in the past, False if present/future
 */
export const isPastEvent = (event) => {
  if (!event || !event.date) return false;

  try {
    const dateStr = event.date;
    const timeStr = event.time ? event.time.trim() : '';

    let year, month, day;
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.split('T')[0].split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    }

    let hours = 23;
    let minutes = 59;

    if (timeStr) {
      const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      const matchSimple = timeStr.match(/^(\d{1,2})\s*(AM|PM)$/i);

      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = parseInt(match12[2], 10);
        const meridian = match12[3] ? match12[3].toUpperCase() : null;

        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;

        hours = h;
        minutes = m;
      } else if (matchSimple) {
        let h = parseInt(matchSimple[1], 10);
        const meridian = matchSimple[2].toUpperCase();

        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;

        hours = h;
        minutes = 0;
      } else {
        const timeParsed = new Date(`${dateStr.split('T')[0]} ${timeStr}`);
        if (!isNaN(timeParsed.getTime())) {
          return timeParsed.getTime() < Date.now();
        }
      }
    }

    const eventDateTime = new Date(year, month, day, hours, minutes, 59);
    return eventDateTime.getTime() < Date.now();
  } catch (err) {
    console.error('Error in isPastEvent:', err);
    return false;
  }
};
