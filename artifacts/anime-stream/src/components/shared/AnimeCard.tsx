import { Link } from "wouter";
import { PlayCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { AnimeCard as AnimeCardType } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  anime: AnimeCardType;
  index?: number;
}

export function AnimeCard({ anime, index = 0 }: Props) {
  const getHref = () => {
    switch (anime.contentType) {
      case "film":
        return `/film/${anime.slug}`;
      case "series":
        return `/series/${anime.slug}`;
      default:
        return `/anime/${anime.slug}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      className="group relative flex flex-col gap-2 rounded-xl overflow-hidden cursor-pointer"
    >
      <Link href={getHref()} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary/20">
          {anime.poster ? (
            <img
              src={anime.poster}
              alt={anime.title}
              loading="lazy"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement?.classList.add("bg-gradient-to-tr", "from-secondary", "to-muted");
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-secondary to-muted" />
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-12 h-12 text-white fill-primary/80 drop-shadow-lg" />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {anime.rating && anime.rating !== "N/A" && anime.rating !== "?" && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs font-semibold gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {anime.rating}
              </Badge>
            )}
          </div>
          
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {anime.type && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-xs font-semibold">
                {anime.type}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
            {anime.episode && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-border/50 text-xs">
                {anime.episode}
              </Badge>
            )}
            {anime.status && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] uppercase px-1.5 py-0">
                {anime.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-1">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
