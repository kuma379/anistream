import { useState, useEffect, useRef, useCallback } from "react";
import { useGetCatalog } from "@workspace/api-client-react";
import type { GetCatalogOrder, GetCatalogType, GetCatalogStatus, AnimeCard as AnimeCardType } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Catalog() {
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<AnimeCardType[]>([]);
  const [title, setTitle] = useState("");
  const debouncedTitle = useDebounce(title, 500);
  
  const [order, setOrder] = useState<GetCatalogOrder | "">("");
  const [type, setType] = useState<GetCatalogType | "">("");
  const [status, setStatus] = useState<GetCatalogStatus | "">("");

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasNextRef = useRef(false);
  const loadingRef = useRef(false);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setAllItems([]);
  }, [debouncedTitle, order, type, status]);

  const params: any = { page };
  if (debouncedTitle) params.title = debouncedTitle;
  if (order) params.order = order;
  if (type) params.type = type;
  if (status) params.status = status;

  const { data, isLoading, error, isFetching } = useGetCatalog(params);

  // Accumulate items as pages load
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

  const resetFilters = () => {
    setTitle("");
    setOrder("");
    setType("");
    setStatus("");
    setPage(1);
    setAllItems([]);
  };

  const hasFilters = title || order || type || status;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">Catalog</h1>
        
        <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search catalog..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Select value={order} onValueChange={(v: any) => setOrder(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">Latest Update</SelectItem>
                  <SelectItem value="title">A-Z</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TV">TV Series</SelectItem>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="OVA">OVA</SelectItem>
                  <SelectItem value="Special">Special</SelectItem>
                  <SelectItem value="ONA">ONA</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="col-span-2 md:col-span-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Currently Airing">Currently Airing</SelectItem>
                  <SelectItem value="Finished Airing">Finished Airing</SelectItem>
                  <SelectItem value="Not yet aired">Not Yet Aired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {hasFilters && (
              <Button variant="ghost" onClick={resetFilters} className="px-3 text-muted-foreground hover:text-foreground md:flex-none">
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 md:gap-3">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-secondary/40 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load catalog" />
        ) : allItems.length > 0 ? (
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
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Filter className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No anime found matching your filters</p>
            <Button variant="link" onClick={resetFilters} className="mt-4">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
