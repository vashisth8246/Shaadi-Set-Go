import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: mouse.x, y: mouse.y };
    let frame = 0;

    const move = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const updateHoverState = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const interactive = target.closest('a, button, input, textarea, select, [role="button"]');
      const image = target.closest('img, .luxury-image');
      document.body.classList.toggle('cursor-active', Boolean(interactive || image));
      document.body.classList.toggle('cursor-view', Boolean(image));
      setLabel(image ? 'VIEW +' : '');
    };

    const tick = () => {
      ring.x += (mouse.x - ring.x) * 0.16;
      ring.y += (mouse.y - ring.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.x - 4}px, ${mouse.y - 4}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x - 20}px, ${ring.y - 20}px, 0)`;
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', updateHoverState);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', updateHoverState);
      cancelAnimationFrame(frame);
      document.body.classList.remove('cursor-active', 'cursor-view');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="luxury-cursor-dot" />
      <div ref={ringRef} className="luxury-cursor-ring">
        {label}
      </div>
    </>
  );
}
