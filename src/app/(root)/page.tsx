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
        <CountSection />
        <CommunitySection />
      </div>
    </section>
  );
}

function HighlightSection() {
  return (
    <section className="h-[90vh] w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-tr from-gray-300/2">
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

function CountSection() {
  return (
    <section className="w-full min-h-[70vh]">
      <MotionDiv
        initial={{
          opacity: 0,
        }}
        transition={{
          delay: 0.25,
          duration: 1.5,
        }}
        whileInView={{
          opacity: 1,
        }}
        className="overflow-hidden max-w-6xl mx-auto bg-card text-card-foreground rounded-md p-6 grid gap-4 grid-cols-[1fr,5fr]"
      >
        <MotionDiv
          initial={{
            opacity: 0,
            scale: 0.75,
          }}
          transition={{
            duration: 1.5,
            delay: 0.25,
            type: "spring",
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          className="border-2 border-gray-400 p-4 rounded-md aspect-square flex justify-center items-center flex-col"
        >
          <h2 className="text-5xl font-bold">12 M+</h2>
          <span>active users</span>
        </MotionDiv>
        <div className="flex-grow flex flex-col overflow-hidden">
          <MotionH2
            initial={{
              opacity: 0,
              translateX: "10%",
              skewX: "-30deg",
            }}
            whileInView={{
              opacity: 1,
              translateX: 0,
              skewX: "0deg",
            }}
            transition={{
              delay: 0.3,
              duration: 1,
            }}
            className="text-2xl font-medium "
          >
            Discuss whatever you want
          </MotionH2>
          <MotionP
            initial={{
              opacity: 0,
              translateX: "10%",
            }}
            whileInView={{
              opacity: 1,
              translateX: 0,
            }}
            transition={{
              delay: 0.5,
              duration: 1,
            }}
            className="font-light text-gray-300 mt-4"
          >
            Join a vibrant community where your thoughts and ideas take center
            stage. Dive into endless discussions, share your passions, and
            connect with like-minded individuals. Explore diverse topics, spark
            engaging debates, and find your voice in a space that celebrates
            free expression. Start your conversation today on Forum-Poster!
          </MotionP>
        </div>
      </MotionDiv>
    </section>
  );
}

function CommunitySection() {
  return (
    <section className="w-full min-h-[50vh]">
      <div className="container">
        <MotionH2
          initial={{
            opacity: 0,
            translateY: "40%",
          }}
          whileInView={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 1,
          }}
          className="text-4xl font-semibold border-b border-primary pb-4"
        >
          Join a thriving community
        </MotionH2>
        <MotionP
          initial={{
            opacity: 0,
            translateY: "40%",
          }}
          whileInView={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 0.5,
            duration: 1,
          }}
          className="font-light text-gray-300 mt-4 text-2xl text-justify"
        >
          Join a thriving community where your thoughts and ideas take center
          stage. Dive into endless discussions, share your passions, and connect
          with like-minded individuals. Explore diverse topics, spark engaging
          debates, and find your voice in a space that celebrates free
          expression.
          <br />
          <Link className="underlined mt-4 inline-block" href="/login">
            Start
          </Link>{" "}
          your conversation today on Forum-Poster!
        </MotionP>
      </div>
    </section>
  );
}
