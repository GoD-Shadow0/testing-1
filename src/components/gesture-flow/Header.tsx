import { Fingerprint } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Fingerprint className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-headline font-semibold text-foreground">
          GestureFlow
        </h1>
      </div>
    </header>
  );
}
