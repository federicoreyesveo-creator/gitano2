import { BOOK_URL, INSTAGRAM_URL, MAPS_URL, WHATSAPP_URL } from "@/lib/data";

// Redes y canales del estudio, con ícono. Se usa en el pie y en el menú.
const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.1L4 20z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 8.5c0 3 2.5 6 6 6.5l1-1.6-2-1-1 .9c-1-.4-2.1-1.5-2.5-2.5l.9-1-1-2L9 8.5z" fill="currentColor" />
    </svg>
  ),
  maps: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="2.3" fill="currentColor" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
};

const LINKS = [
  { href: INSTAGRAM_URL, label: "Instagram", icon: ICONS.instagram },
  { href: WHATSAPP_URL, label: "WhatsApp", icon: ICONS.whatsapp },
  { href: BOOK_URL, label: "Agendar", icon: ICONS.book },
  { href: MAPS_URL, label: "Google Maps", icon: ICONS.maps },
];

export default function Social({ tabIndex }: { tabIndex?: number }) {
  return (
    <ul className="va-social" aria-label="Redes y contacto">
      {LINKS.map((l) => (
        <li key={l.label}>
          <a href={l.href} target="_blank" rel="noopener" tabIndex={tabIndex}>
            {l.icon}
            <span>{l.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
