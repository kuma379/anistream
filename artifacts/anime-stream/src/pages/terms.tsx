export default function Terms() {
  const lastUpdated = "1 April 2025";
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold font-display mb-2">Syarat dan Ketentuan</h1>
          <p className="text-muted-foreground text-sm">Terakhir diperbarui: {lastUpdated}</p>
        </div>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <Section title="1. Persetujuan Penggunaan">
            <p>
              Dengan mengakses dan menggunakan XiciMovie, kamu menyetujui syarat dan ketentuan ini secara penuh.
              Jika kamu tidak menyetujui bagian manapun dari ketentuan ini, harap tidak menggunakan layanan kami.
            </p>
          </Section>

          <Section title="2. Layanan yang Disediakan">
            <p>
              XiciMovie menyediakan platform untuk menonton anime, donghua, dan film melalui embed dari sumber
              pihak ketiga. Kami berfungsi sebagai agregator konten dan tidak menyimpan file media apapun di
              server kami secara langsung.
            </p>
          </Section>

          <Section title="3. Penggunaan yang Diizinkan">
            <p>Pengguna diizinkan untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Mengakses dan menonton konten yang tersedia untuk keperluan pribadi dan non-komersial</li>
              <li>Menggunakan fitur pencarian, filter, dan navigasi yang disediakan</li>
              <li>Berbagi tautan halaman kepada orang lain</li>
            </ul>
          </Section>

          <Section title="4. Penggunaan yang Dilarang">
            <p>Pengguna dilarang untuk:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Mengunduh, mendistribusikan ulang, atau menjual konten yang ada di platform ini</li>
              <li>Menggunakan bot, scraper, atau alat otomatis untuk mengakses atau mengumpulkan data</li>
              <li>Mencoba merusak, menghack, atau mengganggu layanan</li>
              <li>Menggunakan platform untuk tujuan ilegal atau melanggar hukum</li>
              <li>Menampilkan konten platform ini di situs lain tanpa izin</li>
            </ul>
          </Section>

          <Section title="5. Hak Kekayaan Intelektual">
            <p>
              Seluruh konten anime, film, dan donghua yang ditampilkan merupakan hak milik pemegang hak cipta
              masing-masing (studio produksi, distributor, dll). XiciMovie tidak mengklaim kepemilikan atas
              konten tersebut. Jika kamu adalah pemegang hak cipta dan merasa kontenmu ditampilkan tanpa izin,
              silakan hubungi kami untuk penghapusan.
            </p>
          </Section>

          <Section title="6. Penafian Tanggung Jawab">
            <p>
              XiciMovie disediakan "sebagaimana adanya" tanpa jaminan apapun. Kami tidak bertanggung jawab atas:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Gangguan atau ketidaktersediaan layanan</li>
              <li>Kualitas atau ketersediaan konten dari sumber pihak ketiga</li>
              <li>Kerugian apapun yang timbul dari penggunaan layanan ini</li>
            </ul>
          </Section>

          <Section title="7. Konten Pihak Ketiga">
            <p>
              Situs ini menampilkan konten yang diembed dari layanan pihak ketiga. Kami tidak mengendalikan
              konten tersebut dan tidak bertanggung jawab atas ketersediaan, akurasi, atau kelayakannya.
              Penggunaan layanan pihak ketiga tersebut tunduk pada syarat dan ketentuan mereka masing-masing.
            </p>
          </Section>

          <Section title="8. Batasan Usia">
            <p>
              Beberapa konten di platform ini mungkin tidak sesuai untuk anak-anak di bawah 13 tahun.
              Dengan menggunakan layanan ini, kamu menyatakan bahwa kamu berusia minimal 13 tahun atau
              menggunakannya di bawah pengawasan orang tua atau wali.
            </p>
          </Section>

          <Section title="9. Perubahan Layanan">
            <p>
              Kami berhak mengubah, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan
              sebelumnya. Kami juga dapat memperbarui syarat dan ketentuan ini. Perubahan berlaku sejak
              dipublikasikan di halaman ini.
            </p>
          </Section>

          <Section title="10. Hukum yang Berlaku">
            <p>
              Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan akan
              diselesaikan melalui jalur yang berlaku sesuai hukum Indonesia.
            </p>
          </Section>

          <Section title="11. Hubungi Kami">
            <p>
              Pertanyaan mengenai syarat dan ketentuan ini dapat dikirimkan ke:{" "}
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
