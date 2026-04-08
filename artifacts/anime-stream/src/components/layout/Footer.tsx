import { Link } from "wouter";
import { PlayCircle } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  const links = [
    { label: "Tentang & Kontak", href: "/about" },
    { label: "Kebijakan Privasi", href: "/privacy-policy" },
    { label: "Syarat dan Ketentuan", href: "/terms" },
    { label: "Peta Situs", href: "/sitemap" },
  ];

  const categories = [
    { label: "Anime", href: "/list/all-anime" },
    { label: "Film & Movie", href: "/list/film" },
    { label: "Donghua", href: "/list/animedonghua" },
    { label: "Ongoing", href: "/list/ongoing" },
    { label: "Populer", href: "/list/populer" },
    { label: "Jadwal", href: "/schedule" },
  ];

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-primary fill-primary/30" />
              </div>
              <span className="font-bold text-lg font-display">AniStream</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform streaming anime, donghua, dan film favorit kamu — gratis dan selalu update.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground/80 uppercase tracking-wide">Kategori</h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground/80 uppercase tracking-wide">Informasi</h3>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {year} AniStream. Semua konten adalah milik pemegang hak cipta masing-masing.
          </p>
          <p className="text-xs text-muted-foreground">
            Dibuat dengan ❤️ untuk penggemar anime Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
