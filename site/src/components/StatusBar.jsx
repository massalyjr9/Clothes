import { useEffect, useRef, useState } from 'react';
import { useCart } from '../store.jsx';

const fmt = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

function useClock() {
  const [now, setNow] = useState('06:00');
  useEffect(() => {
    let t;
    const tick = () => {
      setNow(fmt.format(new Date()));
      t = setTimeout(tick, 60000 - (Date.now() % 60000) + 50);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return now;
}

export default function StatusBar({ solid }) {
  const clock = useClock();
  const { count } = useCart();
  const tally = useRef(null);
  const first = useRef(true);

  // Spring the tally up whenever the bag count changes (not on first render).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = tally.current;
    if (!el) return;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }, [count]);

  return (
    <header className={'bar' + (solid ? ' is-solid' : '')}>
      <span className="stat cap" aria-hidden="true">{clock}</span>
      <span className="stat stat--signal cap" aria-hidden="true">
        <span className="sig"><i /><i /><i /><i /></span><span className="stat__txt">Low signal</span>
      </span>
      <a className="brand" href="#/vol-01" aria-label="NOWHERE home">Nowhere<i>®</i></a>
      <span className="stat stat--battery cap" aria-hidden="true"><span className="batt"><i /></span>12%</span>
      <a className="bagbtn pill" href="#/bag" aria-label={`Bag, ${count} items`}>
        Bag (<span className="tally" ref={tally}>{count}</span>)
      </a>
    </header>
  );
}
