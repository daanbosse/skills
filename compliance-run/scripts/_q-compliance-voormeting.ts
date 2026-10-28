/* eslint-disable no-console -- CLI: alleen tellingen en record-ID's, geen transcript-inhoud of PII */
/**
 * VOORMETING voor de wekelijkse compliance-batch (skill `compliance-run`). Read-only, EUR 0.
 *
 * Bron: skills/compliance-run/scripts/. De skill kopieert dit bestand naar wecall-app/scripts/
 * en draait het vanuit de app-map (anders vindt tsx drizzle-orm en de @/-paden niet).
 *
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/_q-compliance-voormeting.ts [--van YYYY-MM-DD] [--tot YYYY-MM-DD]
 *
 * Standaardvenster: de laatste 35 saledagen t/m gisteren (Amsterdam). Ruim genoeg voor een
 * overgeslagen week en voor nakomers (transcript pas op D+4 compleet); er wordt toch alleen
 * gescoord wat nog NOOIT beoordeeld is.
 *
 * Telt met DEZELFDE definities als corpus-compliance-run.ts (doelrecord = record met een
 * salesgesprek, rol 'sale' + is_sale, in het venster, met transcript; nieuw/klaar/ouder op
 * compliance.ai_evaluation source 'ai_claude_v1'; materiaalpoort via splitsOpMateriaal). De
 * DRY van dat script blijft de autoriteit voor selectie en raming; dit script legt uit wat erin
 * zit en vangt wat er stil buiten valt.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { BESTE_SOURCE } from "@/lib/compliance/pipeline-kwaliteit";
import { HUIDIG_REGELBOEK } from "@/lib/compliance/rulebook-changes";
import { RULEBOOK_VERSION } from "@/lib/compliance/compliance-scorer";
import { splitsOpMateriaal } from "@/lib/compliance/materiaal-poort";
import { lopendeComplianceRuns } from "@/lib/compliance/dagelijkse-run";

const arg = (f: string): string | null => {
  const i = process.argv.indexOf(f);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : null;
};
const datum = (s: string | null, naam: string): string | null => {
  if (s == null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`${naam} moet YYYY-MM-DD zijn`);
  return s;
};
const n = (x: unknown) => Number(x ?? 0);
const pad = (x: unknown, w: number) => String(x).padStart(w);
const lijstSql = (ids: number[]) => sql.join(ids.map((r) => sql`${r}`), sql`, `);

async function main() {
  await db.execute(sql`SET statement_timeout = '600s'`);
  const d = (await db.execute<{ vandaag: string; gisteren: string; min35: string }>(sql`
    SELECT (now() AT TIME ZONE 'Europe/Amsterdam')::date::text AS vandaag,
           ((now() AT TIME ZONE 'Europe/Amsterdam')::date - 1)::text AS gisteren,
           ((now() AT TIME ZONE 'Europe/Amsterdam')::date - 35)::text AS min35`)).rows[0]!;
  const VAN = datum(arg("--van"), "--van") ?? d.min35;
  const TOT = datum(arg("--tot"), "--tot") ?? d.gisteren;

  // ── 1. Regelboek ──────────────────────────────────────────────────────────────
  console.log(`\n=== 1. Regelboek ===`);
  console.log(`  HUIDIG_REGELBOEK (rulebook-changes.ts) = ${HUIDIG_REGELBOEK} · RULEBOOK_VERSION (scorer) = ${RULEBOOK_VERSION}` +
    (HUIDIG_REGELBOEK === RULEBOOK_VERSION ? "  [OK]" : "  [STUK: lopen uit de pas]"));
  const versies = (await db.execute<{ v: string; n: number; laatst: string }>(sql`
    SELECT rulebook_version AS v, count(DISTINCT record)::int AS n, max(created_at)::date::text AS laatst
    FROM compliance.ai_evaluation WHERE source='ai_claude_v1' AND created_at > now() - interval '60 days'
    GROUP BY 1 ORDER BY 3 DESC`)).rows;
  console.log(`  gebruikt in de laatste 60 dagen: ${versies.map((v) => `${v.v} (${v.n} gesprekken, laatst ${v.laatst})`).join(" · ") || "—"}`);

  // ── 2. Vorige compliance-runs + open runs ─────────────────────────────────────
  console.log(`\n=== 2. Laatste compliance-runs (app.ai_run) ===`);
  const runs = (await db.execute<{
    id: number; gestart: string; gestart_iso: string; klaar: string | null; status: string | null; n_items: number; n_ok: number | null;
    n_failed: number | null; cost_eur: string | null; note: string | null; records: unknown;
  }>(sql`
    SELECT id, to_char(started_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS gestart, started_at::text AS gestart_iso,
           to_char(finished_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS klaar, status,
           n_items, n_ok, n_failed, cost_eur::text, note, config->'records' AS records
    FROM app.ai_run WHERE kind='compliance' ORDER BY started_at DESC LIMIT 5`)).rows;
  for (const r of runs) {
    const recs = Array.isArray(r.records) ? (r.records as unknown[]).map(Number).filter(Number.isFinite) : [];
    let bereik = "";
    if (recs.length) {
      // Per record de saledag die het dichtst bij de run ligt (een record kan meerdere sales hebben).
      const b = (await db.execute<{ lo: string | null; hi: string | null }>(sql`
        WITH per AS (
          SELECT record_id, max(contact_datetime::date) FILTER (WHERE contact_datetime < ${r.gestart_iso}::timestamptz) AS dag
          FROM corpus.leg WHERE is_sale AND rol='sale' AND record_id IN (${lijstSql(recs)}) GROUP BY 1)
        SELECT min(dag)::text AS lo, max(dag)::text AS hi FROM per`)).rows[0];
      bereik = b?.lo ? ` · saledagen ${b.lo} t/m ${b.hi}` : "";
    }
    const perGesprek = n(r.n_ok) > 0 && r.cost_eur ? ` · EUR ${(Number(r.cost_eur) / n(r.n_ok)).toFixed(3)}/gesprek` : "";
    console.log(`  #${r.id} ${r.gestart} → ${r.klaar ?? "NIET AFGEROND"} · ${r.status ?? "?"} · ${n(r.n_ok)}/${n(r.n_items)} ok, ${n(r.n_failed)} fout` +
      ` · EUR ${r.cost_eur ? Number(r.cost_eur).toFixed(2) : "?"}${perGesprek}${bereik} · ${(r.note ?? "").slice(0, 60)}`);
  }
  const open = (await db.execute<{ id: number; kind: string; gestart: string; n_items: number; phase: string | null }>(sql`
    SELECT id, kind, to_char(started_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS gestart, n_items, phase
    FROM app.ai_run WHERE finished_at IS NULL ORDER BY started_at`)).rows;
  console.log(`  open AI-runs (alle soorten, geen eindtijd): ${open.length ? open.map((o) => `#${o.id} ${o.kind} ${o.gestart} ${o.n_items} items fase ${o.phase ?? "?"}`).join(" · ") : "geen"}`);
  const lopend = await lopendeComplianceRuns();
  const inDeLucht = new Set<number>(lopend.flatMap((l) => l.records ?? []));
  console.log(`  open COMPLIANCE-runs: ${lopend.length}` + (lopend.length ? "  [STUK: poort 1 weigert; eerst uitzoeken, er kan al betaald zijn]" : "  [OK]"));

  // ── 3. Per saledag: wat is er, wat is klaar, wat gaat mee ─────────────────────
  const doel = (await db.execute<{ record: number; dag: string }>(sql`
    SELECT l.record_id::int AS record, min(l.contact_datetime::date)::text AS dag
    FROM corpus.leg l JOIN corpus.transcript t ON t.record_id=l.record_id AND t.hid=l.hid
    WHERE l.is_sale AND l.rol='sale' AND l.contact_datetime::date BETWEEN ${VAN}::date AND ${TOT}::date
    GROUP BY 1`)).rows.map((r) => ({ record: Number(r.record), dag: r.dag }));
  const ids = doel.map((r) => r.record);
  const soortVan = new Map<number, "klaar" | "ouder" | "nieuw">();
  if (ids.length) {
    const ev = (await db.execute<{ record: number; versies: string[] }>(sql`
      SELECT record::int AS record, array_agg(DISTINCT rulebook_version) AS versies
      FROM compliance.ai_evaluation WHERE source='ai_claude_v1' AND record IN (${lijstSql(ids)}) GROUP BY 1`)).rows;
    const evMap = new Map(ev.map((e) => [Number(e.record), e.versies]));
    for (const id of ids) {
      const v = evMap.get(id);
      soortVan.set(id, !v ? "nieuw" : v.includes(RULEBOOK_VERSION) ? "klaar" : "ouder");
    }
  }
  const nieuwAlle = ids.filter((r) => soortVan.get(r) === "nieuw");
  const nieuwIds = nieuwAlle.filter((r) => !inDeLucht.has(r));
  const { scoren, geweigerd } = nieuwIds.length ? await splitsOpMateriaal(nieuwIds) : { scoren: [] as number[], geweigerd: [] as Array<{ record: number }> };
  const teScoren = new Set(scoren.map(Number));
  const weigert = new Set(geweigerd.map((g) => Number(g.record)));

  console.log(`\n=== 3. Per saledag, venster ${VAN} t/m ${TOT} (definitie corpus-compliance-run.ts) ===`);
  console.log(`dag         dg   doel  al ${RULEBOOK_VERSION.padEnd(5)} ouder  nieuw  poort-nee  TE SCOREN`);
  const dagen = [...new Set(doel.map((r) => r.dag))].sort();
  const dagVan = new Map(doel.map((r) => [r.record, r.dag]));
  const tot = { doel: 0, klaar: 0, ouder: 0, nieuw: 0, nee: 0, ja: 0 };
  for (const dag of dagen) {
    const op = doel.filter((r) => r.dag === dag).map((r) => r.record);
    const k = op.filter((r) => soortVan.get(r) === "klaar").length;
    const o = op.filter((r) => soortVan.get(r) === "ouder").length;
    const nw = op.filter((r) => soortVan.get(r) === "nieuw").length;
    const nee = op.filter((r) => weigert.has(r)).length;
    const ja = op.filter((r) => teScoren.has(r)).length;
    tot.doel += op.length; tot.klaar += k; tot.ouder += o; tot.nieuw += nw; tot.nee += nee; tot.ja += ja;
    const dg = ["zo", "ma", "di", "wo", "do", "vr", "za"][new Date(`${dag}T12:00:00Z`).getUTCDay()];
    console.log(`${dag}  ${dg}  ${pad(op.length, 5)}  ${pad(k, 7)}  ${pad(o, 5)}  ${pad(nw, 5)}  ${pad(nee, 9)}  ${pad(ja, 9)}`);
  }
  console.log(`totaal      ${pad(tot.doel, 6)}  ${pad(tot.klaar, 7)}  ${pad(tot.ouder, 5)}  ${pad(tot.nieuw, 5)}  ${pad(tot.nee, 9)}  ${pad(tot.ja, 9)}`);
  if (inDeLucht.size) console.log(`  (${nieuwAlle.length - nieuwIds.length} nieuw zitten al in een open run en tellen hierboven niet als te scoren)`);
  console.log(`  ouder = oordeel op een oudere regelboekversie: gaat NIET mee zonder --herscore (fixes alleen vooruit).`);
  const scoreDagen = dagen.filter((dag) => doel.some((r) => r.dag === dag && teScoren.has(r.record)));
  console.log(`  te scoren valt op saledagen: ${scoreDagen.length ? `${scoreDagen[0]} t/m ${scoreDagen[scoreDagen.length - 1]}` : "—"}`);

  // 3b. "ouder" waarbij het oude oordeel bij een EERDERE sale op hetzelfde record hoort. Compliance werkt per
  // record: de nieuwe sale wordt dan nooit gescoord, en --herscore helpt niet (compliance.transcript bevat
  // nog de legs van de eerste sale; herbruggen verandert het bewijs onder het oude oordeel). Besluit Javi.
  const ouderIds = ids.filter((r) => soortVan.get(r) === "ouder");
  if (ouderIds.length) {
    const tweede = (await db.execute<{ record: number; nieuwe_sale: string; oordeel_dag: string | null }>(sql`
      WITH s AS (
        SELECT record_id AS record, max(contact_datetime::date) AS nieuwe_sale FROM corpus.leg
        WHERE is_sale AND rol='sale' AND record_id IN (${lijstSql(ouderIds)})
          AND contact_datetime::date BETWEEN ${VAN}::date AND ${TOT}::date GROUP BY 1),
      e AS (
        SELECT record, max(call_date)::date AS oordeel_dag FROM compliance.ai_evaluation
        WHERE source='ai_claude_v1' AND record IN (${lijstSql(ouderIds)}) GROUP BY 1)
      SELECT s.record::int AS record, s.nieuwe_sale::text, e.oordeel_dag::text
      FROM s JOIN e ON e.record=s.record WHERE e.oordeel_dag < s.nieuwe_sale - 3 ORDER BY s.nieuwe_sale`)).rows;
    console.log(`\n  3b. Tweede sale op een record dat al een oordeel heeft van een eerdere sale: ${tweede.length}` +
      (tweede.length ? `  [MELDEN, niet zelf oplossen]` : `  [OK]`));
    for (const t of tweede) console.log(`      #${t.record} nieuwe sale ${t.nieuwe_sale} · oordeel hoort bij ${t.oordeel_dag}`);
  }

  // ── 4. Kruiscontrole: wat ligt in de compliance-laag zonder oordeel maar valt buiten de selectie ──
  console.log(`\n=== 4. Kruiscontrole: compliance.transcript zonder oordeel (gespreksdatum in venster), niet in de selectie ===`);
  const laag = (await db.execute<{ record: number }>(sql`
    WITH t AS (
      SELECT t.record,
        COALESCE((SELECT max(tri.call_date) FROM compliance.transcript_run_item tri WHERE tri.record=t.record),
                 (SELECT max(l.contact_datetime) FROM corpus.leg l WHERE l.record_id=t.record))::date AS dag
      FROM compliance.transcript t WHERE t.source = ${BESTE_SOURCE})
    SELECT t.record::int AS record FROM t
    WHERE t.dag BETWEEN ${VAN}::date AND ${TOT}::date
      AND NOT EXISTS (SELECT 1 FROM compliance.ai_evaluation ae WHERE ae.record=t.record AND ae.source='ai_claude_v1')`)).rows.map((r) => Number(r.record));
  const doelSet = new Set(ids);
  const buiten = laag.filter((r) => !doelSet.has(r));
  if (!buiten.length) console.log(`  geen  [OK]`);
  else {
    const legs = (await db.execute<{ record: number; heeft_sale: boolean; sale_buiten: boolean; sale_zonder_tr: boolean }>(sql`
      SELECT l.record_id::int AS record,
        bool_or(l.is_sale AND l.rol='sale') AS heeft_sale,
        bool_or(l.is_sale AND l.rol='sale' AND l.contact_datetime::date NOT BETWEEN ${VAN}::date AND ${TOT}::date) AS sale_buiten,
        bool_or(l.is_sale AND l.rol='sale' AND NOT EXISTS (SELECT 1 FROM corpus.transcript t WHERE t.record_id=l.record_id AND t.hid=l.hid)) AS sale_zonder_tr
      FROM corpus.leg l WHERE l.record_id IN (${lijstSql(buiten)}) GROUP BY 1`)).rows;
    const geenSale = legs.filter((l) => !l.heeft_sale).length + (buiten.length - legs.length);
    const saleBuiten = legs.filter((l) => l.heeft_sale && l.sale_buiten && !l.sale_zonder_tr);
    const zonderTr = legs.filter((l) => l.heeft_sale && l.sale_zonder_tr);
    console.log(`  ${buiten.length} totaal · ${geenSale} geen salesgesprek (werving/geen interesse/overig: hoort er niet in)` +
      ` · ${saleBuiten.length} salesgesprek buiten het venster · ${zonderTr.length} salesgesprek ZONDER transcript`);
    if (zonderTr.length) console.log(`  [LET OP] zonder transcript, gaan nu niet mee: ${zonderTr.slice(0, 20).map((l) => `#${l.record}`).join(" ")}`);
    if (saleBuiten.length) console.log(`  [LET OP] sale buiten venster: ${saleBuiten.slice(0, 20).map((l) => `#${l.record}`).join(" ")}`);
  }

  // ── 5. Nakomers: legs van doelrecords die nog op audio/transcript wachten ─────
  console.log(`\n=== 5. Nakomers: sale- en wervingslegs van de doelrecords zonder transcript ===`);
  const wacht = ids.length ? (await db.execute<{ record: number; rol: string; audio: string | null; tr: string | null }>(sql`
    SELECT l.record_id::int AS record, l.rol, l.audio_status AS audio, l.transcribe_status AS tr
    FROM corpus.leg l
    WHERE l.record_id IN (${lijstSql(ids)}) AND l.rol IN ('sale','werving')
      AND NOT EXISTS (SELECT 1 FROM corpus.transcript t WHERE t.record_id=l.record_id AND t.hid=l.hid)`)).rows : [];
  if (!wacht.length) console.log(`  geen: alles van deze records is uitgeschreven  [OK]`);
  else {
    const per = new Map<string, number>();
    for (const w of wacht) {
      const k = `${dagVan.get(Number(w.record))} ${w.rol} audio=${w.audio ?? "-"} transcript=${w.tr ?? "-"}`;
      per.set(k, (per.get(k) ?? 0) + 1);
    }
    for (const [k, v] of [...per.entries()].sort()) console.log(`  ${k}: ${v}`);
    const raakt = new Set(wacht.map((w) => Number(w.record)));
    console.log(`  ${raakt.size} records: ${[...raakt].filter((r) => teScoren.has(r)).length} zouden NU al gescoord worden met een onvolledig gesprek,` +
      ` ${[...raakt].filter((r) => weigert.has(r)).length} worden door de poort tegengehouden (komen vanzelf in een volgende run).`);
  }

  // ── 6. Gat vóór het venster ───────────────────────────────────────────────────
  console.log(`\n=== 6. Nooit beoordeelde sales in de 90 dagen VOOR het venster (gaan niet mee) ===`);
  const voor = (await db.execute<{ record: number; week: string }>(sql`
    SELECT l.record_id::int AS record, to_char(date_trunc('week', min(l.contact_datetime)), 'YYYY-MM-DD') AS week
    FROM corpus.leg l JOIN corpus.transcript t ON t.record_id=l.record_id AND t.hid=l.hid
    WHERE l.is_sale AND l.rol='sale'
      AND l.contact_datetime::date >= ${VAN}::date - 90 AND l.contact_datetime::date < ${VAN}::date
      AND NOT EXISTS (SELECT 1 FROM compliance.ai_evaluation ae WHERE ae.record=l.record_id AND ae.source='ai_claude_v1')
    GROUP BY 1`)).rows;
  if (!voor.length) console.log(`  geen  [OK]`);
  else {
    const { scoren: voorJa } = await splitsOpMateriaal(voor.map((r) => Number(r.record)));
    const jaSet = new Set(voorJa.map(Number));
    const perWeek = new Map<string, [number, number]>();
    for (const r of voor) {
      const p = perWeek.get(r.week) ?? [0, 0];
      p[0]++; if (jaSet.has(Number(r.record))) p[1]++;
      perWeek.set(r.week, p);
    }
    console.log(`  week vanaf   nooit beoordeeld   waarvan poort-ja`);
    for (const [w, [a, b]] of [...perWeek.entries()].sort()) console.log(`  ${w}   ${pad(a, 16)}   ${pad(b, 16)}`);
    console.log(`  poort-ja hier = ${voorJa.length}. Is dat meer dan een handvol: melden, NIET stil meenemen (eigen go, eigen bedrag).`);
  }

  // ── 7. Samenvatting voor de go ────────────────────────────────────────────────
  console.log(`\n=== 7. Samenvatting ===`);
  console.log(`  regelboek ${RULEBOOK_VERSION} · te scoren ${tot.ja} · poort tegengehouden ${tot.nee} · ouder (niet mee) ${tot.ouder} · al klaar ${tot.klaar}`);
  console.log(`  DRY ter controle (moet hetzelfde aantal geven):`);
  console.log(`    npx tsx --tsconfig scripts/tsconfig.json scripts/corpus-compliance-run.ts --van ${VAN} --tot ${TOT}`);
  process.exit(0);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
