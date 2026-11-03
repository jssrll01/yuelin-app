import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

const EVERY = 3000;

export default function BannerCarousel() {
  const [images, setImages] = useState(null);
  const [idx, setIdx] = useState(1);
  const [anim, setAnim] = useState(true);
  const [dx, setDx] = useState(0);
  const [hold, setHold] = useState(false);
  const box = useRef(null);
  const start = useRef(null);

  useEffect(() => {
    let dead = false;
    supabase.from('banners').select('image_url, alt_text').eq('is_active', true).order('sort_order').order('created_at')
      .then(({ data }) => { if (!dead) setImages(data || []); })
      .catch(() => { if (!dead) setImages([]); });
    return () => { dead = true; };
  }, []);

  const N = images ? images.length : 0;
  const go = useCallback((d) => { setAnim(true); setIdx((i) => i + d); }, []);

  useEffect(() => {
    if (hold || N < 2) return undefined;
    const t = setInterval(() => { if (!document.hidden) go(1); }, EVERY);
    return () => clearInterval(t);
  }, [idx, hold, go, N]);

  if (!images || N === 0) return null;

  if (N === 1) {
    return (
      <section className="bnr" aria-label="Featured banner">
        <div className="bnr-view" style={{ cursor: 'default' }}><div className="bnr-slide"><img src={images[0].image_url} alt={images[0].alt_text || ''} draggable="false" /></div></div>
      </section>
    );
  }

  const SLIDES = [images[N - 1], ...images, images[0]];
  const settle = () => {
    let to = null;
    if (idx === N + 1) to = 1;
    else if (idx === 0) to = N;
    if (to === null) return;
    setAnim(false);
    setIdx(to);
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
  const active = ((idx - 1 + N) % N + N) % N;

  return (
    <section className="bnr" aria-roledescription="carousel" aria-label="Featured banners">
      <div ref={box} className="bnr-view" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onMouseEnter={() => setHold(true)} onMouseLeave={() => { if (start.current === null) setHold(false); }}>
        <div className="bnr-track" onTransitionEnd={settle}
          style={{ transform: 'translateX(calc(' + (-idx * 100) + '% + ' + dx + 'px))', transition: anim ? 'transform .5s cubic-bezier(.2,.8,.2,1)' : 'none' }}>
          {SLIDES.map((b, i) => (
            <div className="bnr-slide" key={i} aria-hidden={i !== idx}>
              <img src={b.image_url} alt={b.alt_text || ''} draggable="false" loading={i <= 2 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>
      <div className="bnr-dots">
        {images.map((_, i) => (
          <button key={i} type="button" aria-label={'Go to banner ' + (i + 1)} className={i === active ? 'on' : ''} onClick={() => { setAnim(true); setIdx(i + 1); }} />
        ))}
      </div>
    </section>
  );
}
