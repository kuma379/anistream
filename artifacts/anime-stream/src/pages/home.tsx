import { useGetHome, useGetAnimeList } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingPage, LoadingRow } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { PlayCircle, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ScrollRow({ title, items, href }: { title: string; items: any[]; href?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth + 100 : clientWidth - 100;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative py-3 group/row">
      <div className="flex items-center justify-between px-4 md:px-8 mb-3">
        <h2 className="text-lg md:text-xl font-bold font-display text-foreground/90">{title}</h2>
        {href && (
          <Link href={href} className="text-xs font-medium text-primary hover:underline">
            View All
          </Link>
        )}
      </div>

      <div className="relative">
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 bottom-0 w-10 md:w-12 z-10 bg-gradient-to-r from-background via-background/80 to-transparent flex items-center justify-start px-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 overflow-x-auto scrollbar-none px-4 md:px-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((anime, i) => (
            <div
              key={anime.slug || i}
              className="flex-shrink-0 snap-start"
              style={{ width: "clamp(110px, 28vw, 160px)" }}
            >
              <AnimeCard anime={anime} index={i} />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 bottom-0 w-10 md:w-12 z-10 bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end px-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeroBanner({ featured }: { featured: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!featured || featured.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(featured.length, 5));
    }, 7000);
    return () => clearInterval(timer);
  }, [featured]);

  if (!featured || featured.length === 0) return null;

  const current = featured[currentIndex];

  const getHref = () => {
    switch (current.contentType) {
      case "film": return `/film/${current.slug}`;
      case "series": return `/series/${current.slug}`;
      default: return `/anime/${current.slug}`;
    }
  };

  return (
    /* Hero — 45vh on mobile, 65vh on desktop (reduced from 70/85vh) */
    <div className="relative w-full overflow-hidden" style={{ height: "clamp(300px, 45vh, 520px)" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={current.poster}
            alt={current.title}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end">
        <div className="w-full px-4 md:px-10 pb-10 md:pb-14">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-xl"
          >
            {current.type && (
              <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary border border-primary/50 rounded text-[10px] font-bold tracking-wider mb-2 uppercase">
                {current.type}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-display leading-tight mb-2 text-white drop-shadow-lg line-clamp-2">
              {current.title}
            </h1>
            <div className="flex items-center gap-3 mb-4 text-xs text-white/80 font-medium">
              {current.rating && current.rating !== "?" && (
                <span className="flex items-center gap-0.5">
                  <span className="text-yellow-400">★</span> {current.rating}
                </span>
              )}
              {current.episode && <span>{current.episode}</span>}
              {current.status && <span className="text-primary">{current.status}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" className="h-9 px-5 text-sm font-bold rounded-full gap-1.5 hover:scale-105 transition-transform" asChild>
                <Link href={getHref()}>
                  <PlayCircle className="w-4 h-4 fill-current" />
                  Watch Now
                </Link>
              </Button>
              <Button size="sm" variant="secondary" className="h-9 px-5 text-sm font-bold rounded-full gap-1.5 bg-secondary/80 backdrop-blur hover:scale-105 transition-transform" asChild>
                <Link href={getHref()}>
                  <Info className="w-4 h-4" />
                  Details
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slider dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {featured.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: homeData, isLoading: isLoadingHome, error: homeError } = useGetHome();

  const { data: filmsData, isLoading: isLoadingFilms } = useGetAnimeList({ category: "film" });
  const { data: donghuaData, isLoading: isLoadingDonghua } = useGetAnimeList({ category: "animedonghua" });

  if (isLoadingHome) return <LoadingPage />;
  if (homeError) return <ErrorState title="Gagal memuat halaman utama" />;
  if (!homeData) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroBanner featured={homeData.featured || homeData.latest || []} />

      <div className="space-y-4 md:space-y-6 relative z-20 -mt-4 md:-mt-6">
        <ScrollRow title="Episode Terbaru" items={homeData.latest || []} href="/list/update" />
        <ScrollRow title="Trending" items={homeData.popular || []} href="/list/populer" />

        {isLoadingFilms ? (
          <div className="px-4 md:px-8 py-3">
            <h2 className="text-lg md:text-xl font-bold font-display mb-3">Film & Movie</h2>
            <LoadingRow />
          </div>
        ) : (
          <ScrollRow title="Film & Movie" items={filmsData?.data || []} href="/list/film" />
        )}

        <ScrollRow title="Sedang Tayang" items={homeData.ongoing || []} href="/list/ongoing" />

        {isLoadingDonghua ? (
          <div className="px-4 md:px-8 py-3">
            <h2 className="text-lg md:text-xl font-bold font-display mb-3">Donghua</h2>
            <LoadingRow />
          </div>
        ) : (
          <ScrollRow title="Donghua" items={donghuaData?.data || []} href="/list/animedonghua" />
        )}
      </div>
    </div>
  );
}
