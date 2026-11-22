/**
 * The ask: the buyer's email to the seller before the viewing. It names each recall still to confirm by its NHTSA
 * number (and the maker's, which is what a dealer's service desk looks up), and asks for the repair records. Polite,
 * specific, and easy to answer with a photo of the paperwork.
 */
import { Column, Email, Heading, Link, Row, Section, Text } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { COND, FONT_URLS, GREEN, INK, INK2, MUTED, RED, WASH, YELLOW, example, fields, live, longDate, plural, theme, type Values } from "./_shared/doc.tsx";

const label = { fontWeight: 600, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED } as const;

export default template({
  id: "tirekick.Ask",
  version: "1.0.0",
  label: "Recall questions for the seller (email)",
  guidance: "Send it before the viewing. The seller answers with photos of the repair records.",
  root: "Email",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["lang", "contrast", "link-text"] }, root: { previewText: true } },
  example,
  render(input) {
    const v = input as unknown as Values;
    const ask = live(v).filter((r) => r.status !== "done");
    const seen = live(v).filter((r) => r.status === "done");
    const subject = `Recalls on the ${v.car}`;
    return (
      <Email theme={theme} lang="en" width={600} fonts={FONT_URLS} title={subject} previewText={ask.length ? `Before I come to see it: could you send the repair records for ${plural(ask.length, "recall")}?` : "Thanks for the recall records: all seen."} style={{ gap: 0 }}>
        <Section style={{ padding: [24, 24, 0] }}>
          <Row style={{ backgroundColor: YELLOW, padding: [8, 14] }}>
            <Text style={{ fontFamily: COND, fontWeight: 700, fontSize: 15, letterSpacing: 1.2, color: INK }}>RECALL CHECK</Text>
          </Row>
        </Section>
        <Column style={{ apply: ["card"] }}>
          <Heading level={1}>{subject}</Heading>
          <Text style={{ fontWeight: 600, letterSpacing: 1, color: INK2 }}>{`VIN ${v.vin}`}</Text>
          <Text>{`Hi${v.seller ? ` ${v.seller}` : ""}, I'm interested in the car${v.price ? ` at ${v.price}` : ""}. NHTSA lists ${plural(live(v).length, "safety recall")} for the ${v.year} ${v.make} ${v.model}. ${ask.length ? `Before I come to see it, could you send the repair records (the dealer's invoice or repair order) for ${ask.length === 1 ? "this one" : "these"}?` : "Thank you for the records: I've seen all of them."}`}</Text>
          {ask.length ? (
            <Column style={{ gap: 10 }}>
              {ask.map((r) => (
                <Column key={r.id} style={{ gap: 2, padding: [10, 14], backgroundColor: WASH, border: { left: `4px solid ${r.warning ? RED : INK}` } }}>
                  <Text style={{ fontFamily: COND, fontWeight: 700, fontSize: 18, color: INK }}>{`${r.id}${r.makerRef ? ` (${v.make} ${r.makerRef})` : ""}`}</Text>
                  <Text style={{ fontSize: 15, color: INK2 }}>{`${r.part}. ${r.consequence}`}</Text>
                  {r.warning ? <Text style={{ fontSize: 15, fontWeight: 600, color: RED }}>{`NHTSA's advice until it's fixed: ${r.warning.toLowerCase()}.`}</Text> : null}
                </Column>
              ))}
            </Column>
          ) : null}
          {seen.length ? <Text style={{ fontSize: 15, color: GREEN }}>{`Already seen, thank you: ${seen.map((r) => r.id).join(", ")}.`}</Text> : null}
          <Text>{ask.length ? "If one was never done, that's fine to say: recall repairs are free at any dealer of the make, and I'd just book it before buying." : "See you at the viewing."}</Text>
          <Column style={{ gap: 0 }}>
            <Text>{v.buyer ? "Thanks," : "Thanks!"}</Text>
            {v.buyer ? <Text>{v.buyer}</Text> : null}
          </Column>
        </Column>
        <Section style={{ padding: [16, 24, 28] }}>
          <Text style={{ fontSize: 13, color: MUTED }}>
            Recall details: <Link href={`https://www.nhtsa.gov/recalls`}>NHTSA recall lookup</Link>
            {` · data read ${longDate(v.date)}`}
          </Text>
          <Text style={{ ...label, fontSize: 13 }}>Checked with Tirekick</Text>
        </Section>
      </Email>
    );
  },
});
