import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../fonts/Barlow-Regular.ttf", weight: "400" },
    { path: "../../fonts/Barlow-SemiBold.ttf", weight: "600" },
    { path: "../../fonts/Barlow-Bold.ttf", weight: "700" },
  ],
  variable: "--font-barlow",
});
const cond = localFont({ src: "../../fonts/BarlowCondensed-Bold.ttf", weight: "700", variable: "--font-barlow-cond" });

export const metadata: Metadata = {
  title: "Tirekick · The recall check before you buy a used car",
  description: "Type the VIN. Tirekick asks NHTSA for the car, every safety recall for its model year and what owners complain about, then makes the sheet you take to the viewing, the email asking the seller for repair records, and a status card. Built with Hyper Elements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${cond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
