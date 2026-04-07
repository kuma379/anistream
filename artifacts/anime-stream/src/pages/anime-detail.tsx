import { useParams, Link } from "wouter";
import { useGetAnimeDetail } from "@workspace/api-client-react";
import type { GetAnimeDetailType } from "@workspace/api-client-react";
import { LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Star, Calendar, Clock, Tv, ListVideo } from "lucide-react";
import { motion } from "framer-motion";

export default function AnimeDetail({ contentType }: { contentType: GetAnimeDetailType }) {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: anime, isLoading, error } = useGetAnimeDetail(
    slug || "", 
    { type: contentType },
    { query: { enabled: !!slug } }
  );

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load details" />;
  if (!anime) return null;

  const firstEpisode = anime.episodeList?.[anime.episodeList.length - 1]; // usually last in array is ep 1

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-background/80 z-10 backdrop-blur-sm" />
        <img 
          src={anime.poster} 
          alt="" 
          className="w-full h-full object-cover opacity-50 blur-md scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
      </div>

      <div className="container mx-auto px-4 relative z-30 -mt-32 md:-mt-48 pb-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 mx-auto md:mx-0 w-[240px] md:w-[300px]"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-secondary">
              <img 
                src={anime.poster} 
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              {contentType === "film" ? (
                <Button size="lg" className="w-full rounded-full gap-2 text-lg h-14" asChild>
                  <Link href={`/episode/${slug}`}>
                    <PlayCircle className="w-6 h-6 fill-current" />
                    Watch Film
                  </Link>
                </Button>
              ) : firstEpisode ? (
                <Button size="lg" className="w-full rounded-full gap-2 text-lg h-14" asChild>
                  <Link href={`/episode/${firstEpisode.slug}`}>
                    <PlayCircle className="w-6 h-6 fill-current" />
                    Watch First Episode
                  </Link>
                </Button>
              ) : (
                <Button size="lg" disabled className="w-full rounded-full gap-2 text-lg h-14 bg-secondary text-muted-foreground">
                  No Episodes Available
                </Button>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center md:text-left mt-4 md:mt-24"
          >
            {anime.type && (
              <Badge variant="outline" className="mb-4 bg-background/50 border-primary/50 text-primary">
                {anime.type}
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display leading-tight mb-2">
              {anime.title}
            </h1>
            
            {anime.alternativeTitle && (
              <p className="text-muted-foreground text-lg mb-6">{anime.alternativeTitle}</p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8 text-sm font-medium">
              {anime.rating && anime.rating !== "N/A" && anime.rating !== "?" && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-current" />
                  {anime.rating}
                </div>
              )}
              {anime.status && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Tv className="w-4 h-4" />
                  <span className={anime.status === "Currently Airing" ? "text-primary font-semibold" : ""}>
                    {anime.status}
                  </span>
                </div>
              )}
              {anime.released && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {anime.released}
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {anime.duration}
                </div>
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {anime.genres.map(g => (
                  <Badge key={g} variant="secondary" className="bg-secondary/50 hover:bg-secondary font-medium">
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-4 max-w-3xl">
              <h3 className="text-xl font-semibold">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base whitespace-pre-line">
                {anime.synopsis}
              </p>
            </div>
            
            {anime.studio && (
              <div className="mt-8">
                <span className="text-muted-foreground font-medium">Studio: </span>
                <span className="font-semibold">{anime.studio}</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Episode List */}
        {anime.episodeList && anime.episodeList.length > 0 && contentType !== "film" && (
          <div className="mt-16 md:mt-24">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <ListVideo className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-display">Episodes</h2>
              <Badge variant="secondary" className="ml-2 bg-secondary/80">
                {anime.episodeList.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {anime.episodeList.map((ep, i) => (
                <Link 
                  key={ep.slug} 
                  href={`/episode/${ep.slug}`}
                  className="flex flex-col p-4 rounded-xl border border-border/40 bg-secondary/20 hover:bg-primary/10 hover:border-primary/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1 pr-4">
                      {ep.title}
                    </span>
                    <PlayCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary opacity-50 group-hover:opacity-100 transition-all shrink-0" />
                  </div>
                  {ep.date && (
                    <span className="text-xs text-muted-foreground mt-auto">
                      {ep.date}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
