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
