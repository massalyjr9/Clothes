import { useEffect, useRef, useState } from 'react';
import { LOOKS, PLACES, pad } from '../data.js';
import { PageHead } from '../components/SiteNav.jsx';

const fine = typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

// A cut-out that trails the cursor while a place row is hovered (fine pointers only).
function useTrail(enabled) {
  const el = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const step = () => {
    const c = cur.current, t = target.current;
    c.x += (t.x - c.x) * 0.14; c.y += (t.y - c.y) * 0.14;
    if (el.current) el.current.style.transform = `translate3d(${c.x.toFixed(1)}px,${c.y.toFixed(1)}px,0)`;
    raf.current = Math.hypot(t.x - c.x, t.y - c.y) < 0.4 ? 0 : requestAnimationFrame(step);
  };
  const move = (e, snap) => {
    if (!enabled) return;
    target.current = { x: e.clientX, y: e.clientY };
    if (snap) cur.current = { ...target.current };
    if (!raf.current) raf.current = requestAnimationFrame(step);
  };
  return { el, move };
}

export default function Places() {
  const [hot, setHot] = useState(-1);
  const trail = useTrail(fine);
  const hotLook = hot >= 0 ? LOOKS[PLACES[hot].looks[0] - 1] : null;

  return (
    <div className="places">
      <PageHead index="Vol. 01 · Places" title={<>Five places<br />with no signal</>} sub="Where the nine looks were shot. Hover a place, then jump to its look." />

      <ol className="places__list" onPointerLeave={() => setHot(-1)}>
        {PLACES.map((p, i) => (
          <li
            key={p.name}
            className={'place' + (hot === i ? ' is-hot' : '')}
            style={{ '--i': i }}
            onPointerEnter={(e) => { setHot(i); trail.move(e, hot < 0); }}
            onPointerMove={(e) => trail.move(e)}
          >
            <span className="cap place__n">{pad(i + 1)}</span>
            <div className="place__main">
              <h2 className="place__name">{p.name}</h2>
              <p className="place__note">{p.note}</p>
            </div>
            <div className="place__meta">
              <span className="cap">{p.coords}</span>
              <span className="cap place__time">{p.time} · No signal</span>
              <span className="place__looks">
                {p.looks.map((n) => (
                  <a key={n} className="pill place__look" href={`#/vol-01?look=${n}`}>
                    <span className="place__thumb"><img src={LOOKS[n - 1].small} alt="" loading="lazy" /></span>
                    {pad(n)} {LOOKS[n - 1].name}
                  </a>
                ))}
              </span>
            </div>
          </li>
        ))}
      </ol>

      {fine && (
        <div className={'places__trail' + (hotLook ? ' is-on' : '')} ref={trail.el} aria-hidden="true">
          {PLACES.map((p, i) => {
            const L = LOOKS[p.looks[0] - 1];
            return <img key={p.name} src={L.small} alt="" className={hot === i ? 'is-on' : ''} style={{ '--foot': L.foot }} />;
          })}
        </div>
      )}
    </div>
  );
}
