"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Download01, FileCheck02, Image01, Mail01, SearchMd, XClose } from "@untitledui/icons";
import { carName, checkVin, nhtsaRecallUrl, part, toValues, warning, type Recall, type Status } from "../../templates/_shared/car.ts";
import { lookup, sample, SAMPLE_META, type Looked } from "@/lib/load";
import { renderLocal } from "@/lib/render-local";
import { Logo } from "./Logo";

type Out = "sheet" | "ask" | "card";
const OUTS: Array<{ key: Out; label: string; icon: ReactNode; file: string }> = [
  { key: "sheet", label: "Recall sheet", icon: <FileCheck02 size={16} />, file: "recall-sheet.pdf" },
  { key: "ask", label: "Email the seller", icon: <Mail01 size={16} />, file: "recall-questions.html" },
  { key: "card", label: "Status card", icon: <Image01 size={16} />, file: "recall-status.png" },
];
const STATUS: Array<{ key: Status; label: string; on: string }> = [
  { key: "ask", label: "Not confirmed", on: "bg-ink text-white" },
  { key: "done", label: "Record seen", on: "bg-green text-white" },
  { key: "open", label: "Open", on: "bg-red text-white" },
];
const today = () => new Date().toISOString().slice(0, 10);
const blank = { buyer: "", seller: "", mileage: "", price: "", listing: "" };

export function Garage() {
  const [found, setFound] = useState<Looked | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [meta, setMeta] = useState(blank);
  const [sheet, setSheet] = useState<Out | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(get: () => Promise<Looked>, isSample = false) {
    setBusy(true);
    setError(null);
    try {
      const f = await get();
      setFound(f);
      setStatuses(isSample ? Object.fromEntries(f.recalls.filter((r) => r.id === "21V-560").map((r) => [r.campaign, "done" as Status])) : {});
      setMeta(isSample ? SAMPLE_META : { ...blank, buyer: meta.buyer });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const values = useMemo(() => (found ? toValues(found.car, found.recalls, found.complaints, { ...meta, date: today(), statuses }) : null), [found, meta, statuses]);
  if (!found || !values) return <Start busy={busy} error={error} start={start} />;

  const { car, recalls, complaints } = found;
  const live = recalls.filter((r) => !r.supersededBy);
  const max = Math.max(1, ...complaints.top.map((t) => t.count));

  return (
    <div className="min-h-dvh flex flex-col bg-wash">
      <header className="h-14 shrink-0 bg-paper border-b border-line flex items-center gap-3 px-4 md:px-6">
        <NextLink href="/" className="flex items-center gap-2 cond text-[21px] tracking-wide" aria-label="Tirekick home">
          <Logo /> <span className="max-[420px]:hidden">TIREKICK</span>
        </NextLink>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          {OUTS.map((o) => (
            <button key={o.key} className={`btn !py-1.5 max-lg:!px-2.5 ${o.key === "sheet" ? "btn-ink" : "btn-line"}`} onClick={() => setSheet(o.key)} aria-label={o.label}>
              {o.icon} <span className="hidden lg:inline">{o.label}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-line !py-1.5 max-sm:!px-2.5" onClick={() => setFound(null)} aria-label="Another car">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Another car</span>
        </button>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[1240px] px-4 md:px-6 py-6 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <main className="min-w-0 space-y-4">
          <section className="bg-paper border border-line rounded-lg overflow-hidden">
            <div className="bg-yellow px-5 py-2 flex justify-between gap-3 cond text-[15px] tracking-[0.12em]">
              <span>RECALL CHECK</span>
              <span className="truncate">{`VIN ${car.vin}`}</span>
            </div>
            <div className="p-5 md:p-6">
              <h1 className="cond text-[34px] md:text-[44px] leading-none">{carName(car)}</h1>
              <p className="mt-2 text-[14.5px] text-muted">{[car.body, car.fuel, car.plant && `built in ${car.plant}`].filter(Boolean).join(" · ")}</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Stat n={String(live.length)} label="recalls for this model year" />
                <Stat n={String(live.filter((r) => r.parkIt || r.parkOutside).length)} label="do not drive / park outside" tone={live.some((r) => r.parkIt || r.parkOutside) ? "red" : undefined} />
                <Stat n={String(values.done)} label="repair record seen" tone="green" />
                <Stat n={String(values.toAsk + values.open)} label="still to ask about" tone={values.toAsk + values.open ? "red" : undefined} />
              </div>
              <p className="mt-4 text-[13.5px] text-ink-2 bg-yellow-soft rounded-md px-3 py-2">
                These are the recalls for every {`${car.year} ${car.make} ${car.model}`}. Not every car is affected and some are already fixed: ask the seller for the dealer&apos;s repair records, or check this VIN at{" "}
                <a className="underline underline-offset-2" href="https://www.nhtsa.gov/recalls">
                  nhtsa.gov/recalls
                </a>
                .{found.recallModel !== car.model ? ` NHTSA's recall data names this model "${found.recallModel}".` : ""}
              </p>
            </div>
          </section>

          {recalls.length ? (
            recalls.map((r) => <RecallRow key={r.campaign} r={r} status={statuses[r.campaign] ?? "ask"} set={(s) => setStatuses({ ...statuses, [r.campaign]: s })} />)
          ) : (
            <p className="bg-paper border border-line rounded-lg p-5 text-[15px]">{`NHTSA lists no safety recalls for the ${car.year} ${car.make} ${car.model}.`}</p>
          )}

          {complaints.total ? (
            <section className="bg-paper border border-line rounded-lg p-5 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="cond text-[24px]">What owners report</h2>
                <p className="label">{`${complaints.total} complaints to NHTSA`}</p>
              </div>
              <div className="mt-4 space-y-2">
                {complaints.top.map((t) => (
                  <div key={t.component} className="grid grid-cols-[140px_1fr_40px] sm:grid-cols-[220px_1fr_40px] items-center gap-3 text-[14px]">
                    <span className="truncate">{t.component}</span>
                    <span className="h-2.5 bg-ink rounded-sm" style={{ width: `${Math.max(2, (100 * t.count) / max)}%` }} />
                    <span className="font-semibold text-right">{t.count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-muted">{`${complaints.crashes} mention a crash, ${complaints.fires} a fire, ${complaints.injuries} injuries and ${complaints.deaths} deaths reported. Owners' reports, not confirmed defects.`}</p>
            </section>
          ) : null}
        </main>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="bg-paper border border-line rounded-lg p-5 space-y-3">
            <p className="label">The listing</p>
            <Field label="Mileage" value={meta.mileage} onChange={(v) => setMeta({ ...meta, mileage: v })} placeholder="41,200 mi" max={20} />
            <Field label="Asking price" value={meta.price} onChange={(v) => setMeta({ ...meta, price: v })} placeholder="$11,900" max={20} />
            <Field label="Seller's name" value={meta.seller} onChange={(v) => setMeta({ ...meta, seller: v })} placeholder="For the email" />
            <Field label="Listing link" value={meta.listing} onChange={(v) => setMeta({ ...meta, listing: v })} placeholder="https://…" max={200} />
          </section>
          <section className="bg-paper border border-line rounded-lg p-5 space-y-3">
            <p className="label">You</p>
            <Field label="Your name" value={meta.buyer} onChange={(v) => setMeta({ ...meta, buyer: v })} placeholder="Signs the email" />
          </section>
          <p className="text-[13px] text-muted px-1">Data from NHTSA: vPIC for the VIN, the recalls and complaints APIs. Your browser asks NHTSA directly; nothing is stored.</p>
        </aside>
      </div>

      {sheet ? <Sheet out={sheet} setOut={setSheet} values={values} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}

function RecallRow({ r, status, set }: { r: Recall; status: Status; set: (s: Status) => void }) {
  const warn = warning(r);
  const [open, setOpen] = useState(false);
  return (
    <article className={`bg-paper border border-line rounded-lg p-4 md:p-5 ${r.supersededBy ? "opacity-70" : warn ? "border-l-4 border-l-red" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <a href={nhtsaRecallUrl(r.id)} className="cond text-[22px] hover:underline inline-flex items-center gap-1">
          {r.id} <ArrowUpRight size={14} />
        </a>
        <span className="font-semibold text-[15px]">{part(r.component)}</span>
        <span className="text-[13px] text-muted">{new Date(`${r.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
        {warn && !r.supersededBy ? <span className="rounded-sm bg-red text-white px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">{warn}</span> : null}
        {r.noFixYet ? <span className="rounded-sm bg-yellow px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">No fix yet</span> : null}
        {r.ota ? <span className="rounded-sm bg-wash px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-2">Over the air</span> : null}
      </div>
      {r.supersededBy ? (
        <p className="mt-2 text-[14px] text-muted">{`Replaced by ${r.supersededBy}: that recall's fix covers this one.`}</p>
      ) : (
        <>
          <p className={`mt-2 text-[15px] font-semibold ${warn ? "text-red" : ""}`}>{r.consequence}</p>
          <p className="mt-1 text-[14px] text-ink-2">{r.summary}</p>
          {open ? (
            <p className="mt-2 text-[13.5px] text-ink-2 bg-wash rounded-md px-3 py-2">
              <span className="font-semibold text-ink">The fix: </span>
              {r.remedy}
              {r.makerRef ? <span className="font-semibold text-ink">{` Maker's number: ${r.makerRef}.`}</span> : null}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-line p-0.5" role="radiogroup" aria-label={`Status of ${r.id} on this car`}>
              {STATUS.map((s) => (
                <button key={s.key} role="radio" aria-checked={status === s.key} onClick={() => set(s.key)} className={`rounded px-2.5 py-1 text-[13px] font-semibold ${status === s.key ? s.on : "text-muted hover:text-ink"}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <button className="text-[13px] font-semibold text-ink-2 underline underline-offset-2" onClick={() => setOpen(!open)}>
              {open ? "Hide the fix" : "The fix"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

function Stat({ n, label, tone }: { n: string; label: string; tone?: "red" | "green" }) {
  return (
    <div className={`rounded-md bg-wash px-3 py-2.5 border-t-[3px] ${tone === "red" ? "border-red" : tone === "green" ? "border-green" : "border-ink"}`}>
      <p className={`cond text-[28px] leading-none ${tone === "red" ? "text-red" : tone === "green" ? "text-green" : ""}`}>{n}</p>
      <p className="mt-1 text-[12px] text-muted leading-tight">{label}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, max = 40 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; max?: number }) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      <input className="input mt-1 !py-1.5 !text-[14px]" maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/* ---------- start ---------- */

function Start({ busy, error, start }: { busy: boolean; error: string | null; start: (get: () => Promise<Looked>, isSample?: boolean) => void }) {
  const [vin, setVin] = useState("");
  const hint = vin.trim().length >= 17 ? checkVin(vin).error : undefined;
  return (
    <div className="min-h-dvh grid place-items-center p-4 md:p-8 bg-wash">
      <div className="w-full max-w-[600px] bg-paper border border-line rounded-xl overflow-hidden shadow-[0_30px_60px_-34px_rgb(23_25_28/0.35)]">
        <div className="bg-yellow px-6 md:px-8 py-3 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-2 cond text-[20px] tracking-wide">
            <Logo /> TIREKICK
          </NextLink>
          <span className="cond text-[14px] tracking-[0.12em]">RECALL CHECK</span>
        </div>
        <form
          className="p-6 md:p-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (vin.trim()) start(() => lookup(vin));
          }}
        >
          <h1 className="cond text-[34px] md:text-[42px] leading-[1.02]">Which car are you looking at?</h1>
          <p className="text-[15.5px] text-muted leading-relaxed">Type the 17-character VIN from the listing, the windshield (lower left, driver&apos;s side) or the door jamb. Tirekick asks NHTSA for the car, its recalls and owner complaints.</p>
          <label className="block">
            <span className="text-[13px] font-semibold text-ink-2">VIN</span>
            <input className="input mt-1 !text-[20px] tracking-[0.12em] uppercase font-semibold" maxLength={20} autoCapitalize="characters" spellCheck={false} placeholder="1G1FW6S01H4123456" value={vin} onChange={(e) => setVin(e.target.value)} />
          </label>
          {hint ? <p className="text-[13px] text-red">{hint}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ink" disabled={!vin.trim() || busy}>
              <SearchMd size={16} /> Check the recalls
            </button>
            <button type="button" className="btn btn-line" disabled={busy} onClick={() => start(sample, true)}>
              Sample: a 2017 Chevrolet Bolt EV
            </button>
          </div>
          {busy ? <p className="text-[13px] text-muted">Asking NHTSA…</p> : null}
          {error ? (
            <p className="text-[13.5px] text-red flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

/* ---------- outputs ---------- */

function Sheet({ out, setOut, values, onClose }: { out: Out; setOut: (o: Out) => void; values: ReturnType<typeof toValues>; onClose: () => void }) {
  const [view, setView] = useState<{ url?: string; html?: string; issues?: string[] } | null>(null);
  const key = JSON.stringify(values);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: out, values }) });
      const type = res.headers.get("Content-Type") ?? "";
      const next = type.includes("json")
        ? await res.json().then((j) => (res.ok ? { html: j.html as string } : { issues: (j.diagnostics ?? [{ message: j.error }]).map((d: { message: string; path?: string }) => `${d.path ? `${d.path.replace(/^values\./, "")}: ` : ""}${d.message}`) }))
        : { url: URL.createObjectURL(await res.blob()) };
      if (!alive) return;
      setView((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return next;
      });
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out, key]);

  function download() {
    if (!view || view.issues) return;
    const a = document.createElement("a");
    a.href = view.url ?? URL.createObjectURL(new Blob([view.html ?? ""], { type: "text/html" }));
    a.download = `${values.car.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${OUTS.find((o) => o.key === out)!.file}`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/35" onClick={onClose}>
      <div className="w-full md:w-[min(1040px,94vw)] h-full bg-paper flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-14 shrink-0 border-b border-line flex items-center gap-1 sm:gap-2 px-3 sm:px-5">
          {OUTS.map((o) => (
            <button key={o.key} onClick={() => o.key !== out && (setOut(o.key), setView(null))} className={`px-2 sm:px-3 py-1.5 rounded-md text-[13px] sm:text-[14px] font-semibold ${out === o.key ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
              {o.label}
            </button>
          ))}
          <div className="flex-1" />
          <button className="btn btn-yellow" onClick={download} disabled={!view || !!view.issues} aria-label="Download">
            <Download01 size={16} /> <span className="hidden sm:inline">Download</span>
          </button>
          <button className="text-muted hover:text-ink ml-1" onClick={onClose} aria-label="Close">
            <XClose size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 bg-wash flex">
          {view?.issues ? (
            <div className="m-6 rounded-lg bg-red-soft p-4 space-y-1 self-start">
              <p className="font-semibold text-red text-[14px]">The template refused these values</p>
              {view.issues.map((m) => (
                <p key={m} className="text-[13px]">
                  {m}
                </p>
              ))}
            </div>
          ) : view?.url && out === "sheet" ? (
            <iframe title="Recall sheet" src={view.url} className="flex-1" />
          ) : view?.url ? (
            <div className="flex-1 grid place-items-center p-6 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.url} alt="Recall status card" className="max-h-full max-w-full border border-line rounded-md shadow-lg" />
            </div>
          ) : view?.html ? (
            <iframe title="Email to the seller" srcDoc={view.html} className="flex-1 bg-white" />
          ) : (
            <p className="m-auto text-[14px] text-muted">Rendering with Hyper Elements…</p>
          )}
        </div>
      </div>
    </div>
  );
}
