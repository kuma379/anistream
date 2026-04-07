import { useState } from "react";
import { useParams } from "wouter";
import { useGetByGenre } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingGrid, LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";

export default function GenreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useGetByGenre(slug || "", { page }, {
    query: { enabled: !!slug }
  });

  if (isLoading && page === 1) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load genre" />;
  if (!slug) return null;

  const title = slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">{title} Anime</h1>
        <p className="text-muted-foreground mb-8 text-lg">Browse anime in the {title} genre</p>

        {isLoading && page > 1 ? (
          <LoadingGrid />
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {data.data.map((anime, i) => (
                <AnimeCard key={anime.slug} anime={anime} index={i} />
              ))}
            </div>
            
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
            <p className="text-lg">No anime found in this genre</p>
          </div>
        )}
      </div>
    </div>
  );
}
