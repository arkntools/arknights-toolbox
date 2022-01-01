export const number = new Intl.NumberFormat();

export const dateTime = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export const humanReadableSize = size => {
  const unit = ['B', 'KB', 'MB', 'GB'];
  let lv = 0;
  while (size > 1024 && lv < 2) {
    size /= 1024;
    lv++;
  }
  return `${size.toFixed(2)} ${unit[lv]}`;
};
