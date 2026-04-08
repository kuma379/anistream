import { Mail, MapPin, Phone, MessageCircle, Clock, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-4">Tentang XiciMovie</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Platform streaming anime, donghua, dan film favorit kamu — gratis, cepat, dan selalu update.
          </p>
        </div>

        {/* About Section */}
        <section className="mb-14">
          <div className="bg-secondary/30 border border-border/40 rounded-2xl p-8 space-y-4">
            <h2 className="text-2xl font-bold font-display">Siapa Kami?</h2>
            <p className="text-muted-foreground leading-relaxed">
              XiciMovie adalah platform streaming anime berbasis web yang hadir untuk memudahkan penggemar
              anime Indonesia menikmati konten favorit mereka. Kami menyediakan koleksi anime, donghua,
              dan film dengan subtitle Indonesia yang terus diperbarui setiap hari.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Kami berkomitmen untuk memberikan pengalaman menonton terbaik — tampilan bersih, navigasi mudah,
              dan konten berkualitas tanpa gangguan berlebihan.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold font-display mb-6">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🎬", title: "Ribuan Konten", desc: "Anime, donghua, dan film terlengkap" },
              { icon: "⚡", title: "Update Cepat", desc: "Episode baru ditambahkan setiap hari" },
              { icon: "📱", title: "Mobile Friendly", desc: "Nyaman ditonton di HP maupun komputer" },
              { icon: "🔍", title: "Pencarian Mudah", desc: "Temukan konten favorit dengan cepat" },
              { icon: "🌐", title: "Multi Server", desc: "Server streaming cadangan jika satu down" },
              { icon: "🆓", title: "Gratis 100%", desc: "Tidak ada biaya berlangganan" },
            ].map((f) => (
              <div key={f.title} className="bg-secondary/20 border border-border/30 rounded-xl p-5">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold font-display mb-6">Hubungi Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="mailto:admin@xicimovie.web.id"
              className="flex items-center gap-4 bg-secondary/20 border border-border/30 rounded-xl p-5 hover:border-primary/50 hover:bg-secondary/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">admin@xicimovie.web.id</p>
              </div>
            </a>

            <a
              href="https://t.me/xicimovie_official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-secondary/20 border border-border/30 rounded-xl p-5 hover:border-primary/50 hover:bg-secondary/40 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Telegram</p>
                <p className="text-sm text-muted-foreground">@xicimovie_official</p>
              </div>
            </a>

            <div className="flex items-center gap-4 bg-secondary/20 border border-border/30 rounded-xl p-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Jam Respon</p>
                <p className="text-sm text-muted-foreground">Senin–Jumat, 09.00–17.00 WIB</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-secondary/20 border border-border/30 rounded-xl p-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Laporan Konten</p>
                <p className="text-sm text-muted-foreground">report@xicimovie.web.id</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
