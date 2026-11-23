import { memo, useEffect, useRef } from 'react';
import markup from './markup.js';
import { mountLookbook } from './engine.js';
import { useCart, useToast } from '../../store.jsx';

// The static markup never re-renders; the engine owns it imperatively.
const Stage = memo(function Stage({ innerRef }) {
  return <div ref={innerRef} dangerouslySetInnerHTML={{ __html: markup }} />;
}, () => true);

export default function Lookbook({ initialLook = 0 }) {
  const ref = useRef(null);
  const cart = useCart();
  const toast = useToast();
  // Keep latest cart/toast reachable from the engine without remounting it.
  const live = useRef({ cart, toast });
  live.current = { cart, toast };

  useEffect(() => {
    const root = ref.current;
    // Fresh markup each mount (StrictMode mounts twice in dev).
    root.innerHTML = markup;
    return mountLookbook(root, {
      initialLook,
      isAdded: (look, item) => live.current.cart.lines.some((l) => l.look === look && l.item === item),
      add: (entries) => live.current.cart.add(entries),
      toast: (t) => live.current.toast(t),
    });
  }, [initialLook]);

  return <Stage innerRef={ref} />;
}
