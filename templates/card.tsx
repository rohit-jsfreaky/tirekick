/**
 * The card: a 1080 × 1080 image of the car's recall status, for a seller's listing or the buyer's group chat. Each
 * recall with what it covers and whether the repair record has been seen.
 */
import { Canvas, Column, Row, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { COND, FONT_FILES, GREEN, INK, INK2, LINE, MUTED, PAPER, RED, SANS, STATUS, STATUS_COLOR, Square, WASH, YELLOW, example, fields, live, longDate, type Values } from "./_shared/doc.tsx";

const W = 1080;
const PAD = 72;
const IN = W - 2 * PAD;

export default template({
  id: "tirekick.Card",
  version: "1.0.0",
  label: "Recall status card (image)",
  guidance: "Put it on the listing or send it to whoever is helping you buy: each recall and whether its repair record was seen.",
  root: "Canvas",
  formats: { card: { width: W, height: W, scale: 1 } },
  fields,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example,
  render(input) {
    const v = input as unknown as Values;
    const list = live(v);
    const shown = list.slice(0, 5);
    const done = list.filter((r) => r.status === "done").length;
    const head = !list.length ? "No recalls listed" : done === list.length ? "Every recall repair confirmed" : `${done} of ${list.length} recall repairs confirmed`;
    return (
      <Canvas width={W} height={W} fonts={FONT_FILES} style={{ backgroundColor: PAPER, fontFamily: SANS, color: INK, gap: 0 }}>
        <Row style={{ width: W, height: 92, backgroundColor: YELLOW, padding: [0, PAD], alignItems: "center" }}>
          <Text style={{ width: IN - 320, fontFamily: COND, fontWeight: 700, fontSize: 34, letterSpacing: 2 }}>RECALL STATUS</Text>
          <Text style={{ width: 320, fontWeight: 600, fontSize: 22, textAlign: "right" }}>{longDate(v.date)}</Text>
        </Row>
        <Column style={{ width: W, height: W - 92 - 110, gap: 0 }}>
        <Column style={{ width: W, padding: [44, PAD, 0], gap: 10 }}>
          <Text fit={{ sizes: [72, 64, 56, 48], maxLines: 1 }} style={{ width: IN, fontFamily: COND, fontWeight: 700, lineHeight: 1.05 }}>
            {v.car}
          </Text>
          <Text style={{ width: IN, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: INK2 }}>{`VIN ${v.vin}`}</Text>
        </Column>
        <Column style={{ width: W, padding: [32, PAD, 0], gap: 14 }}>
          {shown.map((r) => (
            <Row key={r.id} style={{ width: IN, gap: 20, alignItems: "center", padding: [14, 18], backgroundColor: WASH }}>
              <Square size={26} color={STATUS_COLOR[r.status]} fill={r.status === "ask" ? undefined : STATUS_COLOR[r.status]} />
              <Column style={{ width: IN - 36 - 26 - 40 - 250, gap: 2 }}>
                <Text style={{ width: IN - 36 - 26 - 40 - 250, fontFamily: COND, fontWeight: 700, fontSize: 30 }}>{r.id}</Text>
                <Text fit={{ sizes: [22, 20, 18], maxLines: 1 }} style={{ width: IN - 36 - 26 - 40 - 250, color: INK2 }}>
                  {`${r.part}${r.warning ? ` · ${r.warning.toLowerCase()} until fixed` : ""}`}
                </Text>
              </Column>
              <Text style={{ width: 250, fontWeight: 700, fontSize: 22, color: STATUS_COLOR[r.status], textAlign: "right" }}>{STATUS[r.status]}</Text>
            </Row>
          ))}
          {list.length > shown.length ? <Text style={{ width: IN, fontSize: 22, color: MUTED }}>{`+ ${list.length - shown.length} more on the recall sheet`}</Text> : null}
          {shown.length <= 3 && v.complaints.top.length ? (
            <Column style={{ width: IN, gap: 4, padding: [16, 0, 0] }}>
              <Text style={{ width: IN, fontWeight: 600, fontSize: 18, letterSpacing: 1.5, color: MUTED }}>WHAT OWNERS REPORT MOST</Text>
              <Text fit={{ sizes: [26, 23, 20], maxLines: 1 }} style={{ width: IN, color: INK2 }}>
                {`${v.complaints.top[0].component}: ${v.complaints.top[0].count} of ${v.complaints.total} complaints to NHTSA for the ${v.year} ${v.model}`}
              </Text>
            </Column>
          ) : null}
          {!list.length ? <Text style={{ width: IN, fontSize: 28, color: INK2 }}>{`NHTSA lists no safety recalls for the ${v.year} ${v.make} ${v.model}.`}</Text> : null}
        </Column>
        </Column>
        <Row style={{ width: W, height: 110, padding: [0, PAD], alignItems: "center", border: { top: `1px solid ${LINE}` } }}>
          <Text style={{ width: IN - 380, fontFamily: COND, fontWeight: 700, fontSize: 32, color: list.length && done === list.length ? GREEN : list.some((r) => r.status === "open") ? RED : INK }}>{head}</Text>
          <Text style={{ width: 380, fontSize: 19, color: MUTED, textAlign: "right" }}>NHTSA recall data · Tirekick</Text>
        </Row>
      </Canvas>
    );
  },
});
