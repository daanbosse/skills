/* eslint-disable no-console -- CLI: alleen tellingen en record-ID's, geen transcript-inhoud of PII */
/**
 * NAMETING na een compliance-batch (skill `compliance-run`). Read-only, EUR 0.
 *
 * Bron: skills/compliance-run/scripts/. Kopiëren naar wecall-app/scripts/ en vanuit de app-map draaien:
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/_q-compliance-nameting.ts <ai_run_id>
 *
 * Controleert of alles uit de run in compliance.ai_evaluation staat op het huidige regelboek, met
 * 32 criteriumscores per gesprek, en geeft de cijfers voor het RUNS.md-blok.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { RULEBOOK_VERSION, VERWACHT_CRITERIA } from "@/lib/compliance/compliance-scorer";

async function main() {
  const id = Number(process.argv[2]);
  if (!Number.isFinite(id) || id <= 0) throw new Error("geef het ai_run-id mee");
  await db.execute(sql`SET statement_timeout = '300s'`);
  const run = (await db.execute<{
    status: string | null; phase: string | null; n_items: number; n_ok: number | null; n_failed: number | null;
    cost_eur: string | null; gestart: string; klaar: string | null; duur_min: number | null; records: unknown; started_at: string;
  }>(sql`
    SELECT status, phase, n_items, n_ok, n_failed, cost_eur::text,
      to_char(started_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS gestart,
      to_char(finished_at AT TIME ZONE 'Europe/Amsterdam','DD-MM HH24:MI') AS klaar,
      round(duration_sec / 60.0)::int AS duur_min, config->'records' AS records, started_at::text AS started_at
    FROM app.ai_run WHERE id = ${id} AND kind = 'compliance'`)).rows[0];
  if (!run) throw new Error(`ai_run ${id} bestaat niet of is geen compliance-run`);
  const recs = Array.isArray(run.records) ? (run.records as unknown[]).map(Number).filter(Number.isFinite) : [];
  const kosten = run.cost_eur ? Number(run.cost_eur) : null;
  console.log(`\nai_run ${id} · ${run.status} (${run.phase ?? "-"}) · ${run.gestart} → ${run.klaar ?? "NIET AFGEROND"}` +
    (run.duur_min != null ? ` (${run.duur_min} min)` : "") +
    ` · ${run.n_ok ?? 0}/${run.n_items} ok, ${run.n_failed ?? 0} fout · EUR ${kosten?.toFixed(2) ?? "?"}` +
    (kosten && run.n_ok ? ` = EUR ${(kosten / run.n_ok).toFixed(3)}/gesprek` : ""));
  if (!recs.length) { console.log("  geen recordlijst in config; nameting per record niet mogelijk"); process.exit(0); }
  const lijst = sql.join(recs.map((r) => sql`${r}`), sql`, `);

  const ev = (await db.execute<{
    record: number; call_date: string | null; supplier: string | null; advisor: string | null;
    verdict: string | null; ernstig: boolean | null; n_crit: number; vers: boolean;
  }>(sql`
    SELECT ae.record::int AS record, ae.call_date::date::text AS call_date, ae.supplier, ae.advisor,
      ae.ai_gesprek_verdict AS verdict, ae.ai_ernstige_fout AS ernstig,
      (SELECT count(*)::int FROM compliance.ai_criterion_score cs WHERE cs.ai_evaluation_id = ae.id) AS n_crit,
      ae.created_at >= ${run.started_at}::timestamptz AS vers
    FROM compliance.ai_evaluation ae
    WHERE ae.source = 'ai_claude_v1' AND ae.rulebook_version = ${RULEBOOK_VERSION} AND ae.record IN (${lijst})`)).rows;

  const metOordeel = new Set(ev.map((e) => Number(e.record)));
  const ontbreekt = recs.filter((r) => !metOordeel.has(r));
  const crit = ev.reduce((s, e) => s + Number(e.n_crit), 0);
  const nietVolledig = ev.filter((e) => Number(e.n_crit) !== VERWACHT_CRITERIA);
  const tel = <K extends string>(f: (e: (typeof ev)[number]) => K) => {
    const m = new Map<K, number>();
    for (const e of ev) m.set(f(e), (m.get(f(e)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ");
  };
  const ernstig = ev.filter((e) => e.ernstig).length;

  console.log(`\n  in ai_evaluation op ${RULEBOOK_VERSION}: ${ev.length} van ${recs.length} records` +
    (ontbreekt.length ? `  [STUK: ${ontbreekt.length} ontbreken: ${ontbreekt.slice(0, 15).map((r) => `#${r}`).join(" ")}]` : "  [OK]"));
  console.log(`  waarvan in deze run geschreven: ${ev.filter((e) => e.vers).length}`);
  console.log(`  criteriumscores: ${crit} (verwacht ${ev.length} x ${VERWACHT_CRITERIA} = ${ev.length * VERWACHT_CRITERIA})` +
    (nietVolledig.length ? `  [LET OP: ${nietVolledig.length} gesprekken niet ${VERWACHT_CRITERIA}]` : "  [OK]"));
  console.log(`  per gespreksdag: ${tel((e) => (e.call_date ?? "leeg") as string)}`);
  console.log(`  leverancier: ${tel((e) => (e.supplier ?? "LEEG") as string)}`);
  console.log(`  zonder adviseur: ${ev.filter((e) => !e.advisor).length}`);
  console.log(`  gespreksoordeel AI: ${tel((e) => (e.verdict ?? "leeg") as string)}`);
  console.log(`  ernstige fout: ${ernstig} van ${ev.length} (${ev.length ? Math.round((100 * ernstig) / ev.length) : 0}%)`);
  process.exit(0);
}
main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
