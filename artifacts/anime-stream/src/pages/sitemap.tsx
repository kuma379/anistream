import { Link } from "wouter";
import { Home, Film, BookOpen, Calendar, Tag, Search, Grid, Info, Shield, FileText, Map } from "lucide-react";

interface SitemapSection {
  title: string;
  icon: React.ReactNode;
  links: { label: string; href: string }[];
}

export default function Sitemap() {
  const sections: SitemapSection[] = [
    {
      title: "Halaman Utama",
      icon: <Home className="w-4 h-4" />,
      links: [
        { label: "Beranda", href: "/" },
        { label: "Pencarian", href: "/search" },
        { label: "Katalog", href: "/catalog" },
        { label: "Jadwal Tayang", href: "/schedule" },
        { label: "Genre", href: "/genre" },
      ],
    },
    {
      title: "Kategori Anime",
      icon: <Film className="w-4 h-4" />,
      links: [
        { label: "Semua Anime", href: "/list/all-anime" },
        { label: "Sedang Tayang (Ongoing)", href: "/list/ongoing" },
        { label: "Selesai (Completed)", href: "/list/completed" },
        { label: "Populer", href: "/list/populer" },
        { label: "Terbaru", href: "/list/update" },
        { label: "Episode Terbaru", href: "/list/latest" },
      ],
    },
    {
      title: "Film & Movie",
      icon: <Film className="w-4 h-4" />,
      links: [
        { label: "Semua Film & Movie", href: "/list/film" },
        { label: "TV Series", href: "/list/series" },
        { label: "TV Show", href: "/list/tvshow" },
        { label: "Lainnya", href: "/list/others" },
      ],
    },
    {
      title: "Donghua",
      icon: <BookOpen className="w-4 h-4" />,
      links: [
        { label: "Semua Donghua", href: "/list/animedonghua" },
      ],
    },
    {
      title: "Jadwal per Hari",
      icon: <Calendar className="w-4 h-4" />,
      links: [
        { label: "Jadwal Senin", href: "/schedule?day=senin" },
        { label: "Jadwal Selasa", href: "/schedule?day=selasa" },
        { label: "Jadwal Rabu", href: "/schedule?day=rabu" },
        { label: "Jadwal Kamis", href: "/schedule?day=kamis" },
        { label: "Jadwal Jumat", href: "/schedule?day=jumat" },
        { label: "Jadwal Sabtu", href: "/schedule?day=sabtu" },
        { label: "Jadwal Minggu", href: "/schedule?day=minggu" },
      ],
    },
    {
      title: "Genre Populer",
      icon: <Tag className="w-4 h-4" />,
      links: [
        { label: "Action", href: "/genre/action" },
        { label: "Adventure", href: "/genre/adventure" },
        { label: "Comedy", href: "/genre/comedy" },
        { label: "Drama", href: "/genre/drama" },
        { label: "Fantasy", href: "/genre/fantasy" },
        { label: "Romance", href: "/genre/romance" },
        { label: "Sci-Fi", href: "/genre/sci-fi" },
        { label: "Shounen", href: "/genre/shounen" },
        { label: "Slice of Life", href: "/genre/slice-of-life" },
        { label: "Supernatural", href: "/genre/supernatural" },
      ],
    },
    {
      title: "Informasi",
      icon: <Info className="w-4 h-4" />,
      links: [
        { label: "Tentang & Kontak", href: "/about" },
        { label: "Kebijakan Privasi", href: "/privacy-policy" },
        { label: "Syarat dan Ketentuan", href: "/terms" },
        { label: "Peta Situs", href: "/sitemap" },
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display">Peta Situs</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Semua halaman yang tersedia di XiciMovie</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-secondary/20 border border-border/30 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary">{section.icon}</span>
                <h2 className="font-bold text-foreground">{section.title}</h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
