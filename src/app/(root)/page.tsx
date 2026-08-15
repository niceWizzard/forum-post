import { Metadata } from "next";
import Link from "next/link";
import { unathenticatedOnly } from "@/server/auth/validate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageSquare, ShieldCheck, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "ForumPost - A Modern Discussion Platform",
  description: "Join topic-focused communities, discuss ideas, and share knowledge in a fast, modern forum.",
};

export default async function Home() {
  await unathenticatedOnly();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full border-b border-border bg-gradient-to-b from-background to-muted/20 py-20 md:py-32">
        <div className="container max-w-5xl px-4 sm:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
            Open Community Discussions
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl">
            Where thoughtful minds connect and discuss.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl font-normal leading-relaxed">
            Create communities, start engaging discussions, and share insights with people who share your interests.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="h-11 px-8 gap-2 font-medium">
              <Link href="/register">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-8 font-medium">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="w-full border-b border-border py-12 bg-card/40">
        <div className="container max-w-5xl px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">100%</span>
              <span className="text-sm text-muted-foreground mt-1 font-medium">Open Access</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Real-time</span>
              <span className="text-sm text-muted-foreground mt-1 font-medium">Discussions & Comments</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Topic-First</span>
              <span className="text-sm text-muted-foreground mt-1 font-medium">Focused Communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full py-20 bg-background">
        <div className="container max-w-5xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Designed for organized conversations
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base">
              Everything you need to build vibrant communities and engage in focused discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/80 shadow-none hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 text-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Custom Communities</CardTitle>
                <CardDescription className="text-xs">
                  Create tailored forums with specific guidelines, descriptions, and privacy configurations.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Easily administer members, assign co-admins via invites, and foster high-quality discussions.
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 text-foreground">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Rich Thread Discussions</CardTitle>
                <CardDescription className="text-xs">
                  Publish detailed posts, sort threads by newest or most liked, and participate in comment chains.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Clean formatting and readable typography ensure ideas remain central to the experience.
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-none hover:border-border transition-colors">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2 text-foreground">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Community Moderation</CardTitle>
                <CardDescription className="text-xs">
                  Delegated administrative tools allow multiple moderators to manage invitations and forum settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Keep discussions safe, constructive, and on-topic with transparent community controls.
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 text-center border rounded-xl p-8 bg-card/50 flex flex-col items-center">
            <h3 className="text-xl font-bold tracking-tight">Ready to join the conversation?</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Sign in with your Google or GitHub account to start creating forums and participating immediately.
            </p>
            <Button asChild className="mt-6" size="default">
              <Link href="/register">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
