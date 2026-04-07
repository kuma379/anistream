export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto">
      <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built with React & Vite. Designed for passionate anime fans.
        </p>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            AniStream &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
