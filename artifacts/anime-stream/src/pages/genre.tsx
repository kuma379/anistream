import { useGetGenres } from "@workspace/api-client-react";
import { LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Genres() {
  const { data, isLoading, error } = useGetGenres();

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load genres" />;
  if (!data?.data) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold font-display mb-8">All Genres</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.data.map((genre, index) => (
            <motion.div
              key={genre.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href={`/genre/${genre.slug}`}
                className="flex flex-col items-center justify-center p-4 text-center rounded-xl bg-secondary/40 border border-border/50 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all group"
              >
                <span className="font-semibold">{genre.name}</span>
                {genre.count && (
                  <span className="text-xs text-muted-foreground mt-1 group-hover:text-primary/70">
                    {genre.count} Series
                  </span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
