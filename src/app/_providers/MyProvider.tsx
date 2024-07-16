"use client";

import ServerProvider from "./ServerProvider";

export default function MyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ServerProvider>{children}</ServerProvider>;
}
