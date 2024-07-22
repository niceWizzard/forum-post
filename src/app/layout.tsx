import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import MyProvider from "./_providers/MyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Forum Post - the new way of posting",
  description:
    "Forum post is a leading and unique website for posting whatever you can imagine! Join the conversation for more information!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MyProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>{children}</body>
      </html>
    </MyProvider>
  );
}
