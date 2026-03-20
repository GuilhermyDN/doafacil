"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/doacao",      label: "Doação",       icon: "♡" },
  { href: "/admin",       label: "Painel Admin",  icon: "⊞" },
  { href: "/instituicao", label: "Instituições",  icon: "◎" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 flex items-center px-6 gap-2">
      <Link href="/" className="font-serif text-xl text-green-500 mr-auto py-4">
        DoaFácil
      </Link>
      {links.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: active ? "#E1F5EE" : "transparent",
              color: active ? "#085041" : "#888780",
            }}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
