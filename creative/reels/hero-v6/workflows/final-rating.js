export const meta = {
  name: 'naira-hero-final-rating',
  description: 'Four reviewers rate hero V1, V2 and V3 side by side; one auditor checks every claim and price in V3 against the live store',
  phases: [
    { title: 'Rate', detail: 'performance / creative / editor / customer, all three versions' },
    { title: 'Audit', detail: 'claims, prices and never-name rules in V3, checked live' },
  ],
}
const H = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/hero'
const V = n => `VIDEO ${n}: sheets ${H}/v${n}/sheet_1.jpg, sheet_2.jpg, sheet_3.jpg (frames every 0.5 s, labelled with time; the magenta lines mark the Reels safe zone y 270-1250); timeline ${H}/v${n}/timeline.md; audio report ${H}/v${n}/audio_report.txt.`
const CTX = `You are rating three successive versions of a 9:16 Meta Reels hero ad for Naira (Indian demi-fine jewellery). Brand rules, products, live stock and footage: ${H}/inventory.md. ${V(1)} ${V(2)} ${V(3)} V2 was built from the panel brief in ${H}/v1/critique_summary.txt and V3 from ${H}/v2/critique_summary.txt (read both: they say what each round set out to fix). Open the sheets with the Read tool (they are images). You cannot hear audio; use the timelines and audio reports. Be concrete and honest; do not inflate V3 because it is last. Do not write files.`
const RATE = {
  type: 'object',
  properties: {
    scores: { type: 'object', properties: { v1: { type: 'number' }, v2: { type: 'number' }, v3: { type: 'number' } }, required: ['v1', 'v2', 'v3'] },
    v2_fixed: { type: 'array', items: { type: 'string' } },
    v3_fixed: { type: 'array', items: { type: 'string' } },
    v3_still_missing: { type: 'array', items: { type: 'string' }, description: 'what V3 still lacks, most important first, with times' },
    anything_v3_lost: { type: 'array', items: { type: 'string' }, description: 'anything an earlier version did better' },
    verdict: { type: 'string', description: 'two sentences: which to run and why' },
  },
  required: ['scores', 'v2_fixed', 'v3_fixed', 'v3_still_missing', 'anything_v3_lost', 'verdict'],
}
const LENSES = [
  { key: 'performance', l: 'Lens: Meta performance-creative lead for Indian D2C jewellery. Past reels held only 4-7% to a quarter with 1.9-2.7% CTR and ROAS under 1 (break-even 2.1, AOV about Rs 1,712). Judge thumb-stop, 3-s hold, offer clarity on mute, the push to 2-3 pieces, proof, CTA, length.' },
  { key: 'creative', l: "Lens: the brand creative director who knows the owner's taste: elegant not tacky, sage/blush/ivory, Cormorant + Jost, radius 0, no AI look, little graphic clutter, soft sounds." },
  { key: 'editor', l: 'Lens: a master commercial editor. Judge rhythm, cut points against the voice, shot selection, text timing and legibility, safe zone, collisions with faces/pieces/hands, the end card and the sound plan.' },
  { key: 'customer', l: 'Lens: the target customer, a 24-32-year-old woman in Bengaluru or Delhi scrolling Reels at night who has never heard of Naira. Would you stop, understand, trust it, tap, buy two or three pieces?' },
]
phase('Rate')
const ratings = (await parallel(LENSES.map(L => () => agent(`${L.l}\n\n${CTX}`, { label: `rate:${L.key}`, phase: 'Rate', schema: RATE }).then(r => r && { ...r, lens: L.key })))).filter(Boolean)
phase('Audit')
const AUDIT = {
  type: 'object',
  properties: {
    checks: { type: 'array', items: { type: 'object', properties: { claim: { type: 'string' }, at: { type: 'string' }, source: { type: 'string' }, ok: { type: 'boolean' }, note: { type: 'string' } }, required: ['claim', 'at', 'source', 'ok', 'note'] } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['checks', 'blockers'],
}
const audit = await agent(`You are a claims auditor. Check EVERY on-screen and spoken claim, price, offer and name in VIDEO 3 (timeline ${H}/v3/timeline.md, sheets ${H}/v3/sheet_1.jpg..sheet_3.jpg, VO lines listed in the timeline; Nyra's lines are: "Any two, twenty percent off." "Any three, thirty." "Waterproof, tarnish-free," "Three-year plating assurance."; Riya: "Nobody told us demi-fine jewellery under 2500 would look like this." "This is Naira," "this bracelet is the one people stop you for." "You're welcome, but keep it between us."; Ananaya: "Someone actually asked me where this is from twice this week." "available at Naira with free delivery as well.") against the LIVE Shopify store (use the Shopify MCP tools via ToolSearch, read-only queries only: product titles, prices, compareAt, inventory, descriptions/Care text, options, and the BUY2/BUY3 discount codes and their percentages and minimums) and against the brand rules in ${H}/inventory.md (never-name items, low-stock pieces, no NAIRA10, "18K gold coating" never bare "18K gold", "assurance" vs "guarantee", COD never called free). Also confirm the bag maths: 799 + 1,199 + 1,199 = 3,197, less 30% = 2,237.90 shown as 2,238, and that 2,238 plus the 5% COD fee stays under 2,500. Mark each check ok true/false with the exact source. List anything that must change before spend as a blocker. Do not modify anything in the store.`, { label: 'audit:claims', phase: 'Audit', schema: AUDIT })
return { ratings, audit }