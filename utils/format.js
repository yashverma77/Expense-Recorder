export const money = (value) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value || 0);
export const fmtDate = (value) => new Date(value).toLocaleDateString();
export const sanitize = (text) => String(text || '').replace(/[<>]/g, '');
export const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
