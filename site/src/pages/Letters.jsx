import { useState } from 'react';
import { LETTERS, pad } from '../data.js';
import { PageHead } from '../components/SiteNav.jsx';

export default function Letters() {
  const [open, setOpen] = useState(0);

  return (
    <div className="letters">
      <PageHead index="Vol. 01 · Letters" title={<>Notes from<br />out of the loop</>} sub="Written by hand, sent without tracking. Open one." />

      <ol className="letters__list">
        {LETTERS.map((l, i) => {
          const isOpen = open === i;
          const id = `letter-${i}`;
          return (
            <li key={l.title} className={'letter' + (isOpen ? ' is-open' : '')} style={{ '--i': i }}>
              <button
                type="button"
                className="letter__head"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="cap">No. {pad(i + 1)}</span>
                <span className="letter__title">{l.title}</span>
                <span className="cap letter__meta">{l.place} · {l.date}</span>
                <span className="letter__toggle" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 4v16M4 12h16" /></svg>
                </span>
              </button>
              <div className="letter__wrap" id={id} role="region" aria-hidden={!isOpen}>
                <div className="letter__clip">
                  <article className="paper">
                    <header className="paper__top">
                      <span className="paper__logo">Nowhere<i>®</i></span>
                      <span className="cap">{l.place}, {l.date}</span>
                    </header>
                    <h3 className="paper__title">{l.title}</h3>
                    {l.body.map((p, k) => <p key={k}>{p}</p>)}
                    <p className="paper__sign"><i>— N.</i></p>
                    <span className="paper__stamp cap" aria-hidden="true">Sent<br />no reply<br />needed</span>
                  </article>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
