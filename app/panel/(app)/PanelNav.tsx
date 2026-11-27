"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/panel", label: "Agenda" },
  { href: "/panel/servicios", label: "Servicios" },
  { href: "/panel/horario", label: "Horario" },
];

export default function PanelNav() {
  const path = usePathname();
  return (
    <nav className="pn-nav" aria-label="Panel">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
