import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetEpisode, useGetServer } from "@workspace/api-client-react";
import { LoadingPage } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, LayoutGrid, MonitorPlay, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Episode() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: episode, isLoading, error } = useGetEpisode(slug || "", {
    query: { enabled: !!slug }
  });

  const [activeServer, setActiveServer] = useState<any>(null);
  
  // Set default server when data loads
  useEffect(() => {
    if (episode?.servers && episode.servers.length > 0 && !activeServer) {
      setActiveServer(episode.servers[0]);
    }
  }, [episode, activeServer]);

  // When slug changes, reset active server so it re-selects the first one of new ep
  useEffect(() => {
    setActiveServer(null);
  }, [slug]);

  const { data: serverData, isLoading: isLoadingServer, error: serverError } = useGetServer(
    { 
      post: activeServer?.post || "", 
      nume: activeServer?.nume || "", 
      type: activeServer?.type || "" 
    },
    { 
      query: { 
        enabled: !!activeServer?.post && !!activeServer?.nume,
        queryKey: [`server`, activeServer?.post, activeServer?.nume] 
      } 
    }
  );

  if (isLoading && !episode) return <LoadingPage />;
  if (error) return <ErrorState title="Failed to load episode" />;
  if (!episode) return null;

  // Prioritize the server embedUrl if fetched, otherwise fallback to the default one if present
  const videoUrl = serverData?.embedUrl || (activeServer === null ? episode.embedUrl : "");

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* Player header */}
      <div className="bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between z-10 sticky top-0">
        <Link href={episode.animeSlug ? `/anime/${episode.animeSlug}` : "/"} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Back to Series</span>
        </Link>
        <div className="text-center flex-1 px-4 truncate">
          <h1 className="font-display font-bold text-lg truncate">
            <span className="text-primary mr-2">{episode.animeTitle || "Anime"}</span>
            <span className="text-white/60">/</span>
            <span className="ml-2">{episode.title}</span>
          </h1>
        </div>
        <div className="w-[100px]" /> {/* Spacer for balance */}
      </div>

      {/* Video Container */}
      <div className="w-full bg-black flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-6xl aspect-video bg-zinc-900 relative shadow-2xl">
          {isLoadingServer ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white/50">
              <MonitorPlay className="w-12 h-12 mb-4 animate-pulse opacity-50" />
              <p>Loading video player...</p>
            </div>
          ) : serverError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-destructive">
              <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
              <p>Failed to load this server. Try another one below.</p>
            </div>
          ) : videoUrl ? (
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              title={episode.title}
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white/50">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p>Video not available. Please try another server.</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls & Info */}
      <div className="w-full max-w-6xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-8 pb-20">
        
        {/* Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
          {episode.prevEpisode ? (
            <Button variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href={`/episode/${episode.prevEpisode}`}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Prev
              </Link>
            </Button>
          ) : <div className="w-[100px]" />}

          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <Link href={episode.animeSlug ? `/anime/${episode.animeSlug}` : "/"}>
              <LayoutGrid className="w-4 h-4 mr-2" /> Episode List
            </Link>
          </Button>

          {episode.nextEpisode ? (
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link href={`/episode/${episode.nextEpisode}`}>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : <div className="w-[100px]" />}
        </div>

        {/* Server Selection */}
        {episode.servers && episode.servers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">Select Server</h3>
            <div className="flex flex-wrap gap-2">
              {episode.servers.map((server, i) => (
                <Button
                  key={i}
                  variant={activeServer?.name === server.name ? "default" : "outline"}
                  onClick={() => setActiveServer(server)}
                  className={`
                    ${activeServer?.name === server.name 
                      ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <MonitorPlay className="w-4 h-4 mr-2 opacity-70" />
                  {server.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
