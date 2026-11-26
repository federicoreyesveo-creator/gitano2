/** Flecha "sale del sitio" en SVG: el carácter ↗ se dibuja como emoji en iPhone. */
export function ArrowOut() {
  return (
    <svg className="arrow-out" viewBox="0 0 12 12" aria-hidden>
      <path d="M3 9L9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}
