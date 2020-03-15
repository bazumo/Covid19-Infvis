import { useState, useEffect, useRef } from "react";

export function useSize(ref: any) {
  const obs = useRef();
  const [ignored, setIgnored] = useState(0);
  const [size, setSize] = useState({ width: null, height: null });

  useEffect(() => {
    function observe(entries: any) {
      const { width, height } = entries[0].contentRect;
      setSize(s =>
        s.width !== width || s.height !== height ? { width, height } : s
      );
    }
    const RObserver =
      (window as any).ResizeObserver ||
      require("resize-observer-polyfill").default;
    obs.current = new RObserver(observe);
    return () => (obs as any).current.disconnect();
  }, []);

  useEffect(() => {
    const forceUpdate = () => setIgnored(c => c + 1);
    const item = ref.current;
    if (item) {
      (obs as any).current.observe(item);
      window.setTimeout(forceUpdate, 0);
    }
    return () => item && (obs as any).current.unobserve(item);
  }, [obs, ref]);

  return size;
}
