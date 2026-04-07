import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSearchAnime } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // We'll need to create this

export default function Search() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== initialQuery) {
      setLocation(`/search?q=${encodeURIComponent(debouncedQuery)}`, { replace: true });
    } else if (!debouncedQuery && initialQuery) {
      setLocation(`/search`, { replace: true });
    }
  }, [debouncedQuery, setLocation, initialQuery]);

  const { data, isLoading, error } = useSearchAnime(
    { q: debouncedQuery, page: 1 },
    { query: { enabled: debouncedQuery.length > 2 } }
  );

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-6 text-center">Search Anime</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-lg rounded-full bg-secondary/50 border-border/50 focus-visible:ring-primary"
              autoFocus
            />
          </div>
        </div>

        {debouncedQuery.length <= 2 ? (
          <div className="text-center py-20 text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">Type at least 3 characters to search</p>
          </div>
        ) : isLoading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState title="Search Failed" message="Could not fetch search results." />
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">Found {data.data.length} results for "{debouncedQuery}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {data.data.map((anime, i) => (
                <AnimeCard key={anime.slug} anime={anime} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No results found for "{debouncedQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
