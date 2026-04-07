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
    <div className="relative py-4 group/row">
      <div className="flex items-center justify-between px-4 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold font-display text-foreground/90">{title}</h2>
        {href && (
          <Link href={href} className="text-sm font-medium text-primary hover:underline hidden sm:block">
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
              className="absolute left-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-r from-background via-background/80 to-transparent flex items-center justify-start px-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        <div 
          ref={scrollRef} 
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-8 snap-x snap-mandatory"
        >
          {items.map((anime, i) => (
            <div key={anime.slug} className="min-w-[150px] md:min-w-[200px] flex-shrink-0 snap-start">
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
              className="absolute right-0 top-0 bottom-0 w-12 md:w-16 z-10 bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end px-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center border border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
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
    }, 8000);
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
    <div className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={current.poster}
            alt={current.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto px-4 md:px-8 pb-24 md:pb-32">
          <motion.div
            key={`content-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl"
          >
            {current.type && (
              <span className="inline-block px-2 py-1 bg-primary/20 text-primary border border-primary/50 rounded text-xs font-bold tracking-wider mb-4 uppercase">
                {current.type}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold font-display leading-tight mb-4 drop-shadow-lg text-white">
              {current.title}
            </h1>
            <div className="flex items-center gap-4 mb-6 text-sm text-white/80 font-medium">
              {current.rating && current.rating !== "?" && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">★</span> {current.rating}
                </span>
              )}
              {current.episode && <span>{current.episode}</span>}
              {current.status && <span className="text-primary">{current.status}</span>}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <Button size="lg" className="h-12 px-6 md:px-8 text-base font-bold rounded-full gap-2 hover:scale-105 transition-transform" asChild>
                <Link href={getHref()}>
                  <PlayCircle className="w-5 h-5 fill-current" />
                  Watch Now
                </Link>
              </Button>
              <Button size="lg" variant="secondary" className="h-12 px-6 md:px-8 text-base font-bold rounded-full gap-2 bg-secondary/80 backdrop-blur hover:bg-secondary hover:scale-105 transition-transform" asChild>
                <Link href={getHref()}>
                  <Info className="w-5 h-5" />
                  Details
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Slider indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {featured.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-8 bg-primary" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: homeData, isLoading: isLoadingHome, error: homeError } = useGetHome();
  
  const { data: filmsData, isLoading: isLoadingFilms } = useGetAnimeList({ 
    category: "film" 
  });
  
  const { data: donghuaData, isLoading: isLoadingDonghua } = useGetAnimeList({ 
    category: "animedonghua" 
  });

  if (isLoadingHome) return <LoadingPage />;
  if (homeError) return <ErrorState title="Failed to load homepage" />;
  if (!homeData) return null;

  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroBanner featured={homeData.featured || homeData.latest} />
      
      <div className="space-y-6 md:space-y-8 -mt-8 md:-mt-12 relative z-20">
        <ScrollRow title="Latest Episodes" items={homeData.latest} href="/list/update" />
        <ScrollRow title="Trending Now" items={homeData.popular} href="/list/populer" />
        
        {isLoadingFilms ? (
          <div className="px-4 md:px-8 py-4"><h2 className="text-xl md:text-2xl font-bold font-display mb-4">Films & Movies</h2><LoadingRow /></div>
        ) : (
          <ScrollRow title="Films & Movies" items={filmsData?.data || []} href="/list/film" />
        )}
        
        <ScrollRow title="Ongoing Series" items={homeData.ongoing} href="/list/ongoing" />
        
        {isLoadingDonghua ? (
          <div className="px-4 md:px-8 py-4"><h2 className="text-xl md:text-2xl font-bold font-display mb-4">Donghua</h2><LoadingRow /></div>
        ) : (
          <ScrollRow title="Donghua" items={donghuaData?.data || []} href="/list/animedonghua" />
        )}
      </div>
    </div>
  );
}
