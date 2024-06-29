import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forum Post - Home",
  description: "Your platform for discussion",
};

export default function Home() {
  return (
    <section className="container px-6 py-4">
      <div className="flex flex-col justify-center items-center">
        <HighlightSection />
      </div>
    </section>
  );
}

function HighlightSection() {
  return (
    <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-tr from-gray-300/2">
      <div className="text-center w-full">
        <h2 className="text-4xl font-semibold">
          Your <span className="text-primary">forum</span>, your{" "}
          <span className="text-primary">post</span>
        </h2>
        <p className="text-gray-300  font-light mt-2 text-lg">
          Your platform for discussion
        </p>
      </div>
      <Link
        href="/login"
        className="mt-12 px-12 py-3 border rounded-md border-gray-400 hover:bg-primary hover:text-primary-foreground hover:scale-105  transition-all"
      >
        Continue now
      </Link>
    </div>
  );
}
