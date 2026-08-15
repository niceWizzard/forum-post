import type { Metadata } from "next";
import "@/app/globals.css";
import MyProvider from "./_providers/MyProvider";

export const metadata: Metadata = {
  title: "ForumPost - A Modern Discussion Platform",
  description:
    "ForumPost is a clean, modern platform for thoughtful discussions, communities, and conversations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyProvider>
      <html lang="en" className="dark">
        <body className="font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen">
          {children}
        </body>
      </html>
    </MyProvider>
  );
}
