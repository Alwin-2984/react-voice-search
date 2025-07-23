"use client";

import { useSuppressHydrationWarning } from "./suppressHydrationWarning";

export default function RootLayout({ children }) {
  // Suppress hydration warnings from browser extensions
  useSuppressHydrationWarning();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head />
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
