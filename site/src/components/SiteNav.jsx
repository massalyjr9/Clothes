export const NAV = [
  ['vol-01', 'Vol. 01'],
  ['places', 'Places'],
  ['letters', 'Letters'],
  ['postcards', 'Postcards'],
];

// Floating pill row shown at the bottom of every page except the ring lookbook
// (which keeps the same links inside its Looks drawer).
export default function SiteNav({ current }) {
  return (
    <nav className="sitenav" aria-label="Main">
      {NAV.map(([path, label]) => (
        <a key={path} className="pill" href={`#/${path}`} aria-current={current === path ? 'page' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}

export function PageHead({ index, title, sub }) {
  return (
    <header className="phead">
      <span className="cap">{index}</span>
      <h1 className="phead__t">{title}</h1>
      {sub && <p className="phead__s">{sub}</p>}
    </header>
  );
}
