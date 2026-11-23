import { useState } from 'react';
import { LOOKS, PLACES, POSTCARD_NOTES, pad } from '../data.js';
import { PageHead } from '../components/SiteNav.jsx';
import { useToast } from '../store.jsx';

const placeOf = (n) => PLACES.find((p) => p.looks.includes(n));

function Postcard({ L, flipped, onFlip }) {
  const toast = useToast();
  const place = placeOf(L.n);
  const share = async (e) => {
    e.stopPropagation();
    const url = `${location.origin}${location.pathname}#/vol-01?look=${L.n}`;
    try { await navigator.clipboard.writeText(url); toast('Postcard link copied.'); }
    catch { toast('Could not copy the link.'); }
  };

  return (
    <li className="pcard" style={{ '--i': L.n - 1 }}>
      <button
        type="button"
        className={'pcard__in' + (flipped ? ' is-flipped' : '')}
        onClick={onFlip}
        aria-pressed={flipped}
        aria-label={`Postcard ${pad(L.n)}, ${L.name}. ${flipped ? 'Show front' : 'Turn over'}`}
      >
        {/* front */}
        <span className="pcard__face pcard__front">
          <span className="pcard__fig" style={{ '--foot': L.foot }}>
            <span className="model__shadow" />
            <img src={L.small} alt="" loading="lazy" draggable="false" />
          </span>
          <span className="pcard__copy">
            <span className="pcard__greet">Greetings<br />from nowhere</span>
            <span className="cap">Look {pad(L.n)} — {L.name}</span>
          </span>
          <span className="pcard__stamp" aria-hidden="true">
            <span className="cap">Nowhere®</span>
            <span className="pcard__val">0.{pad(L.n)}</span>
          </span>
        </span>
        {/* back */}
        <span className="pcard__face pcard__back">
          <span className="pcard__note"><i>{POSTCARD_NOTES[L.n - 1]}</i><span className="cap">— from {place.name}, {place.time}</span></span>
          <span className="pcard__addr">
            <span className="pcard__mark cap" aria-hidden="true">{place.name}<br />{place.time}</span>
            <span className="pcard__line">To: you</span>
            <span className="pcard__line">Somewhere else</span>
            <span className="pcard__line">Out of the loop</span>
          </span>
        </span>
      </button>
      <div className="pcard__actions">
        <a className="pill" href={`#/vol-01?look=${L.n}`}>Shop look {pad(L.n)}</a>
        <button type="button" className="pill" onClick={share}>Copy link</button>
      </div>
    </li>
  );
}

export default function Postcards() {
  const [flipped, setFlipped] = useState(() => new Set());
  const toggle = (n) => setFlipped((s) => {
    const next = new Set(s);
    next.has(n) ? next.delete(n) : next.add(n);
    return next;
  });
  const allFlipped = flipped.size === LOOKS.length;

  return (
    <div className="postcards">
      <PageHead index="Vol. 01 · Postcards" title={<>Nine postcards,<br />no stamps needed</>} sub="One per look. Tap a card to turn it over." />
      <div className="postcards__bar">
        <button type="button" className="pill" onClick={() => setFlipped(allFlipped ? new Set() : new Set(LOOKS.map((L) => L.n)))}>
          {allFlipped ? 'Show fronts' : 'Turn all over'}
        </button>
      </div>
      <ul className="postcards__grid">
        {LOOKS.map((L) => <Postcard key={L.n} L={L} flipped={flipped.has(L.n)} onFlip={() => toggle(L.n)} />)}
      </ul>
    </div>
  );
}
