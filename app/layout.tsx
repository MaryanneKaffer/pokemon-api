import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import BackgroundImage from "@/components/background";

export const metadata: Metadata = {
  title: {
    default: "PokéApi",
    template: "%s - PokéApi",
  },
  description: "Consuming pokemon API",
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <BackgroundImage />
          <main className="min-h-screen pt-16 px-15 bg-center bg-cover">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}