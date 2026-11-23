import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LOOKS } from './data.js';

/* ---------- Cart ---------- */
// A line is one item of one look in one size: { look: 0-8, item: 0-2, size, qty }
const CartCtx = createContext(null);
const KEY = 'nowhere.bag.v1';

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines]);

  const add = useCallback((entries) => {
    setLines((cur) => {
      const next = cur.map((l) => ({ ...l }));
      entries.forEach(({ look, item, size }) => {
        const hit = next.find((l) => l.look === look && l.item === item && l.size === size);
        if (hit) hit.qty += 1;
        else next.push({ look, item, size, qty: 1 });
      });
      return next;
    });
  }, []);
  const setQty = useCallback((i, qty) => {
    setLines((cur) => (qty <= 0 ? cur.filter((_, k) => k !== i) : cur.map((l, k) => (k === i ? { ...l, qty } : l))));
  }, []);
  const clear = useCallback(() => setLines([]), []);

  const totals = useMemo(() => {
    const priceOf = (l) => LOOKS[l.look].items[l.item].price;
    const sub = lines.reduce((s, l) => s + priceOf(l) * l.qty, 0);
    // "Whole fit −10%": every look whose three items are all in the bag gets 10% off one of each item.
    let off = 0;
    LOOKS.forEach((L, li) => {
      const full = L.items.every((_, k) => lines.some((l) => l.look === li && l.item === k));
      if (full) off += L.items.reduce((s, it) => s + it.price, 0) * 0.1;
    });
    const count = lines.reduce((s, l) => s + l.qty, 0);
    return { sub, off, total: sub - off, count };
  }, [lines]);

  const value = useMemo(() => ({ lines, add, setQty, clear, ...totals }), [lines, add, setQty, clear, totals]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [text, setText] = useState('');
  const [on, setOn] = useState(false);
  const t = useRef(0);
  const show = useCallback((msg) => {
    setText(msg); setOn(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setOn(false), 2500);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className={'toast' + (on ? ' is-on' : '')} role="status" aria-live="polite">{text}</div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------- Hash router ---------- */
const parse = () => {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  return { path: path || 'vol-01', params: new URLSearchParams(query) };
};
export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return route;
}
