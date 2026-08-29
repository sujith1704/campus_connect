export const formatDate = (date) => {
  if (!date) return '';

  if (typeof date === 'string') {
    const trimmed = date.trim();
    // YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    const ymd = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymd) {
      const day = ymd[3].padStart(2, '0');
      const month = ymd[2].padStart(2, '0');
      const year = ymd[1];
      return `${day}-${month}-${year}`;
    }
    // DD-MM-YYYY or DD/MM/YYYY
    const dmy = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${day}-${month}-${year}`;
    }
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${parsedDate.getFullYear()}`;
};

/**
 * Checks if an event has already passed based on its event date and time.
 * Compares event date + start time against current date + time in local timezone.
 * @param {Object} event - Event object containing `date` and optional `time`
 * @returns {boolean} - True if the event date/time is in the past (at or after scheduled time), False if present/future
 */
export const isPastEvent = (event) => {
  if (!event || !event.date) return false;

  try {
    const dateVal = event.date;
    const timeVal = event.time ? String(event.time).trim() : '';

    let year = null;
    let month = null; // 0-indexed (0 = Jan, 11 = Dec)
    let day = null;

    if (typeof dateVal === 'string') {
      const trimmedDate = dateVal.trim();

      // Case 1: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss... or YYYY/MM/DD
      const ymdMatch = trimmedDate.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      // Case 2: DD-MM-YYYY or DD/MM/YYYY
      const dmyMatch = trimmedDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);

      if (ymdMatch) {
        year = parseInt(ymdMatch[1], 10);
        month = parseInt(ymdMatch[2], 10) - 1;
        day = parseInt(ymdMatch[3], 10);
      } else if (dmyMatch) {
        day = parseInt(dmyMatch[1], 10);
        month = parseInt(dmyMatch[2], 10) - 1;
        year = parseInt(dmyMatch[3], 10);
      } else {
        const d = new Date(trimmedDate);
        if (isNaN(d.getTime())) return false;
        year = d.getFullYear();
        month = d.getMonth();
        day = d.getDate();
      }
    } else if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return false;
      year = dateVal.getFullYear();
      month = dateVal.getMonth();
      day = dateVal.getDate();
    } else {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    }

    if (year === null || month === null || day === null) {
      return false;
    }

    let hours = 23;
    let minutes = 59;
    let seconds = 59;

    if (timeVal) {
      // 12-hour format: e.g. "5:00 PM", "05:00 PM", "5:00:00 PM", "5 PM", "5PM", "12:30 AM", "12:00 PM"
      const match12 = timeVal.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*(AM|PM)$/i);
      // 24-hour format: e.g. "17:00", "09:30", "17:00:00"
      const match24 = timeVal.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

      if (match12) {
        let h = parseInt(match12[1], 10);
        const m = match12[2] ? parseInt(match12[2], 10) : 0;
        const s = match12[3] ? parseInt(match12[3], 10) : 0;
        const meridian = match12[4].toUpperCase();

        if (meridian === 'PM' && h < 12) h += 12;
        if (meridian === 'AM' && h === 12) h = 0;

        hours = h;
        minutes = m;
        seconds = s;
      } else if (match24) {
        hours = parseInt(match24[1], 10);
        minutes = parseInt(match24[2], 10);
        seconds = match24[3] ? parseInt(match24[3], 10) : 0;
      } else {
        const fallbackDate = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${timeVal}`);
        if (!isNaN(fallbackDate.getTime())) {
          return fallbackDate.getTime() <= Date.now();
        }
      }
    }

    const eventDateTime = new Date(year, month, day, hours, minutes, seconds);
    if (isNaN(eventDateTime.getTime())) return false;

    return eventDateTime.getTime() <= Date.now();
  } catch (err) {
    console.error('Error in isPastEvent:', err);
    return false;
  }
};
