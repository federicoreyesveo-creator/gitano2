import Link from "next/link";

/** Barra de arriba de las páginas de reserva y del panel: la carita lleva al sitio. */
export default function BkHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bk-head">
      <Link href="/" className="bk-head-logo" aria-label="Gitano Studio, ir al sitio">
        <img src="/img/carita-200.webp" alt="" width={200} height={188} />
        <span>Gitano Studio</span>
      </Link>
      <div className="bk-head-r">{children ?? <Link href="/" className="bk-head-link">Volver al sitio</Link>}</div>
    </header>
  );
}
