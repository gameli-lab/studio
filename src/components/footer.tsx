export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AstroBook. All rights reserved. A showcase for Adeiso Astro Turf.
      </div>
    </footer>
  );
}
