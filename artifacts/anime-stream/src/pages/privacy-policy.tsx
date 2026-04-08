export default function PrivacyPolicy() {
  const lastUpdated = "1 April 2025";
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold font-display mb-2">Kebijakan Privasi</h1>
          <p className="text-muted-foreground text-sm">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <Section title="1. Informasi yang Kami Kumpulkan">
            <p>XiciMovie tidak mengharuskan pengguna untuk membuat akun atau mendaftar. Kami mungkin mengumpulkan informasi berikut secara otomatis saat kamu menggunakan layanan kami:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Data teknis seperti jenis browser, sistem operasi, dan alamat IP</li>
              <li>Halaman yang dikunjungi dan durasi kunjungan</li>
              <li>Data penggunaan anonim melalui alat analitik</li>
            </ul>
          </Section>

          <Section title="2. Cara Kami Menggunakan Data">
            <p>Informasi yang dikumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Meningkatkan performa dan pengalaman pengguna situs</li>
              <li>Menganalisis tren penggunaan untuk pengembangan fitur</li>
              <li>Mencegah penyalahgunaan dan memastikan keamanan layanan</li>
            </ul>
          </Section>

          <Section title="3. Cookie">
            <p>
              Kami menggunakan cookie dan teknologi serupa untuk menyimpan preferensi pengguna (seperti tema tampilan)
              dan menganalisis traffic situs. Kamu dapat menonaktifkan cookie melalui pengaturan browser, namun
              beberapa fitur mungkin tidak berfungsi optimal.
            </p>
          </Section>

          <Section title="4. Layanan Pihak Ketiga">
            <p>
              XiciMovie menggunakan layanan pihak ketiga termasuk penyedia server video. Layanan-layanan ini
              memiliki kebijakan privasi tersendiri yang terpisah dari kebijakan kami. Kami tidak bertanggung
              jawab atas praktik privasi pihak ketiga tersebut.
            </p>
          </Section>

          <Section title="5. Keamanan Data">
            <p>
              Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi data yang kami kumpulkan.
              Namun, tidak ada metode transmisi data melalui internet yang 100% aman. Kami tidak dapat
              menjamin keamanan absolut dari informasi yang ditransmisikan ke situs kami.
            </p>
          </Section>

          <Section title="6. Konten dari Sumber Ketiga">
            <p>
              Konten yang ditampilkan di XiciMovie bersumber dari penyedia layanan streaming pihak ketiga.
              XiciMovie tidak menyimpan atau menghosting file video secara langsung. Semua konten ditampilkan
              melalui embed dari sumber aslinya.
            </p>
          </Section>

          <Section title="7. Hak Pengguna">
            <p>Kamu berhak untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Mengetahui data apa yang kami kumpulkan</li>
              <li>Meminta penghapusan data yang berkaitan denganmu</li>
              <li>Mengajukan pertanyaan tentang privasi ke email kami</li>
            </ul>
          </Section>

          <Section title="8. Perubahan Kebijakan">
            <p>
              Kami dapat memperbarui kebijakan privasi ini sewaktu-waktu. Perubahan akan diberitahukan melalui
              pembaruan tanggal di halaman ini. Dengan terus menggunakan layanan kami setelah perubahan,
              kamu dianggap menyetujui kebijakan yang telah diperbarui.
            </p>
          </Section>

          <Section title="9. Hubungi Kami">
            <p>
              Jika kamu memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami di:{" "}
              <a href="mailto:admin@xicimovie.web.id" className="text-primary hover:underline">
                admin@xicimovie.web.id
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary/20 border border-border/30 rounded-xl p-6">
      <h2 className="text-lg font-bold text-foreground mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
