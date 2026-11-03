import { useCallback, useEffect, useRef, useState } from 'react';

const IMAGES = [
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687012/rde4btd94nkmi0f9azyc.jpg',
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687025/hd3gx2dwelgmlcakaohr.jpg',
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687037/wpgfhq9faugo39pp45aa.jpg',
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687049/xr7nlhsdw2fdskvy3kua.jpg',
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687060/hpxdunmhipjumjytxuni.jpg',
  'https://res.cloudinary.com/bvw3okdf/image/upload/v1793687070/bteucof3c4nysxauofb1.jpg',
];
const N = IMAGES.length;
const SLIDES = [IMAGES[N - 1], ...IMAGES, IMAGES[0]];
const EVERY = 3000;

export default function BannerCarousel() {
  const [idx, setIdx] = useState(1);
  const [anim, setAnim] = useState(true);
  const [dx, setDx] = useState(0);
  const [hold, setHold] = useState(false);
  const [ready, setReady] = useState(false);
  const box = useRef(null);
  const start = useRef(null);

  useEffect(() => {
    const im = new Image();
    im.onload = im.onerror = () => setReady(true);
    im.src = IMAGES[0];
  }, []);

  const go = useCallback((d) => { setAnim(true); setIdx((i) => i + d); }, []);
  useEffect(() => {
    if (hold || !ready) return undefined;
    const t = setInterval(() => { if (!document.hidden) go(1); }, EVERY);
    return () => clearInterval(t);
  }, [idx, hold, go, ready]);

  const settle = () => {
    let to = null;
    if (idx === N + 1) to = 1; else if (idx === 0) to = N;
    if (to === null) return;
    setAnim(false); setIdx(to);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
  };
  const down = (e) => { start.current = e.clientX; setHold(true); setAnim(false); try { box.current.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ } };
  const move = (e) => { if (start.current !== null) setDx(e.clientX - start.current); };
  const up = () => {
    if (start.current === null) return;
    const w = box.current ? box.current.offsetWidth : 300;
    const d = dx;
    start.current = null; setDx(0); setHold(false); setAnim(true);
    if (Math.abs(d) > w * 0.18) go(d < 0 ? 1 : -1);
  };
  const active = ((idx - 1 + N) % N);

  return (
    <section className="bnr" aria-roledescription="carousel" aria-label="Featured banners" aria-busy={!ready}>
      <div ref={box} className="bnr-view" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onMouseEnter={() => setHold(true)} onMouseLeave={() => { if (start.current === null) setHold(false); }}>
        {!ready && <div className="bnr-slide sk" aria-hidden="true" style={{ borderRadius: 0 }} />}
        <div className="bnr-track" onTransitionEnd={settle} style={{ display: ready ? 'flex' : 'none', transform: 'translateX(calc(' + (-idx * 100) + '% + ' + dx + 'px))', transition: anim ? 'transform .5s cubic-bezier(.2,.8,.2,1)' : 'none' }}>
          {SLIDES.map((src, i) => (
            <div className="bnr-slide" key={i} aria-hidden={i !== idx}>
              <img src={src} alt="" draggable="false" loading={i <= 2 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
      <div className="bnr-dots">
        {IMAGES.map((_, i) => (
          <button key={i} type="button" aria-label={'Go to banner ' + (i + 1)} className={i === active ? 'on' : ''} onClick={() => { setAnim(true); setIdx(i + 1); }} />
        ))}
      </div>
    </section>
  );
}
