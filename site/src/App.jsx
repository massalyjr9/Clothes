import { CartProvider, ToastProvider, useRoute } from './store.jsx';
import StatusBar from './components/StatusBar.jsx';
import SiteNav from './components/SiteNav.jsx';
import Lookbook from './pages/lookbook/Lookbook.jsx';
import Places from './pages/Places.jsx';
import Letters from './pages/Letters.jsx';
import Postcards from './pages/Postcards.jsx';
import Bag from './pages/Bag.jsx';

const PAGES = { places: Places, letters: Letters, postcards: Postcards, bag: Bag };

function Shell() {
  const { path, params } = useRoute();
  const Page = PAGES[path];
  const look = Math.min(9, Math.max(1, parseInt(params.get('look'), 10) || 1)) - 1;

  return (
    <>
      <StatusBar solid={!!Page} />
      {Page ? (
        <main className="page" key={path}>
          <Page />
          <SiteNav current={path} />
        </main>
      ) : (
        <main key={'vol-01-' + look}>
          <Lookbook initialLook={look} />
        </main>
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </CartProvider>
  );
}
