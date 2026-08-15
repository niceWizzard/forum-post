import Link from "next/link";
import { MessagesSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8 mt-auto">
      <div className="container max-w-screen-2xl px-4 sm:px-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <MessagesSquare className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-tight">ForumPost</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A modern discussion platform designed for productive conversations.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link href="/feed" className="transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link href="/forum/create" className="transition-colors hover:text-foreground">
            Create Forum
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ForumPost. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
