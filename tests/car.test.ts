import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkVin, clip, fixOnly, fromComplaints, fromDecode, fromRecalls, modelCandidates, shortId, toValues } from "../templates/_shared/car.ts";

const read = (n: string) => JSON.parse(readFileSync(new URL(`../public/samples/${n}.json`, import.meta.url), "utf8"));

test("VIN checks: length, I/O/Q, the check digit", () => {
  assert.equal(checkVin(" 1g1fw6s01h4123456 ").vin, "1G1FW6S01H4123456");
  assert.equal(checkVin("1G1FW6S01H4123456").error, undefined);
  assert.match(checkVin("1G1FW6S09H4123456").error!, /9th character should be 1/);
  assert.match(checkVin("1G1FW6S01H412345").error!, /17 characters/);
  assert.match(checkVin("1G1FW6SO1H4123456").error!, /I, O or Q/);
});

test("the sample car decodes clean", () => {
  const car = fromDecode(read("decode"), "1G1FW6S01H4123456");
  assert.deepEqual([car.year, car.make, car.model, car.trim], [2017, "Chevrolet", "Bolt EV", "LT"]);
});

test("recalls: park-outside first, superseded last, ids and maker numbers read", () => {
  const r = fromRecalls(read("recalls"));
  assert.deepEqual(r.map((x) => x.id), ["21V-560", "23V-845", "22V-930", "20V-701"]);
  assert.equal(r[0].parkOutside, true);
  assert.equal(r[0].makerRef, "N212343880");
  assert.equal(r[3].supersededBy, "21V-560");
  assert.equal(shortId("26V451000"), "26V-451");
});

test("the fix comes first and the paperwork goes", () => {
  const f = fixOnly("Owners are advised to park outside. Defective modules will be replaced, free of charge. Owner notification letters were mailed on August 13, 2021. Owners may contact GM at 1-833-382-4389.");
  assert.equal(f, "Defective modules will be replaced, free of charge. Owners are advised to park outside.");
  assert.equal(clip("One. Two three four.", 12), "One. Two…");
  assert.equal(clip("A long first sentence. Then more words here.", 30), "A long first sentence.");
});

test("no fix yet is read from NHTSA's wording, not from routine 'interim letters'", () => {
  const raw = (Remedy: string) => ({ results: [{ NHTSACampaignNumber: "26V451000", ReportReceivedDate: "01/08/2026", Component: "X", Summary: "s", Consequence: "c", Remedy }] });
  assert.equal(fromRecalls(raw("This will be a phased campaign, with the remedy becoming available in different phases.")).at(0)!.noFixYet, true);
  assert.equal(fromRecalls(raw("Dealers will update the software, free of charge. Interim owner notification letters were mailed April 1.")).at(0)!.noFixYet, false);
});

test("complaints and model names", () => {
  const c = fromComplaints(read("complaints"));
  assert.equal(c.total, 47);
  assert.equal(c.top[0].component, "Steering");
  assert.ok(!c.top.some((t) => /unknown/i.test(t.component)));
  assert.deepEqual(modelCandidates("Bolt EV", { results: [{ model: "BOLT" }, { model: "BOLT EV" }, { model: "CAMARO" }] }), ["BOLT EV", "BOLT"]);
});

test("values count only the live recalls", () => {
  const r = fromRecalls(read("recalls"));
  const v = toValues(fromDecode(read("decode"), "1G1FW6S01H4123456"), r, fromComplaints(read("complaints")), { date: "2026-11-22", statuses: { "21V560000": "done" } });
  assert.deepEqual([v.done, v.toAsk, v.open], [1, 2, 0]);
  assert.equal(v.recalls[3].warning, undefined); // superseded: no park-outside tag
});
