import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { useGetByGenre } from "@workspace/api-client-react";
import type { AnimeCard as AnimeCardType } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loader2 } from "lucide-react";

export default function GenreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<AnimeCardType[]>([]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasNextRef = useRef(false);
  const loadingRef = useRef(false);

  // Reset when slug changes
  useEffect(() => {
    setPage(1);
    setAllItems([]);
    hasNextRef.current = false;
    loadingRef.current = false;
  }, [slug]);

  const { data, isLoading, error, isFetching } = useGetByGenre(slug || "", { page }, {
    query: { enabled: !!slug }
  });

  // Accumulate items across pages
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      if (page === 1) {
        setAllItems(data.data);
      } else {
        setAllItems(prev => {
          const existingSlugs = new Set(prev.map(a => a.slug));
          const newItems = data.data.filter(a => !existingSlugs.has(a.slug));
          return [...prev, ...newItems];
        });
      }
      hasNextRef.current = data.pagination?.hasNext ?? false;
      loadingRef.current = false;
    }
  }, [data, page]);

  // Intersection Observer for infinite scroll
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (entry.isIntersecting && hasNextRef.current && !loadingRef.current && !isFetching) {
      loadingRef.current = true;
      setPage(p => p + 1);
    }
  }, [isFetching]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (isLoading && page === 1) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load genre" />;
  if (!slug) return null;

  const title = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">{title} Anime</h1>
        <p className="text-muted-foreground mb-8 text-lg">Browse anime in the {title} genre</p>

        {allItems.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
              {allItems.map((anime, i) => (
                <AnimeCard key={`${anime.slug}-${i}`} anime={anime} index={i} />
              ))}
            </div>

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="flex justify-center py-8">
              {isFetching && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more...</span>
                </div>
              )}
              {!isFetching && !hasNextRef.current && allItems.length > 0 && (
                <p className="text-sm text-muted-foreground">Semua konten sudah dimuat</p>
              )}
            </div>
          </>
        ) : !isLoading ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No anime found in this genre</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
