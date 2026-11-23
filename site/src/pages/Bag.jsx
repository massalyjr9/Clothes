import { useState } from 'react';
import { LOOKS, money, pad } from '../data.js';
import { useCart, useToast } from '../store.jsx';
import { PageHead } from '../components/SiteNav.jsx';

const thumbStyle = (L, k) => ({ backgroundImage: `url('${L.sheet}')`, backgroundPosition: `${k * 50}% ${L.row * 50}%` });

export default function Bag() {
  const { lines, setQty, clear, sub, off, total, count } = useCart();
  const toast = useToast();
  const [order, setOrder] = useState(null);

  const print = () => {
    const no = `0004-${String(Date.now()).slice(-5)}`;
    setOrder({ no, lines: lines.map((l) => ({ ...l })), sub, off, total, count, at: new Date() });
    clear();
    toast('Order printed. Thanks for going nowhere.');
  };

  return (
    <div className="bag">
      <PageHead index="Vol. 01 · Bag" title={<>Your bag,<br />on paper</>} sub={order ? 'Printed. Keep the receipt, lose the phone.' : 'Everything you picked from the ring. Whole fits get 10% off.'} />

      {order ? (
        <Receipt key="done" title={`Order ${order.no}`}>
          <ul className="slip__lines bag__lines">
            {order.lines.map((l, i) => <Row key={i} l={l} />)}
          </ul>
          <Totals sub={order.sub} off={order.off} total={order.total} />
          <p className="cap bag__done">{order.count} {order.count > 1 ? 'pieces' : 'piece'} · {order.at.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
          <a className="slip__cta" href="#/vol-01">Back to the ring</a>
        </Receipt>
      ) : lines.length === 0 ? (
        <Receipt key="empty" title="Nothing yet">
          <p className="bag__empty">Your bag is empty.<br /><i>Go nowhere, then come back.</i></p>
          <a className="slip__cta" href="#/vol-01">
            Spin the ring
            <svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6" /></svg>
          </a>
        </Receipt>
      ) : (
        <Receipt key="bag" title={`${count} ${count > 1 ? 'pieces' : 'piece'}`}>
          <ul className="slip__lines bag__lines">
            {lines.map((l, i) => <Row key={`${l.look}-${l.item}-${l.size}`} l={l} onQty={(q) => setQty(i, q)} />)}
          </ul>
          <Totals sub={sub} off={off} total={total} />
          <button type="button" className="slip__cta" onClick={print}>
            Print order
            <svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6" /></svg>
          </button>
          <p className="cap bag__note">Demo till: no payment is taken.</p>
        </Receipt>
      )}
    </div>
  );
}

function Receipt({ title, children }) {
  return (
    <section className="bag__slip" aria-label="Receipt">
      <div className="slip__head">
        <div className="slip__logo">Nowhere<i>®</i></div>
        <span className="cap">Vol. 01 · Till 0004 · Lisbon</span>
        <span className="cap">{title}</span>
      </div>
      <div className="bag__body">{children}</div>
      <div className="slip__foot" aria-hidden="true">
        <span className="slip__code" />
        <span className="cap">Thanks for going nowhere.</span>
      </div>
    </section>
  );
}

function Row({ l, onQty }) {
  const L = LOOKS[l.look], it = L.items[l.item];
  return (
    <li className="bagline">
      <span className="piece__img bagline__img"><span className="thumb" style={thumbStyle(L, l.item)} /></span>
      <span className="bagline__name">{it.name}</span>
      <span className="bagline__price">{money(it.price * l.qty)}</span>
      <span className="cap bagline__meta">
        <a href={`#/vol-01?look=${L.n}`}>Look {pad(L.n)}</a> · {l.size}
      </span>
      {onQty ? (
        <span className="qty" role="group" aria-label={`Quantity of ${it.name}`}>
          <button type="button" onClick={() => onQty(l.qty - 1)} aria-label={l.qty > 1 ? 'Remove one' : `Remove ${it.name}`}>{l.qty > 1 ? '−' : '×'}</button>
          <span className="qty__n" aria-live="polite">{l.qty}</span>
          <button type="button" onClick={() => onQty(l.qty + 1)} aria-label="Add one">+</button>
        </span>
      ) : <span className="cap bagline__qty">×{l.qty}</span>}
    </li>
  );
}

function Totals({ sub, off, total }) {
  return (
    <dl className="sum">
      <div className="sum__row"><dt className="cap">Subtotal</dt><dd>{money(sub)}</dd></div>
      <div className="sum__row"><dt className="cap">Whole fit −10%</dt><dd>{off ? '−' + money(off) : money(0)}</dd></div>
      <div className="sum__total"><dt>Total</dt><dd>{money(total)}</dd></div>
    </dl>
  );
}
