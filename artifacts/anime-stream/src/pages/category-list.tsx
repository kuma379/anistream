import { useParams } from "wouter";
import { useState } from "react";
import { useGetAnimeList } from "@workspace/api-client-react";
import type { GetAnimeListCategory } from "@workspace/api-client-react";
import { AnimeCard } from "@/components/shared/AnimeCard";
import { LoadingGrid, LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";

export default function CategoryList() {
  const { category } = useParams<{ category: string }>();
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useGetAnimeList(
    { category: category as GetAnimeListCategory, page },
    { query: { enabled: !!category } }
  );

  if (isLoading && page === 1) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load category list" />;
  if (!category) return null;

  const titleMap: Record<string, string> = {
    animedonghua: "Donghua",
    film: "Films & Movies",
    series: "TV Series",
    tvshow: "TV Shows",
    others: "Others",
    ongoing: "Ongoing Anime",
    completed: "Completed Anime",
    populer: "Popular Anime",
    latest: "Latest Releases",
    update: "Recently Updated",
    "all-anime": "All Anime",
    "all-anime-reverse": "All Anime (Oldest First)"
  };

  const title = titleMap[category] || category.replace(/-/g, " ");

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">{title}</h1>

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
            <p className="text-lg">No content found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
