/**
 * What every Tirekick template shares: the fields (a car from its VIN, its model-year recalls with the buyer's status
 * for each, the complaint counts), the look of a window sticker (yellow band, black type), and the status words.
 */
import { Column, Text, defineTheme, prop } from "@hyper-elements/react";
import sample from "./example.ts";

export const fields = {
  vin: prop.text({ label: "VIN", required: true, pattern: "^[A-HJ-NPR-Z0-9]{17}$" }),
  car: prop.text({ label: "Car", required: true, maxLength: 60 }),
  year: prop.number({ label: "Model year", required: true, min: 1981, max: 2100, integer: true }),
  make: prop.text({ label: "Make", required: true, maxLength: 30 }),
  model: prop.text({ label: "Model", required: true, maxLength: 40 }),
  body: prop.text({ label: "Body", maxLength: 40 }),
  fuel: prop.text({ label: "Fuel", maxLength: 30 }),
  plant: prop.text({ label: "Built in", maxLength: 60 }),
  date: prop.date({ label: "Checked on", required: true }),
  buyer: prop.text({ label: "Buyer", maxLength: 40 }),
  seller: prop.text({ label: "Seller", maxLength: 40 }),
  listing: prop.text({ label: "Listing link", maxLength: 200, pattern: "^https://\\S+$" }),
  mileage: prop.text({ label: "Mileage", maxLength: 20 }),
  price: prop.text({ label: "Asking price", maxLength: 20 }),
  open: prop.number({ label: "Known open", required: true, min: 0, integer: true }),
  done: prop.number({ label: "Repair record seen", required: true, min: 0, integer: true }),
  toAsk: prop.number({ label: "Still to ask about", required: true, min: 0, integer: true }),
  recalls: prop.list(
    prop.object(
      {
        id: prop.text({ label: "NHTSA recall", required: true, pattern: "^\\d{2}[A-Z]-[0-9A-Z]{3}$" }),
        date: prop.date({ label: "Reported", required: true }),
        part: prop.text({ label: "Part", required: true, maxLength: 80 }),
        summary: prop.text({ label: "What's wrong", required: true, maxLength: 420 }),
        consequence: prop.text({ label: "What can happen", required: true, maxLength: 200 }),
        remedy: prop.text({ label: "The fix", required: true, maxLength: 500 }),
        warning: prop.choice(["Do not drive", "Park outside"], { label: "NHTSA warning" }),
        ota: prop.boolean({ label: "Fixed over the air" }),
        noFixYet: prop.boolean({ label: "Fix not available yet" }),
        supersededBy: prop.text({ label: "Replaced by recall", pattern: "^\\d{2}[A-Z]-[0-9A-Z]{3}$" }),
        makerRef: prop.text({ label: "Maker's recall number", maxLength: 20 }),
        status: prop.choice(["ask", "done", "open"], { label: "Status for this car", required: true }),
      },
      { label: "Recall" },
    ),
    { label: "Recalls", max: 24 },
  ),
  complaints: prop.object(
    {
      total: prop.number({ label: "Complaints", required: true, min: 0, integer: true }),
      crashes: prop.number({ label: "With a crash", required: true, min: 0, integer: true }),
      fires: prop.number({ label: "With a fire", required: true, min: 0, integer: true }),
      injuries: prop.number({ label: "Injuries", required: true, min: 0, integer: true }),
      deaths: prop.number({ label: "Deaths", required: true, min: 0, integer: true }),
      top: prop.list(prop.object({ component: prop.text({ label: "Component", required: true, maxLength: 60 }), count: prop.number({ label: "Complaints", required: true, min: 0, integer: true }) }, { label: "Component" }), { label: "Most complained about", max: 5 }),
    },
    { label: "Owner complaints (NHTSA)", required: true },
  ),
};

export type Status = "ask" | "done" | "open";
export type RecallV = { id: string; date: string; part: string; summary: string; consequence: string; remedy: string; warning?: "Do not drive" | "Park outside"; ota?: boolean; noFixYet?: boolean; supersededBy?: string; makerRef?: string; status: Status };
export type Values = {
  vin: string; car: string; year: number; make: string; model: string; body?: string; fuel?: string; plant?: string; date: string;
  buyer?: string; seller?: string; listing?: string; mileage?: string; price?: string; open: number; done: number; toAsk: number;
  recalls: RecallV[];
  complaints: { total: number; crashes: number; fires: number; injuries: number; deaths: number; top: Array<{ component: string; count: number }> };
};

/** The sample: NHTSA's data for a 2017 Chevrolet Bolt EV LT, read 22 Nov 2026 (the VIN is made up). */
export const example = sample as unknown as Values;

/* ---------- look: a window sticker ---------- */

export const INK = "#17191C";
export const INK2 = "#3B4048";
export const MUTED = "#5C626B";
export const LINE = "#DADDE2";
export const WASH = "#F4F5F7";
export const PAPER = "#FFFFFF";
export const YELLOW = "#FFC72C";
export const YELLOW_SOFT = "#FFF4CC";
export const RED = "#C62828";
export const RED_SOFT = "#FDECEC";
export const GREEN = "#1E7B45";
export const GREEN_SOFT = "#E4F3EA";

export const SANS = "Barlow, 'Helvetica Neue', Arial, sans-serif";
export const COND = "'Barlow Condensed', Barlow, 'Arial Narrow', sans-serif";

export const FONT_FILES = [
  { family: "Barlow", src: "../fonts/Barlow-Regular.ttf", weight: 400 },
  { family: "Barlow", src: "../fonts/Barlow-SemiBold.ttf", weight: 600 },
  { family: "Barlow", src: "../fonts/Barlow-Bold.ttf", weight: 700 },
  { family: "Barlow Condensed", src: "../fonts/BarlowCondensed-Bold.ttf", weight: 700 },
];
// The email loads Barlow from a CDN (Fontsource, OFL); clients that block web fonts fall back to Helvetica/Arial.
const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";
export const FONT_URLS = [
  { family: "Barlow", src: `${CDN}/barlow@5.2.7/files/barlow-latin-400-normal.woff2`, weight: 400 },
  { family: "Barlow", src: `${CDN}/barlow@5.2.7/files/barlow-latin-600-normal.woff2`, weight: 600 },
  { family: "Barlow Condensed", src: `${CDN}/barlow-condensed@5.2.7/files/barlow-condensed-latin-700-normal.woff2`, weight: 700 },
];

export const theme = defineTheme({
  colors: { background: WASH, foreground: INK, primary: INK, primaryForeground: PAPER, muted: MUTED, border: LINE, paper: PAPER },
  fonts: { body: SANS, heading: COND },
  fontSizes: { body: 16 },
  lineHeights: { body: 1.5 },
  elements: { Heading: { fontWeight: 700, letterSpacing: 0, lineHeight: 1.1, by: { level: { 1: { fontSize: 30, mobile: { fontSize: 26 } }, 2: { fontSize: 20 } } } } },
  styles: {
    label: { fontFamily: SANS, fontWeight: 600, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED },
    card: { backgroundColor: PAPER, padding: 28, gap: 16, border: `1px solid ${LINE}` },
  },
});

/* ---------- words ---------- */

export const STATUS: Record<Status, string> = { ask: "Not confirmed", done: "Repair record seen", open: "Open" };
export const STATUS_COLOR: Record<Status, string> = { ask: INK2, done: GREEN, open: RED };
export const STATUS_SOFT: Record<Status, string> = { ask: WASH, done: GREEN_SOFT, open: RED_SOFT };

export const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export const live = (v: Values) => v.recalls.filter((r) => !r.supersededBy);
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A small filled square: the checkbox on paper, the status dot on the card. */
export function Square({ size, color, fill }: { size: number; color: string; fill?: string }) {
  return (
    <Column style={{ width: size, height: size, border: `1.5px solid ${color}`, backgroundColor: fill ?? PAPER }}>
      <Text style={{ fontSize: 1, color: fill ?? PAPER }}> </Text>
    </Column>
  );
}
