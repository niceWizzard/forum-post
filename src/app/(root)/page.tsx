import { Metadata } from "next";
import Link from "next/link";
import { MotionDiv, MotionH2, MotionP } from "./_components/motionComponents";

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
    <section className="h-[80vh] w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-tr from-gray-300/2">
      <div className="text-center w-full">
        <MotionH2
          className="text-4xl font-semibold"
          initial={{
            opacity: 0,
            translateY: "-75%",
          }}
          transition={{
            type: "spring",
            duration: 1.5,
            stiffness: 150,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
        >
          Your{" "}
          <span className="text-primary hover:scale-105 inline-block transition-transform">
            forum
          </span>
          , your &nbsp;
          <span className="text-primary hover:scale-105 inline-block transition-transform">
            post
          </span>
        </MotionH2>
        <MotionP
          className="text-gray-300  font-light mt-2 text-lg"
          initial={{
            opacity: 0,
            translateY: "75%",
          }}
          transition={{
            delay: 1,
            type: "spring",
            duration: 1.5,
            stiffness: 150,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
        >
          Your platform for discussion
        </MotionP>
      </div>
      <MotionDiv
        className="mt-12"
        initial={{
          opacity: 0,
          scale: 0.75,
        }}
        transition={{
          delay: 1.25,
          type: "spring",
          duration: 1.5,
          stiffness: 200,
          damping: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        <Link
          href="/login"
          className="px-12 py-3 border rounded-md border-gray-400 hover:bg-primary hover:text-primary-foreground transition-all"
        >
          Continue now
        </Link>
      </MotionDiv>
    </section>
  );
}
