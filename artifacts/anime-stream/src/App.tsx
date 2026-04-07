import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import Home from "@/pages/home";
import Search from "@/pages/search";
import Catalog from "@/pages/catalog";
import Genres from "@/pages/genre";
import GenreDetail from "@/pages/genre-detail";
import Schedule from "@/pages/schedule";
import AnimeDetail from "@/pages/anime-detail";
import Episode from "@/pages/episode";
import CategoryList from "@/pages/category-list";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/catalog" component={Catalog} />
          <Route path="/genre" component={Genres} />
          <Route path="/genre/:slug" component={GenreDetail} />
          <Route path="/schedule" component={Schedule} />
          
          <Route path="/anime/:slug">
            {() => <AnimeDetail contentType="anime" />}
          </Route>
          <Route path="/series/:slug">
            {() => <AnimeDetail contentType="series" />}
          </Route>
          <Route path="/film/:slug">
            {() => <AnimeDetail contentType="film" />}
          </Route>
          
          <Route path="/episode/:slug" component={Episode} />
          <Route path="/list/:category" component={CategoryList} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Hide navbar/footer on video player page
  const isVideoRoute = window.location.pathname.includes('/episode/');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {isVideoRoute ? (
            <Switch>
              <Route path="/episode/:slug" component={Episode} />
              <Route component={Router} />
            </Switch>
          ) : (
            <Router />
          )}
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
