/**
 * The recall sheet: a US Letter PDF the buyer takes to the viewing. The car from its VIN, every safety recall for its
 * model year (do-not-drive and park-outside first) with what can happen, the fix, and a box to tick when the seller
 * shows the repair record; then what owners complain about most. Pages are planned from estimated heights, because a
 * Document page doesn't flow by itself.
 */
import { Fragment, type ReactNode } from "react";
import { Column, Document, Heading, PageBreak, PageFooter, PageNumber, Row, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { COND, FONT_FILES, GREEN, INK, INK2, LINE, MUTED, PAPER, RED, RED_SOFT, SANS, STATUS_COLOR, Square, WASH, YELLOW, YELLOW_SOFT, example, fields, live, longDate, plural, shortDate, type RecallV, type Values } from "./_shared/doc.tsx";

const W = 720; // Letter at 96 dpi (816 px) minus two 48 px margins
const PAGE = 900;
const label = { fontFamily: SANS, fontWeight: 600, fontSize: 7.5, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED } as const;
const lines = (t: string, per: number) => Math.max(1, Math.ceil(t.length / per));

function Recall({ r }: { r: RecallV }) {
  const old = !!r.supersededBy;
  const tag = r.warning ?? (r.noFixYet ? "No fix yet" : undefined);
  return (
    <Column style={{ width: W, gap: 6, padding: [10, 12], border: `0.75px solid ${LINE}`, backgroundColor: PAPER }}>
      <Row style={{ width: W - 26, alignItems: "center", gap: 10 }}>
        <Column style={{ width: 70 }}>
          <Text style={{ fontFamily: COND, fontWeight: 700, fontSize: 15, color: old ? MUTED : INK }}>{r.id}</Text>
        </Column>
        <Column style={{ width: W - 26 - 70 - 10 - 10 - 190 }}>
          <Text style={{ fontWeight: 600, fontSize: 10.5, color: old ? MUTED : INK }}>{`${r.part} · ${shortDate(r.date)}`}</Text>
        </Column>
        <Row style={{ width: 190, gap: 6, justifyContent: "end", alignItems: "center" }}>
          {tag ? (
            <Column style={{ width: tag.length * 5.2 + 14, backgroundColor: r.warning === "Do not drive" || r.warning === "Park outside" ? RED : YELLOW, padding: [2, 7] }}>
              <Text style={{ fontWeight: 700, fontSize: 7.5, letterSpacing: 0.5, textTransform: "uppercase", color: r.warning ? PAPER : INK }}>{tag}</Text>
            </Column>
          ) : null}
          {r.ota ? (
            <Column style={{ width: 76, backgroundColor: WASH, padding: [2, 7] }}>
              <Text style={{ fontWeight: 700, fontSize: 7.5, letterSpacing: 0.5, color: INK2 }}>OVER THE AIR</Text>
            </Column>
          ) : null}
        </Row>
      </Row>
      {old ? (
        <Text style={{ fontSize: 9, color: MUTED }}>{`Replaced by ${r.supersededBy}: that recall's fix covers this one. ${r.summary}`}</Text>
      ) : (
        <Fragment>
          <Text style={{ fontSize: 9.5, color: INK2, lineHeight: 1.4 }}>{r.summary}</Text>
          <Row style={{ width: W - 26, gap: 14, alignItems: "start" }}>
            <Column style={{ width: 230, gap: 2 }}>
              <Text style={label}>What can happen</Text>
              <Text style={{ fontSize: 9.5, fontWeight: 600, color: r.warning ? RED : INK, lineHeight: 1.35 }}>{r.consequence}</Text>
            </Column>
            <Column style={{ width: W - 26 - 230 - 14, gap: 2 }}>
              <Text style={label}>{`The fix${r.makerRef ? ` · maker's number ${r.makerRef}` : ""}`}</Text>
              <Text style={{ fontSize: 9, color: INK2, lineHeight: 1.35 }}>{r.remedy}</Text>
            </Column>
          </Row>
          <Row style={{ width: W - 26, gap: 18, alignItems: "center", padding: [6, 0, 0], border: { top: `0.75px dashed ${LINE}` } }}>
            {(["done", "open"] as const).map((s) => (
              <Row key={s} style={{ gap: 6, alignItems: "center" }}>
                <Square size={10} color={INK} fill={r.status === s ? STATUS_COLOR[s] : undefined} />
                <Text style={{ fontSize: 9, fontWeight: r.status === s ? 700 : 400, color: r.status === s ? STATUS_COLOR[s] : INK2 }}>{s === "done" ? "Repair record seen" : "Still open"}</Text>
              </Row>
            ))}
            <Text style={{ fontSize: 8.5, color: MUTED }}>Record / dealer / date: ______________________________</Text>
          </Row>
        </Fragment>
      )}
    </Column>
  );
}
const recallHeight = (r: RecallV) => (r.supersededBy ? 30 + 12 * lines(r.summary, 150) : 36 + 14 * lines(r.summary, 135) + Math.max(14 + 13 * lines(r.consequence, 48), 14 + 12 * lines(r.remedy, 92)) + 26 + 18);

function Complaints({ v }: { v: Values }) {
  const c = v.complaints;
  const max = Math.max(1, ...c.top.map((t) => t.count));
  const BAR = 360;
  return (
    <Column style={{ width: W, gap: 8, padding: [12, 14], backgroundColor: WASH }}>
      <Row style={{ width: W - 28, alignItems: "end" }}>
        <Column>
          <Heading level={2} style={{ fontFamily: COND, fontWeight: 700, fontSize: 16 }}>
            What owners report
          </Heading>
        </Column>
        <Column style={{ width: 360 }}>
          <Text style={{ ...label, textAlign: "right" }}>{`${plural(c.total, "complaint")} to NHTSA for the ${v.year} ${v.model}`}</Text>
        </Column>
      </Row>
      {c.top.map((t) => (
        <Row key={t.component} style={{ width: W - 28, gap: 10, alignItems: "center" }}>
          <Column style={{ width: 200 }}>
            <Text style={{ fontSize: 9.5, color: INK }}>{t.component}</Text>
          </Column>
          <Column style={{ width: Math.max(2, Math.round((BAR * t.count) / max)), height: 9, backgroundColor: INK }}>
            <Text style={{ fontSize: 1, color: INK }}> </Text>
          </Column>
          <Text style={{ fontSize: 9, fontWeight: 600, color: INK2 }}>{String(t.count)}</Text>
        </Row>
      ))}
      <Text style={{ fontSize: 9, color: INK2 }}>{`${plural(c.crashes, "complaint")} mention a crash, ${c.fires} a fire; ${plural(c.injuries, "injury", "injuries")}, ${plural(c.deaths, "death")} reported. Complaints are owners' reports, not confirmed defects; a part with many is worth a closer look on the test drive.`}</Text>
    </Column>
  );
}
const complaintsHeight = (v: Values) => 70 + 17 * v.complaints.top.length + 26;

export default template({
  id: "tirekick.Sheet",
  version: "1.0.0",
  label: "Recall check sheet (PDF)",
  guidance: "Print it and take it to the viewing. Tick each recall when the seller shows the repair record.",
  root: "Document",
  formats: { letter: { size: "Letter", orientation: "portrait" } },
  fields,
  example,
  render(input) {
    const v = input as unknown as Values;
    const blocks: Array<{ h: number; node: ReactNode }> = [];
    v.recalls.forEach((r) => blocks.push({ h: recallHeight(r) + 10, node: <Recall r={r} /> }));
    if (!v.recalls.length) blocks.push({ h: 60, node: <Text style={{ fontSize: 11, color: INK2 }}>{`NHTSA lists no safety recalls for the ${v.year} ${v.make} ${v.model}.`}</Text> });
    if (v.complaints.total) blocks.push({ h: complaintsHeight(v) + 10, node: <Complaints v={v} /> });
    const pages: ReactNode[][] = [[]];
    let room = PAGE - 400;
    for (const b of blocks) {
      if (b.h > room && pages.at(-1)!.length) {
        pages.push([]);
        room = PAGE;
      }
      pages.at(-1)!.push(b.node);
      room -= b.h;
    }
    const n = live(v).length;
    const urgent = live(v).filter((r) => r.warning);
    const specs = [v.body, v.fuel, v.plant && `built in ${v.plant}`, v.mileage, v.price].filter(Boolean).join(" · ");
    return (
      <Document size="Letter" margin={48} title={`Recall check: ${v.car}`} lang="en" fonts={FONT_FILES} style={{ fontFamily: SANS, fontSize: 10, color: INK, gap: 10 }}>
        <Row style={{ width: W, backgroundColor: YELLOW, padding: [8, 12], alignItems: "center" }}>
          <Column>
            <Text style={{ fontFamily: COND, fontWeight: 700, fontSize: 13, letterSpacing: 1.2 }}>TIREKICK · RECALL CHECK</Text>
          </Column>
          <Column style={{ width: 300 }}>
            <Text style={{ fontWeight: 600, fontSize: 9, textAlign: "right" }}>{`${v.buyer ? `For ${v.buyer} · ` : ""}${longDate(v.date)}`}</Text>
          </Column>
        </Row>
        <Column style={{ width: W, gap: 3, padding: [6, 0, 0] }}>
          <Heading level={1} style={{ fontFamily: COND, fontWeight: 700, fontSize: 34, lineHeight: 1.05 }}>
            {v.car}
          </Heading>
          <Text style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1.5 }}>{`VIN ${v.vin}`}</Text>
          {specs ? <Text style={{ fontSize: 9.5, color: MUTED }}>{specs}</Text> : null}
        </Column>
        <Row style={{ width: W, gap: 8 }}>
          {(
            [
              ["Recalls for this model year", String(n), INK],
              ["Do not drive / park outside", String(urgent.length), urgent.length ? RED : INK],
              ["Repair record seen", String(v.done), GREEN],
              ["Still to ask about", String(v.toAsk + v.open), v.toAsk + v.open ? RED : INK],
            ] as const
          ).map(([k, val, color]) => (
            <Column key={k} style={{ backgroundColor: WASH, padding: [8, 10], gap: 1, border: { top: `3px solid ${color}` } }}>
              <Text style={{ fontFamily: COND, fontWeight: 700, fontSize: 24, color }}>{val}</Text>
              <Text style={label}>{k}</Text>
            </Column>
          ))}
        </Row>
        <Column style={{ width: W, padding: [8, 12], backgroundColor: urgent.length ? RED_SOFT : YELLOW_SOFT, gap: 2 }}>
          <Text style={{ fontWeight: 700, fontSize: 10.5, color: urgent.length ? RED : INK }}>
            {urgent.length ? `${urgent.map((r) => r.id).join(", ")}: NHTSA says ${urgent[0].warning?.toLowerCase()} until fixed. Ask for this repair record first.` : "Ask the seller for the repair record of each recall below."}
          </Text>
          <Text style={{ fontSize: 8.5, color: INK2, lineHeight: 1.4 }}>Recalls are listed for the model year; not every car in a recall is affected, and some were already fixed. Check this VIN at nhtsa.gov/recalls, or ask a dealer of the make to look it up. NHTSA: recall repairs are free at a dealer of the make.</Text>
        </Column>

        {pages.map((page, i) => (
          <Fragment key={i}>
            {i ? <PageBreak /> : null}
            {page.map((node, j) => (
              <Fragment key={j}>{node}</Fragment>
            ))}
          </Fragment>
        ))}

        <PageFooter style={{ padding: [8, 0, 0], border: { top: `0.75px solid ${LINE}` } }}>
          <Row>
            <Column>
              <Text style={{ fontSize: 7.5, color: MUTED }}>{`Tirekick · ${v.car} · VIN ${v.vin} · data: NHTSA (vPIC, recalls, complaints), ${longDate(v.date)}`}</Text>
            </Column>
            <Column style={{ width: 80 }}>
              <Text style={{ fontSize: 7.5, color: MUTED, textAlign: "right" }}>
                Page <PageNumber /> of <PageNumber total />
              </Text>
            </Column>
          </Row>
        </PageFooter>
      </Document>
    );
  },
});
