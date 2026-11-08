import type { Metadata, Viewport } from "next";
import "./globals.css";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `${SITE_NAME} — The Rack`, template: `%s · ${SITE_NAME}` },
  description: "An interactive clothing-rack storefront demo. Drag the rail, pick a garment, see it up close.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbfbfa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--page)] text-neutral-900">{children}</body>
    </html>
  );
}
