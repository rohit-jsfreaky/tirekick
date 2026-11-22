import type { Metadata } from "next";
import { Garage } from "@/components/Garage";

export const metadata: Metadata = { title: "Check a car · Tirekick" };

export default function CheckPage() {
  return <Garage />;
}
