/**
 * A VIN, NHTSA's decode of it (vPIC), the safety recalls for that year, make and model, and the owners' complaints,
 * turned into what a used-car buyer needs: what to ask about first, and what proof to ask for. Pure, no imports: the
 * app, the sample script, the templates and the tests share it.
 * APIs: vpic.nhtsa.dot.gov/api, api.nhtsa.gov/recalls/recallsByVehicle, api.nhtsa.gov/complaints/complaintsByVehicle.
 */

export type Car = { vin: string; year: number; make: string; model: string; trim?: string; body?: string; fuel?: string; plant?: string; maker?: string };
export type Status = "ask" | "done" | "open";
export type Recall = {
  campaign: string; // "21V560000" as NHTSA lists it
  id: string; // "21V-560", as owners' letters and dealers write it
  date: string; // ISO
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  parkIt: boolean;
  parkOutside: boolean;
  ota: boolean;
  noFixYet: boolean; // NHTSA's text says the remedy isn't available yet (or comes in phases)
  supersededBy?: string;
  makerRef?: string;
};
export type Complaints = { total: number; crashes: number; fires: number; injuries: number; deaths: number; top: Array<{ component: string; count: number }> };

const T: Record<string, number> = { ...Object.fromEntries("0123456789".split("").map((c, i) => [c, i])), A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
const W = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** 17 characters, no I, O or Q, and (for North American VINs) the 9th-position check digit. */
export function checkVin(raw: string): { vin: string; error?: string } {
  const vin = raw.trim().toUpperCase().replace(/[\s-]/g, "");
  if (vin.length !== 17) return { vin, error: `A VIN has 17 characters; this has ${vin.length}.` };
  if (/[IOQ]/.test(vin)) return { vin, error: "A VIN never contains I, O or Q (they look like 1 and 0). Check those characters." };
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return { vin, error: "A VIN has only letters and digits." };
  const sum = vin.split("").reduce((s, c, i) => s + T[c] * W[i], 0) % 11;
  const digit = sum === 10 ? "X" : String(sum);
  // The check digit is required for North America (WMI 1-5); elsewhere it's optional, so only warn there.
  if (/^[1-5]/.test(vin) && vin[8] !== digit) return { vin, error: `The 9th character should be ${digit} for this VIN. One of the characters is probably mistyped.` };
  return { vin };
}

const title = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bLlc\b/, "LLC").replace(/\b(Ev|Suv|Usa|Bmw|Gmc)\b/g, (m) => m.toUpperCase());

/** vPIC DecodeVinValues → the car. Throws when vPIC can't tell the make, model and year. */
export function fromDecode(json: { Results?: Array<Record<string, string>> }, vin: string): Car {
  const r = json.Results?.[0];
  if (!r || !r.Make || !r.Model || !r.ModelYear) throw new Error(`NHTSA couldn't decode this VIN${r?.ErrorText ? `: ${r.ErrorText.replace(/^[\d,\s]+-\s*/, "")}` : ""}.`);
  const plant = [r.PlantCity, r.PlantState || r.PlantCountry].filter(Boolean).map(title).join(", ");
  return { vin, year: Number(r.ModelYear), make: title(r.Make), model: r.Model, trim: r.Trim || undefined, body: r.BodyClass || undefined, fuel: r.FuelTypePrimary || undefined, plant: plant || undefined, maker: r.Manufacturer ? title(r.Manufacturer) : undefined };
}

const isoDate = (d: string) => {
  const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); // NHTSA writes dd/mm/yyyy
  return m ? `${m[3]}-${m[2]}-${m[1]}` : d.slice(0, 10);
};
/** "21V560000" → "21V-560" (how recall notices write it). */
export const shortId = (c: string) => c.replace(/^(\d{2}[A-Z])([0-9A-Z]{3})0{3}$/, "$1-$2");
const yes = (v: unknown) => v === true || v === "True" || v === "true";

type RawRecall = { NHTSACampaignNumber: string; ReportReceivedDate: string; Component: string; Summary: string; Consequence: string; Remedy: string; Notes?: string; parkIt?: unknown; parkOutSide?: unknown; overTheAirUpdate?: unknown };

export function fromRecalls(json: { results?: RawRecall[] }): Recall[] {
  const list = (json.results ?? []).map((x): Recall => {
    const text = `${x.Remedy} ${x.Notes ?? ""}`;
    const sup = text.match(/superseded by (?:recall )?(?:number )?(\d{2}[VEC]-?\d{3})/i)?.[1];
    return {
      campaign: x.NHTSACampaignNumber,
      id: shortId(x.NHTSACampaignNumber),
      date: isoDate(x.ReportReceivedDate),
      component: x.Component,
      summary: x.Summary.replace(/\s+/g, " ").trim(),
      consequence: x.Consequence.replace(/\s+/g, " ").trim(),
      remedy: x.Remedy.replace(/\s+/g, " ").trim(),
      parkIt: yes(x.parkIt),
      parkOutside: yes(x.parkOutSide),
      ota: yes(x.overTheAirUpdate),
      // "Interim letters" are routine; these phrases are the ones NHTSA uses when the fix itself isn't ready.
      noFixYet: /remedy (?:is )?(?:currently )?(?:not (?:yet )?available|(?:still )?under development|becoming available)|parts? (?:are|is) not (?:yet )?available|remedy (?:is|has) not (?:yet )?been (?:determined|developed|identified)/i.test(text),
      supersededBy: sup ? sup.replace(/^(\d{2}[VEC])-?(\d{3})$/, "$1-$2") : undefined,
      makerRef: text.match(/number for this recall is ([A-Z0-9][A-Z0-9-]{2,})/i)?.[1],
    };
  });
  return list.sort((a, b) => rank(a) - rank(b) || b.date.localeCompare(a.date));
}

/** Do-not-drive first, then park-outside (fire), then the rest; replaced (superseded) recalls last. */
export function rank(r: Recall) {
  if (r.supersededBy) return 4;
  if (r.parkIt) return 0;
  if (r.parkOutside) return 1;
  return /fire|crash|brak|steer|air ?bag|fuel/i.test(`${r.consequence} ${r.component}`) ? 2 : 3;
}
export const warning = (r: Recall) => (r.parkIt ? "Do not drive" : r.parkOutside ? "Park outside" : undefined);

/** "ELECTRICAL SYSTEM:PROPULSION SYSTEM:TRACTION BATTERY" → "Traction battery (electrical system)". */
export function part(component: string) {
  const bits = component.split(":").map((s) => s.trim()).filter(Boolean);
  const last = bits.at(-1) ?? component;
  const first = bits.length > 1 ? bits[0] : "";
  return `${last.charAt(0)}${last.slice(1).toLowerCase()}${first ? ` (${first.toLowerCase()})` : ""}`;
}

type RawComplaint = { crash?: boolean; fire?: boolean; numberOfInjuries?: number; numberOfDeaths?: number; components?: string };
export function fromComplaints(json: { results?: RawComplaint[] }): Complaints {
  const rows = json.results ?? [];
  const by = new Map<string, number>();
  for (const r of rows) for (const c of new Set((r.components ?? "").split(",").map((s) => s.trim()).filter((s) => s && s !== "UNKNOWN OR OTHER"))) by.set(c, (by.get(c) ?? 0) + 1);
  return {
    total: rows.length,
    crashes: rows.filter((r) => r.crash).length,
    fires: rows.filter((r) => r.fire).length,
    injuries: rows.reduce((n, r) => n + (r.numberOfInjuries ?? 0), 0),
    deaths: rows.reduce((n, r) => n + (r.numberOfDeaths ?? 0), 0),
    top: [...by].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5).map(([component, count]) => ({ component: component.charAt(0) + component.slice(1).toLowerCase(), count })),
  };
}

/**
 * NHTSA's recall data names models its own way ("BOLT EV"); vPIC's name usually matches. When it doesn't, the
 * products list of models with recalls for that make and year gives the candidates that share the first word.
 */
export function modelCandidates(model: string, products: { results?: Array<{ model: string }> }) {
  const first = model.trim().split(/\s+/)[0].toUpperCase();
  const names = [...new Set((products.results ?? []).map((p) => p.model.toUpperCase()))];
  return [model.toUpperCase(), ...names.filter((n) => n !== model.toUpperCase() && n.split(/\s+/)[0] === first)];
}

/**
 * The remedy without the paperwork (letters mailed, phone numbers, the maker's number, kept separately), with the
 * sentence that says what gets fixed ("… free of charge") first, so a cut never loses it.
 */
export const fixOnly = (remedy: string) => {
  const kept = remedy
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .filter((x) => !/\bletters?\b.*\b(?:mailed|sent)\b|^Owners may (?:also )?contact|number for this recall|customer service|^Recall began|1-8\d\d-/i.test(x));
  const free = (x: string) => (/free of charge/i.test(x) ? 0 : 1);
  return kept.map((x, i) => [x, i] as const).sort((a, b) => free(a[0]) - free(b[0]) || a[1] - b[1]).map(([x]) => x).join(" ");
};

/** Cut long NHTSA text at the last whole sentence that fits (or the last word, with an ellipsis). */
export function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = cut.lastIndexOf(". ");
  return end > max * 0.5 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export const carName = (c: Car) => `${c.year} ${c.make} ${c.model}${c.trim ? ` ${c.trim}` : ""}`;
/** NHTSA's page for one recall (the "NHTSA safety issue ID" search). */
export const nhtsaRecallUrl = (id: string) => `https://www.nhtsa.gov/recalls?nhtsaId=${id.replace("-", "")}`;

/** The values the three templates take. */
export function toValues(
  car: Car,
  recalls: Recall[],
  complaints: Complaints,
  meta: { date: string; statuses?: Record<string, Status>; buyer?: string; seller?: string; listing?: string; mileage?: string; price?: string },
) {
  const st = meta.statuses ?? {};
  const live = recalls.filter((r) => !r.supersededBy);
  return {
    vin: car.vin,
    car: carName(car).slice(0, 60),
    year: car.year,
    make: car.make.slice(0, 30),
    model: car.model.slice(0, 40),
    body: car.body?.slice(0, 40),
    fuel: car.fuel?.slice(0, 30),
    plant: car.plant?.slice(0, 60),
    date: meta.date,
    buyer: meta.buyer?.trim().slice(0, 40) || undefined,
    seller: meta.seller?.trim().slice(0, 40) || undefined,
    listing: /^https:\/\/\S+$/.test(meta.listing?.trim() ?? "") ? meta.listing!.trim().slice(0, 200) : undefined,
    mileage: meta.mileage?.trim().slice(0, 20) || undefined,
    price: meta.price?.trim().slice(0, 20) || undefined,
    open: live.filter((r) => (st[r.campaign] ?? "ask") === "open").length,
    done: live.filter((r) => st[r.campaign] === "done").length,
    toAsk: live.filter((r) => (st[r.campaign] ?? "ask") === "ask").length,
    recalls: recalls.slice(0, 24).map((r) => ({
      id: r.id,
      date: r.date,
      part: part(r.component).slice(0, 80),
      summary: clip(r.summary, 420),
      consequence: clip(r.consequence, 200),
      remedy: clip(fixOnly(r.remedy) || r.remedy, 500),
      warning: r.supersededBy ? undefined : warning(r),
      ota: r.ota,
      noFixYet: r.noFixYet,
      supersededBy: r.supersededBy,
      makerRef: r.makerRef?.slice(0, 20),
      status: st[r.campaign] ?? ("ask" as Status),
    })),
    complaints,
  };
}
