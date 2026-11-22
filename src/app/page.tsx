import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, ArrowUpRight, Car01, FileCheck02, Image01, Mail01, ShieldTick, Tool02 } from "@untitledui/icons";
import { Logo } from "@/components/Logo";

const WRAP = "mx-auto max-w-[1200px] px-6";

export default function Home() {
  return (
    <div className="bg-paper text-ink">
      <Nav />
      <Hero />
      <Why />
      <Example />
      <Reads />
      <How />
      <Outputs />
      <Sellers />
      <Faq />
      <Close />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
      <div className={`${WRAP} h-16 flex items-center gap-4 md:gap-8`}>
        <Link href="/" className="flex items-center gap-2 cond text-[22px] tracking-wide">
          <Logo /> TIREKICK
        </Link>
        <nav className="hidden md:flex gap-6 text-[15px] font-medium text-muted">
          <a href="#why" className="hover:text-ink">Why</a>
          <a href="#example" className="hover:text-ink">Example</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#outputs" className="hover:text-ink">What you get</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex-1" />
        <Link href="/check" className="btn btn-ink">
          <span className="hidden sm:inline">Check a car</span>
          <span className="sm:hidden">Start</span> <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="border-b border-line">
      <div className="bg-yellow">
        <div className={`${WRAP} py-2 flex justify-between cond text-[14px] tracking-[0.14em]`}>
          <span>RECALL CHECK · BEFORE YOU BUY</span>
          <span className="hidden sm:inline">DATA: NHTSA</span>
        </div>
      </div>
      <div className={`${WRAP} pt-14 md:pt-20 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-end`}>
        <div>
          <h1 className="cond text-[56px] md:text-[96px] leading-[0.92] tracking-[-0.01em]">
            Kick the tires.
            <br />
            Then check the recalls.
          </h1>
          <p className="mt-6 text-[19px] leading-relaxed text-ink-2 max-w-[580px]">
            Type the VIN of the used car you&apos;re looking at. Tirekick asks NHTSA for the car, every safety recall for its model year and what owners complain about. Then it makes the sheet you take to the viewing, the email asking the seller for repair records, and a status card.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/check" className="btn btn-ink !px-5 !py-3 !text-[16px]">
              Check a car <ArrowRight size={17} />
            </Link>
            <a href="/landing/recall-sheet.pdf" className="btn btn-line !px-5 !py-3 !text-[16px]">
              Sample recall sheet (PDF)
            </a>
          </div>
        </div>
        <div className="border-[3px] border-ink rounded-lg p-5 bg-paper">
          <p className="label">Sample · VIN 1G1FW6S01H4123456</p>
          <p className="mt-1 cond text-[32px] leading-none">2017 Chevrolet Bolt EV LT</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-wash rounded py-2">
              <p className="cond text-[30px] leading-none">3</p>
              <p className="text-[12px] text-muted">recalls</p>
            </div>
            <div className="bg-red-soft rounded py-2">
              <p className="cond text-[30px] leading-none text-red">1</p>
              <p className="text-[12px] text-muted">park outside</p>
            </div>
            <div className="bg-wash rounded py-2">
              <p className="cond text-[30px] leading-none">47</p>
              <p className="text-[12px] text-muted">complaints</p>
            </div>
          </div>
          <p className="mt-4 text-[14px] text-ink-2">
            <span className="font-semibold text-red">21V-560 · Traction battery.</span> The battery could catch fire when charged to full or nearly full. Until it&apos;s fixed, NHTSA says park outside.
          </p>
        </div>
      </div>
      <div className={`${WRAP} mt-14`}>
        <figure className="rounded-t-xl border border-b-0 border-rule bg-wash p-2.5 pb-0">
          <Image src="/landing/check.png" alt="Tirekick showing a 2017 Chevrolet Bolt EV: 3 recalls for the model year, the battery recall marked park outside, its repair record seen" width={1440} height={900} priority className="w-full h-auto rounded-t-lg border border-b-0 border-line" />
        </figure>
      </div>
    </section>
  );
}

const QUOTES = [
  { q: "Used car has two open recalls, dealer says I need to complete purchase first.", who: "A buyer at a Honda dealer; one recall was a fuel pump", href: "https://www.reddit.com/r/UsedCars/comments/1e762gp/", when: "r/UsedCars, Jul 2024" },
  { q: "Why would a franchise dealership sell a late model vehicle with open recalls?", who: "A buyer asking the forum", href: "https://www.reddit.com/r/UsedCars/comments/1wnfl66/", when: "r/UsedCars" },
  { q: "If you're buying a Pilot, Ridgeline or Passport in a salt state, there's a subframe recall with no fix available yet.", who: "A warning to other buyers", href: "https://www.reddit.com/r/UsedCars/comments/1xoihx4/", when: "r/UsedCars" },
];

function Why() {
  return (
    <section id="why" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="01" eyebrow="Why" title="Recalls follow the car, not the owner.">
          A recall repair is free at any dealer of the make, but a used car can be sold with the work still undone. The buyer finds out at the viewing, or after. The questions are always the same: which recalls, are they done, and is there a fix yet.
        </Head>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {QUOTES.map((x) => (
            <blockquote key={x.href} className="border-t-[3px] border-ink pt-5">
              <p className="text-[19px] leading-snug font-semibold">&ldquo;{x.q}&rdquo;</p>
              <footer className="mt-4 text-[14px] text-muted">
                {x.who}.{" "}
                <a className="underline underline-offset-2 hover:text-ink" href={x.href}>
                  {x.when}
                </a>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const RECALLS: Array<[string, string, string, string?]> = [
  ["21V-560", "Traction battery", "The battery could catch fire when charged to full or nearly full. GM replaces the battery modules, free.", "Park outside"],
  ["23V-845", "Seat belt pretensioner", "After a crash, the pretensioner's exhaust may set the carpet near the B-pillar on fire. Includes cars repaired wrongly under 22V-930."],
  ["22V-930", "Seat belt pretensioner", "The first recall for the same fire risk: metal foil and a cover near the pretensioner."],
  ["20V-701", "Traction battery", "Replaced by 21V-560: that recall's fix covers this one."],
];

function Example() {
  return (
    <section id="example" className="border-b border-line bg-wash">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="02" eyebrow="A real example" title="A 2017 Chevrolet Bolt EV, as NHTSA sees it.">
          Four recalls on record for the model year, one already replaced by a newer one, one with a park-outside warning. And 47 owner complaints, 43 of them about the steering.
        </Head>
        <div className="mt-12 bg-paper border border-line rounded-lg overflow-hidden">
          {RECALLS.map(([id, part, what, warn]) => (
            <div key={id} className={`grid md:grid-cols-[120px_220px_1fr_130px] gap-2 md:gap-6 px-6 py-5 border-b border-line last:border-b-0 ${id === "20V-701" ? "text-muted" : ""}`}>
              <p className="cond text-[24px] leading-none">{id}</p>
              <p className="font-semibold text-[16px]">{part}</p>
              <p className="text-[15.5px] leading-relaxed">{what}</p>
              <p className="md:text-right">{warn ? <span className="rounded-sm bg-red text-white px-2 py-1 text-[12px] font-bold uppercase tracking-wide">{warn}</span> : null}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[14px] text-muted">From NHTSA&apos;s recalls API, read 22 November 2026. The sample VIN is made up (with a valid check digit); NHTSA decodes it as a 2017 Bolt EV LT built in Lansing, Michigan.</p>
      </div>
    </section>
  );
}

const READS: Array<[ReactNode, string, string]> = [
  [<Car01 key="c" size={20} />, "The car, from its VIN", "NHTSA's vPIC decoder: year, make, model, trim, body, fuel and the plant. The VIN's check digit is checked first, so a typo is caught before anything is looked up."],
  [<AlertTriangle key="a" size={20} />, "Every recall for the model year", "Do-not-drive and park-outside recalls first, then fire, crash, brake and steering risks. Recalls replaced by a newer one are marked, not counted twice."],
  [<Tool02 key="t" size={20} />, "The fix, without the paperwork", "What the dealer does, put first; letters mailed and phone numbers left out. The maker's own recall number, which is what a service desk looks up."],
  [<ShieldTick key="s" size={20} />, "What's been proven", "Mark each recall: not confirmed, repair record seen, or open. The sheet, the email and the card follow."],
];

function Reads() {
  return (
    <section className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="03" eyebrow="What it reads" title="Three NHTSA databases, one page." />
        <div className="mt-12 grid sm:grid-cols-2 gap-x-10 gap-y-10">
          {READS.map(([icon, t, d]) => (
            <div key={t} className="flex gap-4">
              <span className="grid place-items-center size-11 shrink-0 rounded-md bg-yellow text-ink">{icon}</span>
              <div>
                <h3 className="cond text-[24px] leading-tight">{t}</h3>
                <p className="mt-1.5 text-[15.5px] text-ink-2 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ["Type the VIN", "From the listing, the windshield (lower left) or the door jamb."],
    ["Read the recalls", "The urgent ones first, each with what can happen and the fix."],
    ["Ask the seller", "Send the email: it names each recall by NHTSA's and the maker's number."],
    ["Take the sheet", "Tick each recall when you see the repair record. Note the dealer and date."],
  ];
  return (
    <section id="how" className="border-b border-line bg-ink text-white">
      <div className={`${WRAP} py-20 md:py-28`}>
        <p className="label !text-yellow">04 · How it works</p>
        <h2 className="mt-4 cond text-[44px] md:text-[64px] leading-[0.98]">A VIN in. The right questions out.</h2>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="border border-white/15 rounded-lg p-6">
              <span className="cond text-[44px] leading-none text-yellow">{i + 1}</span>
              <h3 className="mt-3 cond text-[24px]">{t}</h3>
              <p className="mt-2 text-[15px] text-white/75 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Outputs() {
  return (
    <section id="outputs" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="05" eyebrow="What you get" title="The sheet, the email, the card.">
          Three Hyper Elements templates, rendered in your browser or from the command line.
        </Head>
        <div className="mt-12 grid md:grid-cols-12 gap-4">
          <Tile className="md:col-span-5 md:row-span-2" icon={<FileCheck02 size={17} />} name="The recall sheet" note="US Letter PDF · each recall with a box for the repair record">
            <Image src="/landing/sheet.png" alt="Recall sheet: 2017 Chevrolet Bolt EV LT, 3 recalls, the battery recall's repair record seen" width={1275} height={1650} className="w-full h-auto rounded-md border border-line" />
          </Tile>
          <Tile className="md:col-span-7" icon={<Mail01 size={17} />} name="The email to the seller" note="Asks for the repair records, recall by recall">
            <div className="h-[330px] overflow-hidden rounded-md border border-line bg-wash">
              <Image src="/landing/ask.png" alt="Email: Recalls on the 2017 Chevrolet Bolt EV LT, asking for the repair records of 23V-845 and 22V-930" width={760} height={1000} className="w-full h-auto" />
            </div>
          </Tile>
          <Tile className="md:col-span-7" icon={<Image01 size={17} />} name="The status card" note="1080 × 1080 PNG · for the listing or the group chat">
            <div className="h-[330px] overflow-hidden rounded-md border border-line bg-wash">
              <Image src="/landing/card.png" alt="Recall status card: 1 of 3 recall repairs confirmed" width={1080} height={1080} className="w-full h-auto" />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className = "", icon, name, note, children }: { className?: string; icon: ReactNode; name: string; note: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 border border-line rounded-xl p-5 md:p-6 flex flex-col gap-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-10 rounded-md bg-yellow text-ink">{icon}</span>
        <div>
          <p className="cond text-[22px] leading-tight">{name}</p>
          <p className="text-[13px] text-muted">{note}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Sellers() {
  return (
    <section className="border-b border-line bg-yellow-soft">
      <div className={`${WRAP} py-16 md:py-20 grid md:grid-cols-[1fr_1fr] gap-10 items-center`}>
        <div>
          <p className="label">06 · Selling?</p>
          <h2 className="mt-3 cond text-[40px] md:text-[56px] leading-[0.98]">Answer the question before it&apos;s asked.</h2>
        </div>
        <p className="text-[18px] leading-relaxed text-ink-2">Check your own VIN, mark the recalls your dealer records cover, and put the status card on the listing. A buyer who sees &ldquo;every recall repair confirmed&rdquo; has one less reason to walk.</p>
      </div>
    </section>
  );
}

const FAQ = [
  ["Does this tell me if THIS car's recalls are done?", "Not by itself. NHTSA's public data lists recalls by model year, and not every car in a recall is affected. Whether this VIN's are done is in the dealer's records and in NHTSA's own VIN lookup at nhtsa.gov/recalls, which has a reCAPTCHA and no API. That's why Tirekick writes the email that asks for the records."],
  ["Who pays for a recall repair?", "The maker, at any dealer of the make: NHTSA says recall repairs are free. Its VIN lookup covers recalls from the last 15 years."],
  ["What does “no fix yet” mean?", "NHTSA's text for that recall says the remedy isn't available yet, or comes in phases. The car can still be sold; ask what the interim advice is."],
  ["Which cars does it cover?", "Cars, trucks and motorcycles sold in the US with a 17-character VIN (1981 on). If NHTSA's recall data names the model differently, Tirekick tries the names NHTSA lists for that make and year."],
  ["Are the complaints real problems?", "They're owners' reports to NHTSA, not confirmed defects. A part with many complaints is worth a closer look on the test drive."],
  ["Is my VIN stored anywhere?", "No. Your browser asks NHTSA directly and makes the PDF, the email and the image itself."],
] as const;

function Faq() {
  return (
    <section id="faq" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28 grid md:grid-cols-[360px_1fr] gap-12`}>
        <div className="md:sticky md:top-28 self-start">
          <Head n="07" eyebrow="FAQ" title="Before the test drive." />
        </div>
        <div className="border-t-[3px] border-ink">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-[18px]">
                {q}
                <span className="grid place-items-center size-8 shrink-0 rounded bg-yellow text-[18px] font-bold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-[16px] text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <>
      <section className="bg-yellow">
        <div className={`${WRAP} py-16 md:py-20 grid md:grid-cols-[1fr_auto] gap-8 items-end`}>
          <h2 className="cond text-[44px] md:text-[72px] leading-[0.95] max-w-[760px]">Know the recalls before you shake hands.</h2>
          <Link href="/check" className="btn btn-ink !px-6 !py-3.5 !text-[16px]">
            Check a car <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className={`${WRAP} py-10 flex flex-col md:flex-row gap-3 justify-between text-[13.5px] text-muted`}>
        <span className="flex items-center gap-2 cond text-[20px] text-ink tracking-wide">
          <Logo size={22} /> TIREKICK
        </span>
        <p className="max-w-[720px] md:text-right">
          Built with{" "}
          <a className="underline underline-offset-2 hover:text-ink inline-flex items-center gap-0.5" href="https://github.com/hyper-elements/hyper-elements">
            Hyper Elements <ArrowUpRight size={12} />
          </a>
          . Data from NHTSA (vPIC, recalls, complaints). Not affiliated with NHTSA or any carmaker. The sample VIN and Maya Chen are made up.
        </p>
      </footer>
    </>
  );
}

function Head({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[820px]">
      <p className="label">
        <span className="text-ink">{n}</span> · {eyebrow}
      </p>
      <h2 className="mt-4 cond text-[44px] md:text-[64px] leading-[0.98]">{title}</h2>
      {children ? <p className="mt-5 text-[18px] leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
