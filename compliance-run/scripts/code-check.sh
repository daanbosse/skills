#!/usr/bin/env bash
# Read-only, EUR 0. Onderdeel van de skill compliance-run.
# Beantwoordt twee vragen voordat er geld uitgaat:
#   1. Welk regelboek is op dit moment het beste (origin/main), en draait de werkmap dat ook?
#   2. Draait de compliance-keten in de werkmap exact de code van origin/main?
# Wijzigt niets: alleen `git fetch`, geen pull, stash of reset (andere chats werken in dezelfde map).
set -u
REPO="C:/Users/javim/Desktop/Executive_assistant/projects/ventasol/ventasol"
APP="$REPO/data-project/wecall-app"
TMP="${TMPDIR:-/tmp}/compliance-code-check.$$"
mkdir -p "$TMP"
STUK=0

git -C "$REPO" fetch -q origin main || { echo "[STUK] git fetch faalde"; exit 1; }
echo "=== Repo ==="
echo "  branch $(git -C "$REPO" branch --show-current) · werkmap $(git -C "$REPO" rev-list --count HEAD..origin/main) commits achter origin, $(git -C "$REPO" rev-list --count origin/main..HEAD) voor"

echo "=== Regelboek ==="
versie() { grep -o 'VERSIE_VOLGORDE: readonly string\[\] = \[.*\]' | grep -o '"v[0-9.]*"' | tail -1 | tr -d '"'; }
LOK=$(versie < "$APP/src/lib/compliance/rulebook-changes.ts")
ORI=$(git -C "$REPO" show origin/main:data-project/wecall-app/src/lib/compliance/rulebook-changes.ts | versie)
DOC=$(git -C "$REPO" show origin/main:data-project/wecall-ai/42-regelboek-v4.md 2>/dev/null \
  | grep -o -E '^## (10\.0 )?v[0-9]+\.[0-9]+' | grep -o -E 'v[0-9]+\.[0-9]+' | sort -t. -k1.2,1n -k2,2n | tail -1)
echo "  actief in werkmap: $LOK · actief op origin/main: $ORI · hoogste versiekop in 42-regelboek-v4.md: ${DOC:-?}"
[ "$LOK" = "$ORI" ] || { echo "  [STUK] werkmap draait een ander regelboek dan origin"; STUK=1; }
if [ -n "$DOC" ] && [ "$DOC" != "$ORI" ]; then
  echo "  [LET OP] het regelboekdocument noemt $DOC, de code staat op $ORI: klaargezet maar niet actief? Melden, niet zelf activeren."
fi
NIEUW=$(git -C "$REPO" ls-tree --name-only origin/main data-project/wecall-ai/ | grep -i -E 'regelboek-v(4\.[4-9]|[5-9])' || true)
[ -n "$NIEUW" ] && echo "  [LET OP] nieuwere regelboekdocumenten op origin: $NIEUW"

echo "=== Code van de compliance-keten ==="
cd "$APP" || exit 1
: > "$TMP/inputs.txt"
# Standaard de compliance-keten; andere runners kun je meegeven: code-check.sh scripts/a.ts scripts/b.ts
ENTRIES=("$@")
[ "${#ENTRIES[@]}" -eq 0 ] && ENTRIES=(scripts/corpus-compliance-run.ts scripts/compliance-scorer-batch-runner.ts)
echo "  ingangen: ${ENTRIES[*]}"
for s in "${ENTRIES[@]}"; do
  npx esbuild "$s" --bundle --platform=node --packages=external --metafile="$TMP/meta.json" \
    --outfile=NUL --log-level=error --tsconfig=scripts/tsconfig.json >/dev/null 2>&1 \
    || { echo "  [STUK] esbuild kon $s niet bundelen"; STUK=1; continue; }
  node -e "const m=require(process.argv[1]);console.log(Object.keys(m.inputs).join('\n'))" "$TMP/meta.json" >> "$TMP/inputs.txt"
done
sort -u "$TMP/inputs.txt" -o "$TMP/inputs.txt"
echo "  $(wc -l < "$TMP/inputs.txt") bestanden in de keten"
AFW=0
while IFS= read -r f; do
  p="data-project/wecall-app/$f"
  if ! git -C "$REPO" cat-file -e "origin/main:$p" 2>/dev/null; then
    echo "  [STUK] $f staat niet op origin/main (lokaal bestand in de keten)"; STUK=1; AFW=1; continue
  fi
  git -C "$REPO" diff --quiet origin/main -- "$p" && continue
  AFW=1
  # Alleen commentaar of witruimte anders? Dan onschuldig.
  echt=$(git -C "$REPO" diff -U0 origin/main -- "$p" | grep -E '^[+-]' | grep -v -E '^(\+\+\+|---)' \
    | grep -v -E '^[+-][[:space:]]*(//|\*|/\*|$)' | wc -l)
  weg=$(git -C "$REPO" diff -U0 origin/main -- "$p" | grep -E '^-' | grep -v -E '^---' \
    | grep -v -E '^-[[:space:]]*(//|\*|/\*|$)' | wc -l)
  if [ "$echt" -eq 0 ]; then echo "  [OK  ] $f wijkt af van origin, alleen commentaar"
  elif [ "$weg" -eq 0 ] && [[ "$f" == src/db/schema/* ]]; then
    # Alleen toevoegingen in een schemabestand (typisch: een nieuwe tabel van een andere chat).
    # Onschuldig als geen ander bestand in de keten de nieuwe exports gebruikt.
    namen=$(git -C "$REPO" diff -U0 origin/main -- "$p" | grep -o -E '^\+export const [A-Za-z0-9_]+' | awk '{print $3}')
    gebruikt=""
    for n in $namen; do
      while IFS= read -r g; do
        [ "$g" = "$f" ] && continue
        grep -q -w "$n" "$g" 2>/dev/null && gebruikt="$gebruikt $n($g)"
      done < "$TMP/inputs.txt"
    done
    if [ -z "$gebruikt" ]; then echo "  [OK  ] $f: alleen nieuwe definities (${namen//$'\n'/, }), niet gebruikt in de keten"
    else echo "  [STUK] $f: nieuwe definities die de keten gebruikt:$gebruikt"; STUK=1; fi
  else echo "  [STUK] $f wijkt af van origin: $echt regels code, $weg weg"; STUK=1
    git -C "$REPO" diff -U0 origin/main -- "$p" | grep -E '^[+-]' | grep -v -E '^(\+\+\+|---)' | head -12 | sed 's/^/           /'
  fi
done < "$TMP/inputs.txt"
[ "$AFW" -eq 0 ] && echo "  [OK  ] hele keten gelijk aan origin/main"
rm -rf "$TMP"

echo "=== Oordeel ==="
if [ "$STUK" -eq 0 ]; then echo "  CODE OK: de run draait de code en het regelboek van origin/main"
else echo "  NIET STARTEN: eerst de STUK-regels oplossen (melden aan Javi; niet zelf pullen of resetten)"; fi
exit "$STUK"
