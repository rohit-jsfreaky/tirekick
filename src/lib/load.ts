// Asks NHTSA (all three APIs answer the browser directly), or reads the frozen sample.
import { checkVin, fromComplaints, fromDecode, fromRecalls, modelCandidates, type Car, type Complaints, type Recall } from "../../templates/_shared/car.ts";

export type Looked = { car: Car; recalls: Recall[]; complaints: Complaints; recallModel: string };

const get = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NHTSA answered ${res.status}. Try again in a minute.`);
  return res.json();
};
const q = encodeURIComponent;

export async function lookup(raw: string): Promise<Looked> {
  const { vin, error } = checkVin(raw);
  if (error) throw new Error(error);
  const car = fromDecode(await get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`), vin);
  if (car.year < 1981) throw new Error("NHTSA's recall data starts with 17-character VINs (1981 on).");
  let recallModel = car.model;
  let recalls = await get(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${q(car.make)}&model=${q(car.model)}&modelYear=${car.year}`);
  if (!recalls.results?.length) {
    // NHTSA's recall data may name the model differently: try the names it lists for this make and year.
    const products = await get(`https://api.nhtsa.gov/products/vehicle/models?modelYear=${car.year}&make=${q(car.make)}&issueType=r`);
    for (const m of modelCandidates(car.model, products).slice(1, 4)) {
      const next = await get(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${q(car.make)}&model=${q(m)}&modelYear=${car.year}`);
      if (next.results?.length) {
        recalls = next;
        recallModel = m;
        break;
      }
    }
  }
  const complaints = await get(`https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${q(car.make)}&model=${q(recallModel)}&modelYear=${car.year}`);
  return { car, recalls: fromRecalls(recalls), complaints: fromComplaints(complaints), recallModel };
}

export async function sample(): Promise<Looked> {
  const [d, r, c] = await Promise.all(["decode", "recalls", "complaints"].map((n) => fetch(`/samples/${n}.json`).then((x) => x.json())));
  const car = fromDecode(d, SAMPLE_VIN);
  return { car, recalls: fromRecalls(r), complaints: fromComplaints(c), recallModel: car.model };
}

/** Made up, with a valid check digit; NHTSA decodes it as a 2017 Chevrolet Bolt EV LT. */
export const SAMPLE_VIN = "1G1FW6S01H4123456";
export const SAMPLE_META = { buyer: "Maya Chen", seller: "", mileage: "41,200 mi", price: "$11,900", listing: "" };
