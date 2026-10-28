/* eslint-disable no-console -- CLI: telt en schrijft recordlijsten, geen transcript-inhoud of PII */
/**
 * READ-ONLY. Selectie voor de wekelijkse klantanalyse-batch (skill `klantanalyse-run`; bron
 * skills/klantanalyse-run/scripts/, kopiëren naar wecall-app/scripts/). Afgeleid van
 * _klantanalyse-selectie-1210.ts (RUNS 112), 19-10-2026. Venster en map als argument:
 *   --van YYYY-MM-DD --tot YYYY-MM-DD (beide inclusief) --map C:/tmp/wecall-klantanalyse-DDMM
 * De map moet gi-paren-ruw.txt bevatten (uitvoer van pick-geen-interesse-batch.ts over hetzelfde venster).
 *
 * SALES: dezelfde populatie als /afdelingen/back-office/ai-compliance/archief/klantanalyse
 * (lib/corpus/dekking-stats.ts): corpus.leg is_sale + rol 'sale', één rij per record op de dag
 * van het LAATSTE salesgesprek. Daarvan: gebrugd (compliance.transcript), nog geen
 * klant_dossier, niet op de verbodslijst, en met een sale + adres (anders slaat
 * klant-dossier-runner het record over).
 *
 * GEEN INTERESSE: de record:hid-paren uit pick-geen-interesse-batch.ts (al gefilterd op
 * dossier, nummer en verbodslijst). Hier gaat de overlap met de sales eruit (klant_dossier
 * heeft record als sleutel, dus een record in beide stromen levert één dossier en de laatste
 * run overschrijft de eerste; run 71: record 3949100), plus wat analyse-recycling-leads-run
 * zelf zou overslaan (geen adres in de belbak of geen transcript van dit gesprek).
 *
 * Nul tokens, geen writes naar de database. Schrijft alleen de lijsten naar C:/tmp.
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/_klantanalyse-selectie.ts --van 2026-10-12 --tot 2026-10-18 --map C:/tmp/wecall-klantanalyse-1910
 */
import fs from "node:fs";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { getKlantProfiel } from "@/lib/compliance/klant";
import { getRecyclingLeadProfiel, getRecyclingTranscript } from "@/lib/corpus/recycling-lead-profiel";

const arg = (f: string): string | null => {
  const i = process.argv.indexOf(f);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
};
const MAP = arg("--map") ?? "";
const VAN = arg("--van") ?? "";
const TOT = arg("--tot") ?? "";
if (!MAP || !/^\d{4}-\d{2}-\d{2}$/.test(VAN) || !/^\d{4}-\d{2}-\d{2}$/.test(TOT)) throw new Error("geef --van, --tot en --map");
/** Gemeten in app.ai_run run 322 (RUNS 112, met denkstappen): EUR 28,81/462. */
const EUR_SALES = 0.0624;
/** Gemeten in app.ai_run run 321 (RUNS 112, met denkstappen): EUR 15,82/332. */
const EUR_GI = 0.0477;

type Rij = {
  record: string;
  dag: string;
  gebrugd: boolean;
  dossier: boolean;
  verbod: boolean;
  nummer_ok: boolean;
  transcript_leeg: boolean;
};

async function main() {
  await db.execute(sql`SET statement_timeout = '300s'`);

  const rows = (
    await db.execute<Rij>(sql`
      WITH sg AS (
        SELECT DISTINCT ON (l.record_id)
               l.record_id, l.klant_key, to_char(l.contact_datetime, 'YYYY-MM-DD') AS dag
        FROM corpus.leg l
        WHERE l.is_sale = true AND l.rol = 'sale'
          AND l.contact_datetime >= '2026-08-01'::date
        ORDER BY l.record_id, l.contact_datetime DESC
      )
      SELECT sg.record_id::text AS record, sg.dag,
             (cc.record IS NOT NULL)                           AS gebrugd,
             (kd.record IS NOT NULL)                           AS dossier,
             (v.phone9 IS NOT NULL)                            AS verbod,
             (length(COALESCE(sg.klant_key, '')) = 9)          AS nummer_ok,
             (cc.record IS NOT NULL AND COALESCE(jsonb_array_length(cc.segments), 0) = 0) AS transcript_leeg
      FROM sg
      LEFT JOIN compliance.transcript cc ON cc.record = sg.record_id
      LEFT JOIN compliance.klant_dossier kd ON kd.record = sg.record_id
      LEFT JOIN (SELECT DISTINCT phone9 FROM compliance.bel_verbod) v ON v.phone9 = sg.klant_key
      WHERE sg.dag BETWEEN ${VAN} AND ${TOT}
      ORDER BY sg.dag, sg.record_id`)
  ).rows;

  console.log(`Klantanalyse-selectie ${VAN} t/m ${TOT}\n`);
  console.log("SALES per gespreksdag (zelfde telling als het archief):");
  console.log("  dag          gesprekken  gebrugd  geanalyseerd  klaar");
  const dagen = [...new Set(rows.map((r) => r.dag))];
  for (const d of dagen) {
    const x = rows.filter((r) => r.dag === d);
    const g = x.filter((r) => r.gebrugd).length;
    const a = x.filter((r) => r.dossier).length;
    const klaar = x.filter((r) => r.gebrugd && !r.dossier).length;
    console.log(`  ${d}   ${String(x.length).padStart(8)}  ${String(g).padStart(7)}  ${String(a).padStart(12)}  ${String(klaar).padStart(5)}`);
  }

  const stap = (naam: string, lijst: Rij[], houd: (r: Rij) => boolean) => {
    const over = lijst.filter(houd);
    console.log(`  ${naam.padEnd(34)} -${String(lijst.length - over.length).padStart(4)}  → ${over.length}`);
    return over;
  };
  console.log(`\nSALES-poorten (van ${rows.length} salesgesprekken):`);
  let over = stap("nog niet gebrugd", rows, (r) => r.gebrugd);
  over = stap("al een klant_dossier", over, (r) => !r.dossier);
  over = stap("leeg transcript in compliance", over, (r) => !r.transcript_leeg);
  over = stap("op de verbodslijst (AVG)", over, (r) => !r.verbod);

  // Sale + adres: exact de toets van klant-dossier-runner (getKlantProfiel), zodat het
  // aantal in de lijst ook het aantal is dat de runner instuurt.
  const zonderSale: string[] = [];
  const metSale: Rij[] = [];
  for (const r of over) {
    const p = await getKlantProfiel(Number(r.record));
    if (!p || !p.postcode || !p.huisnummer) zonderSale.push(r.record);
    else metSale.push(r);
  }
  console.log(`  ${"geen gekoppelde sale of adres".padEnd(34)} -${String(zonderSale.length).padStart(4)}  → ${metSale.length}`);
  const geenNummer = metSale.filter((r) => !r.nummer_ok).length;
  if (geenNummer) console.log(`  (waarvan ${geenNummer} zonder geldig belnummer: wel analyseren, niet doorzetbaar)`);

  const sales = metSale.map((r) => r.record);
  const salesSet = new Set(sales);

  // GEEN INTERESSE: overlap met sales eruit.
  const ruw = fs.readFileSync(`${MAP}/gi-paren-ruw.txt`, "utf8").split(/\s+/).filter(Boolean);
  const zonderOverlap = ruw.filter((p) => !salesSet.has(p.split(":")[0]));
  console.log(`\nGEEN INTERESSE: ${ruw.length} paren uit de picker`);
  console.log(`  ${"ook in de salesselectie".padEnd(34)} -${String(ruw.length - zonderOverlap.length).padStart(4)}  → ${zonderOverlap.length}`);
  // Exact de overslaan-toetsen van analyse-recycling-leads-run.ts (adres uit de belbak,
  // transcript van precies dit gesprek), zodat de lijst gelijk is aan wat die runner instuurt.
  const giOverslaan: string[] = [];
  const gi: string[] = [];
  for (const p of zonderOverlap) {
    const [rec, hid] = p.split(":").map(Number);
    const profiel = await getRecyclingLeadProfiel(rec);
    const segs = profiel?.postcode && profiel?.huisnummer ? await getRecyclingTranscript(rec, hid) : null;
    if (!segs || !segs.length) giOverslaan.push(p);
    else gi.push(p);
  }
  console.log(`  ${"geen adres of transcript".padEnd(34)} -${String(giOverslaan.length).padStart(4)}  → ${gi.length}`);
  if (giOverslaan.length) fs.writeFileSync(`${MAP}/gi-overgeslagen.txt`, giOverslaan.join(" "));
  const giRecords = new Set(gi.map((p) => p.split(":")[0]));
  if (giRecords.size !== gi.length) throw new Error("GI-lijst heeft een record dubbel: selectie deugt niet.");

  // Controle: geen enkel record in beide lijsten, geen dubbelen, niets met een dossier.
  const dubbel = sales.filter((r) => giRecords.has(r));
  if (dubbel.length) throw new Error(`Overlap sales/GI: ${dubbel.join(", ")}`);
  if (salesSet.size !== sales.length) throw new Error("Saleslijst heeft een record dubbel.");
  const alle = [...sales, ...giRecords].map(Number);
  const metDossier = !alle.length ? 0 : (
    await db.execute<{ n: number }>(sql`
      SELECT count(*)::int AS n FROM compliance.klant_dossier
      WHERE record IN (${sql.join(alle.map((r) => sql`${r}`), sql`, `)})`)
  ).rows[0].n;
  if (metDossier) throw new Error(`${metDossier} records hebben inmiddels al een dossier.`);

  fs.writeFileSync(`${MAP}/sales-records.txt`, sales.join(" "));
  fs.writeFileSync(`${MAP}/gi-paren.txt`, gi.join(" "));
  if (zonderSale.length) fs.writeFileSync(`${MAP}/sales-zonder-sale.txt`, zonderSale.join(" "));

  console.log(`\nKLAAR VOOR BATCH`);
  console.log(`  sales           ${String(sales.length).padStart(4)} gesprekken · ~EUR ${(sales.length * EUR_SALES).toFixed(2)} (x ${EUR_SALES})`);
  console.log(`  geen interesse  ${String(gi.length).padStart(4)} gesprekken · ~EUR ${(gi.length * EUR_GI).toFixed(2)} (x ${EUR_GI})`);
  console.log(`  samen           ${String(sales.length + gi.length).padStart(4)} gesprekken · ~EUR ${(sales.length * EUR_SALES + gi.length * EUR_GI).toFixed(2)}`);
  console.log(`  controle: 0 overlap · 0 dubbel · 0 met dossier`);
  console.log(`  lengte opdrachtregel sales: ${sales.join(" ").length} tekens (cmd.exe-grens 8191; klantanalyse-batch.ps1 splitst boven 700 records) · GI gaat via --bestand`);
  console.log(`\nLijsten: ${MAP}/sales-records.txt · ${MAP}/gi-paren.txt`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("✗", e?.message ?? e); process.exit(1); });
