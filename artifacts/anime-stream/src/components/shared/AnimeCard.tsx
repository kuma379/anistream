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
      case "film": return `/film/${anime.slug}`;
      case "series": return `/series/${anime.slug}`;
      default: return `/anime/${anime.slug}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      whileHover={{ scale: 1.03 }}
      className="group relative flex flex-col gap-1.5 cursor-pointer w-full"
    >
      <Link href={getHref()} className="block">
        <div className="relative w-full overflow-hidden rounded-lg bg-secondary/20" style={{ aspectRatio: "2/3" }}>
          {anime.poster ? (
            <img
              src={anime.poster}
              alt={anime.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ display: "block", maxWidth: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                t.parentElement?.classList.add("bg-gradient-to-tr", "from-secondary", "to-muted");
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-secondary to-muted" />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircle className="w-10 h-10 text-white fill-primary/80 drop-shadow-lg" />
          </div>

          {/* Top badges */}
          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
            {anime.rating && anime.rating !== "N/A" && anime.rating !== "?" && (
              <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-[10px] font-semibold gap-0.5 px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                {anime.rating}
              </Badge>
            )}
          </div>
          <div className="absolute top-1.5 right-1.5">
            {anime.type && (
              <Badge className="bg-primary/90 backdrop-blur-sm text-[10px] font-semibold px-1.5 py-0.5">
                {anime.type}
              </Badge>
            )}
          </div>

          {/* Bottom badges */}
          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between items-end">
            {anime.episode && (
              <Badge variant="outline" className="bg-black/70 backdrop-blur-sm border-border/50 text-[10px] px-1.5 py-0.5">
                {anime.episode}
              </Badge>
            )}
            {anime.status && (
              <Badge variant="secondary" className="bg-black/70 backdrop-blur-sm text-[9px] uppercase px-1 py-0">
                {anime.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-1.5 px-0.5">
          <h3 className="font-medium text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {anime.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
