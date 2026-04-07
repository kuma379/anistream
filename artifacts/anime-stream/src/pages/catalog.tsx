import { useState, useEffect } from "react";
import { useGetCatalog } from "@workspace/api-client-react";
import type { GetCatalogOrder, GetCatalogType, GetCatalogStatus } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingGrid } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Catalog() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const debouncedTitle = useDebounce(title, 500);
  
  const [order, setOrder] = useState<GetCatalogOrder | "">("");
  const [type, setType] = useState<GetCatalogType | "">("");
  const [status, setStatus] = useState<GetCatalogStatus | "">("");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedTitle, order, type, status]);

  const params: any = { page };
  if (debouncedTitle) params.title = debouncedTitle;
  if (order) params.order = order;
  if (type) params.type = type;
  if (status) params.status = status;

  const { data, isLoading, error } = useGetCatalog(params);

  const resetFilters = () => {
    setTitle("");
    setOrder("");
    setType("");
    setStatus("");
    setPage(1);
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

        {isLoading ? (
          <LoadingGrid />
        ) : error ? (
          <ErrorState title="Failed to load catalog" />
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {data.data.map((anime, i) => (
                <AnimeCard key={anime.slug} anime={anime} index={i} />
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 pt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.pagination?.hasPrev || page === 1}
              >
                Previous
              </Button>
              <div className="font-medium px-4 py-2 bg-secondary rounded-md">
                Page {page}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => p + 1)}
                disabled={!data.pagination?.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
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
