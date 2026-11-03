export const meta = {
  name: 'naira-hero-concepts',
  description: 'Four directors write competing hero-ad scripts from the full Naira footage library; three judges score; one synthesizes V1',
  phases: [
    { title: 'Concepts', detail: '4 directors, 4 angles' },
    { title: 'Judge', detail: 'performance / creative director / editor-producer' },
    { title: 'Synthesize', detail: 'V1 script with exact shots' },
  ],
}

const H = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/hero'
const BRIEF = `You are a senior ad director/editor for Naira, an Indian demi-fine jewellery brand. Read ${H}/inventory.md fully first, then LOOK at the contact sheets in ${H}/sheets/ (use the Read tool on each .jpg: kinn_1.jpg, kinn_2.jpg, kinn_3.jpg, src_riya4k.jpg, src_pankti.jpg, src_grwm.jpg, src_ananaya_ring.jpg, src_pearl_creator.jpg, src_owner_edit_kinn.jpg, ai_hoops.jpg, ai_huggies.jpg, statics.jpg). Every shot you specify MUST exist: name the source, clip id and in-time in seconds exactly as in the inventory or as read off the sheets' time labels. Every creator line you use must be quoted exactly with its source times. Respect every hard rule (claims, never-name items, palette, elegance, no AI look). The ad is a 9:16 Meta Reels paid ad, 24-34 s, that must stop the scroll in frame 1, prove value fast, make buying 2-3 pieces irresistible, and feel premium. Do not write any files; return your answer as the structured output.`

const CONCEPT = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    big_idea: { type: 'string', description: 'the one idea in 2-3 sentences' },
    length_s: { type: 'number' },
    beats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          t0: { type: 'number' }, t1: { type: 'number' },
          picture: { type: 'string', description: 'source + clip + in-time(s) + what we see; may be a still or graphic plate' },
          sound: { type: 'string', description: 'creator line (exact words + source times) / new VO line / music moment / sfx' },
          on_screen: { type: 'string', description: 'exact text and graphics on screen, with placement' },
        },
        required: ['t0', 't1', 'picture', 'sound', 'on_screen'],
      },
    },
    new_vo_lines: { type: 'array', items: { type: 'string' } },
    end_card: { type: 'string' },
    music: { type: 'string' },
    why_it_wins: { type: 'string' },
    risks: { type: 'string' },
  },
  required: ['title', 'big_idea', 'length_s', 'beats', 'new_vo_lines', 'end_card', 'music', 'why_it_wins', 'risks'],
}

const ANGLES = [
  { key: 'question', a: 'ANGLE "THE QUESTION": social proof at scale. Every woman in our footage gets asked the same thing - where is it from? Unite Ananaya, Riya, the pearl creator (voice only for hook-type lines; do not push pearls), Pankti and Sonal (Kinn editorial) around that one question and its answer: Naira. Use DM/notification language sparingly and elegantly.' },
  { key: 'nobodytold', a: 'ANGLE "NOBODY TOLD US": price disbelief. Riya\'s line "Nobody told us demi-fine jewellery under 2500 would look like this" is the spine. Make the viewer feel each piece looks 10x its price, reveal real prices crisply across creators, and land the bag maths (BUY 2 20% / BUY 3 30%).' },
  { key: 'onebox', a: 'ANGLE "ONE BOX": the blush Naira box is the connective device. Riya and Pankti both open the same blush box (ring, hoops, chain, huggies); the packaging stills exist. Match-cut box to box, woman to woman, piece to piece; gifting and ritual; elegant, tactile, premium.' },
  { key: 'editorial', a: 'ANGLE "EDITORIAL FILM": the Kinn Films shoot of Sonal is the most cinematic footage; build a luxury fashion-film spine with it and intercut the creators as the real women who wear Naira. Minimal type, a poetic but specific new VO, beat-cut; still lands price, offer and CTA.' },
]

phase('Concepts')
const concepts = (await parallel(ANGLES.map(g => () =>
  agent(`${BRIEF}\n\n${g.a}\n\nWrite the complete script: beat by beat with exact timings, picture, sound and on-screen text. Be ambitious and specific - this should be the best ad this brand has ever run.`,
    { label: `concept:${g.key}`, phase: 'Concepts', schema: CONCEPT })
))).map((c, i) => c && { ...c, key: ANGLES[i].key }).filter(Boolean)
log(`${concepts.length} concepts`)

const JUDGE = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: { key: { type: 'string' }, hook: { type: 'number' }, hold: { type: 'number' }, product_clarity: { type: 'number' }, offer_aov: { type: 'number' }, brand_elegance: { type: 'number' }, feasibility: { type: 'number' }, total: { type: 'number' }, verdict: { type: 'string' } }, required: ['key', 'hook', 'hold', 'product_clarity', 'offer_aov', 'brand_elegance', 'feasibility', 'total', 'verdict'] } },
    winner: { type: 'string' },
    best_ideas_to_graft: { type: 'array', items: { type: 'string' } },
    fatal_problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['scores', 'winner', 'best_ideas_to_graft', 'fatal_problems'],
}
const LENSES = [
  { key: 'performance', l: 'You are a Meta performance-creative lead for Indian D2C fashion/jewellery. Judge on thumb-stop in frame 1, 3-second hold, hold to 50%, product clarity, price/offer persuasion, AOV push (2-3 pieces), CTA strength, works on mute. Past reels held only 4-7% to a quarter - be harsh about slow openings.' },
  { key: 'creative', l: 'You are the brand\'s creative director and guardian of the owner\'s taste: elegant not tacky, sage/blush/ivory, Cormorant + Jost, no AI look, no graphic clutter, bells toned down. Judge originality, emotional pull, premium feel, coherence of the idea, and whether the owner would approve it.' },
  { key: 'editor', l: 'You are the editor-producer who must actually cut this from the real footage with a deterministic HTML/canvas engine. Verify every cited shot and line against the inventory and sheets (open them). Judge feasibility, continuity, lip-sync risk, pacing, sound plan, claims compliance (never-named items, 3-year vs 2-year guarantee line, 18K gold coating wording, stock rules).' },
]
phase('Judge')
const judged = (await parallel(LENSES.map(L => () =>
  agent(`${L.l}\n\nRead ${H}/inventory.md and look at the sheets in ${H}/sheets/ as needed. Here are ${concepts.length} competing scripts as JSON:\n\n${JSON.stringify(concepts)}\n\nScore each 1-10 on each axis (total = your weighted overall /10), pick a winner, list the best ideas from the others worth grafting into it, and list any fatal problems (wrong footage, false claims, rule breaks).`,
    { label: `judge:${L.key}`, phase: 'Judge', schema: JUDGE })
))).filter(Boolean)

const FINAL = {
  type: 'object',
  properties: {
    title: { type: 'string' }, big_idea: { type: 'string' }, length_s: { type: 'number' },
    beats: CONCEPT.properties.beats,
    new_vo_lines: { type: 'array', items: { type: 'string' } },
    end_card: { type: 'string' }, music: { type: 'string' },
    build_notes: { type: 'string', description: 'notes for the editor: graphics to build, sound cues, lip-sync cautions' },
    what_v2_should_test: { type: 'string' },
  },
  required: ['title', 'big_idea', 'length_s', 'beats', 'new_vo_lines', 'end_card', 'music', 'build_notes', 'what_v2_should_test'],
}
phase('Synthesize')
const v1 = await agent(`${BRIEF}\n\nYou are the head of creative making the final call for VIDEO 1. Four directors wrote scripts and three judges scored them.\n\nSCRIPTS:\n${JSON.stringify(concepts)}\n\nJUDGEMENTS:\n${JSON.stringify(judged)}\n\nWrite the final V1 script: take the strongest idea (weigh the judges, especially performance and the owner's taste), graft the best ideas from the others, fix every fatal problem the judges found, and verify each shot/line against the inventory and sheets yourself. 26-32 s. Exact timings, exact source/clip/in-times, exact quoted lines, exact on-screen text. Keep it elegant: at most one text element plus one product graphic on screen at a time.`,
  { label: 'synthesize:v1', phase: 'Synthesize', schema: FINAL })
return { concepts, judged, v1 }
