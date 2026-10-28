/* eslint-disable no-console -- CLI: alleen tellingen en record-ID's, geen klantgegevens */
/**
 * NAMETING na de wekelijkse klantanalyse-batch (skill `klantanalyse-run`). Read-only, EUR 0.
 *
 * Bron: skills/klantanalyse-run/scripts/. Kopiëren naar wecall-app/scripts/ en vanuit de app-map draaien:
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/_q-klantanalyse-nameting.ts --map C:/tmp/wecall-klantanalyse-DDMM
 *
 * Leest de lijsten die de selectie schreef (sales-records*.txt, gi-paren.txt) en controleert per stroom of
 * elk record een dossier heeft, met situatie en klantuitspraken, plus het lead-oordeel en de controle.
 * De kosten komen uit app.ai_run (runners klant-dossier-batch en lev-geen-interesse-batch) vanaf het
 * moment dat de map is aangemaakt.
 */
import fs from "node:fs";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";

const arg = (f: string): string | null => {
  const i = process.argv.indexOf(f);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
};

async function stroom(naam: string, herkomst: string, records: number[]) {
  if (!records.length) { console.log(`\n${naam}: geen lijst`); return; }
  const lijst = sql.join(records.map((r) => sql`${r}`), sql`, `);
  const rijen = (await db.execute<{
    record: number; herkomst: string | null; lead: string | null; situatie: boolean; klant_zei: boolean;
    ok: boolean | null; fouten: string[] | null;
  }>(sql`
    SELECT d.record::int AS record, d.herkomst, d.dossier->>'lead' AS lead,
      COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(d.dossier->'situatie') = 'array' THEN d.dossier->'situatie' END), 0) > 0 AS situatie,
      COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(d.dossier->'klantZei') = 'array' THEN d.dossier->'klantZei' END), 0) > 0 AS klant_zei,
      (d.dossier->'controle'->>'ok')::boolean AS ok,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(d.dossier->'controle'->'fouten', '[]'::jsonb))) AS fouten
    FROM compliance.klant_dossier d WHERE d.record IN (${lijst})`)).rows;
  const met = new Set(rijen.map((r) => Number(r.record)));
  const ontbreekt = records.filter((r) => !met.has(r));
  const andereHerkomst = rijen.filter((r) => r.herkomst !== herkomst);
  const tel = (f: (r: (typeof rijen)[number]) => string) => {
    const m = new Map<string, number>();
    for (const r of rijen) m.set(f(r), (m.get(f(r)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ");
  };
  console.log(`\n${naam} (${herkomst}): ${rijen.length} van ${records.length} met dossier` +
    (ontbreekt.length ? `  [STUK: ${ontbreekt.length} zonder: ${ontbreekt.slice(0, 15).map((r) => `#${r}`).join(" ")}]` : "  [OK]"));
  if (andereHerkomst.length) console.log(`  [LET OP] ${andereHerkomst.length} met een andere herkomst (${tel((r) => r.herkomst ?? "leeg")}): een andere stroom schreef dit record`);
  console.log(`  met situatie: ${rijen.filter((r) => r.situatie).length} · met klantuitspraken: ${rijen.filter((r) => r.klant_zei).length}`);
  console.log(`  lead-oordeel: ${tel((r) => r.lead ?? "leeg")}`);
  const af = rijen.filter((r) => r.ok === false);
  console.log(`  controle: ${rijen.filter((r) => r.ok === true).length} goed · ${af.length} afgekeurd · ${rijen.filter((r) => r.ok == null).length} zonder controle`);
  if (af.length) {
    const reden = new Map<string, number>();
    for (const r of af) for (const f of r.fouten ?? []) { const k = f.slice(0, 70); reden.set(k, (reden.get(k) ?? 0) + 1); }
    for (const [k, v] of [...reden.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log(`    ${String(v).padStart(4)}  ${k}`);
  }
}

async function main() {
  const map = arg("--map");
  if (!map || !fs.existsSync(map)) throw new Error("geef --map met de runmap (C:/tmp/wecall-klantanalyse-DDMM)");
  await db.execute(sql`SET statement_timeout = '300s'`);
  const lees = (f: string) => fs.readFileSync(path.join(map, f), "utf8").split(/\s+/).filter(Boolean);
  const salesBestanden = fs.readdirSync(map).filter((f) => /^sales-records(-\d+)?\.txt$/.test(f));
  const sales = [...new Set(salesBestanden.flatMap(lees).map(Number))];
  const gi = fs.existsSync(path.join(map, "gi-paren.txt")) ? lees("gi-paren.txt").map((p) => Number(p.split(":")[0])) : [];

  const sinds = fs.statSync(map).birthtime.toISOString();
  const runs = (await db.execute<{ id: number; triggered_by: string; gestart: string; klaar: string | null; n_items: number; n_ok: number | null; n_failed: number | null; eur: string | null }>(sql`
    SELECT id, triggered_by, to_char(started_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS gestart,
      to_char(finished_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS klaar, n_items, n_ok, n_failed, cost_eur::text AS eur
    FROM app.ai_run
    WHERE kind='klant' AND triggered_by IN ('runner:klant-dossier-batch','runner:lev-geen-interesse-batch')
      AND started_at >= ${sinds}::timestamptz ORDER BY started_at`)).rows;
  console.log(`Runs sinds ${sinds.slice(0, 16)} (aanmaak van de map):`);
  let totaal = 0;
  for (const r of runs) {
    totaal += Number(r.eur ?? 0);
    console.log(`  #${r.id} ${r.triggered_by.replace("runner:", "")} ${r.gestart} → ${r.klaar ?? "NIET AFGEROND"} · ${r.n_ok ?? 0}/${r.n_items} ok, ${r.n_failed ?? 0} fout · EUR ${Number(r.eur ?? 0).toFixed(2)}` +
      (r.n_ok ? ` (EUR ${(Number(r.eur) / r.n_ok).toFixed(4)}/gesprek)` : ""));
  }
  console.log(`  samen EUR ${totaal.toFixed(2)}`);

  await stroom("SALES", "lev-sale", sales);
  await stroom("GEEN INTERESSE", "lev-geen-interesse", gi);
  console.log(`\nLeads worden NOOIT automatisch doorgezet.`);
  process.exit(0);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
