export const meta = {
  name: 'naira-hero-critique',
  description: 'Four reviewers watch a rendered version of the Naira hero ad (frame sheets + timeline + audio report) and say what is missing; one lead turns it into the next version brief',
  phases: [
    { title: 'Review', detail: 'performance / creative director / editor / the customer' },
    { title: 'Brief', detail: 'what the next version must change' },
  ],
}

const A = args
const CONTEXT = `You are reviewing VIDEO ${A.version} of a 9:16 Meta Reels hero ad for Naira (Indian demi-fine jewellery). Background on the brand, rules, products, stock and all available footage: read ${A.inventory}. The rendered ad is shown as frame sheets (open each with the Read tool - they are images; each frame is labelled with its time): ${A.sheets.join(', ')}. The exact timeline as built (shots, sound, on-screen text, graphics) is in ${A.timeline} - read it. The audio report (loudness, what is heard when) is in ${A.audio}. ${A.prev ? 'Notes from the previous round, which this version was meant to fix: ' + A.prev : ''} You cannot hear audio; judge sound from the timeline and report. Be concrete: cite times, quote text, name the exact footage (source/clip/in-time from the inventory) you would use instead. Do not write files; return structured output.`

const REVIEW = {
  type: 'object',
  properties: {
    score: { type: 'number', description: 'overall /10 from your lens' },
    working: { type: 'array', items: { type: 'string' } },
    missing_or_wrong: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['critical', 'major', 'minor'] }, at: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'at', 'issue', 'fix'] } },
    unused_assets_worth_using: { type: 'array', items: { type: 'string' } },
    one_big_idea_for_next_version: { type: 'string' },
  },
  required: ['score', 'working', 'missing_or_wrong', 'unused_assets_worth_using', 'one_big_idea_for_next_version'],
}
const LENSES = [
  { key: 'performance', l: 'Lens: Meta performance-creative lead for Indian D2C jewellery. Past reels held only 4-7% to a quarter with 1.9-2.7% CTR and ROAS under 1 (break-even 2.1, AOV ~Rs 1,712). Judge frame-1 thumb-stop, 3-s hold, pace, proof, price/offer clarity, the push to 2-3 pieces, CTA, works on mute, length.' },
  { key: 'creative', l: 'Lens: the brand creative director who knows the owner\'s taste - elegant not tacky, sage/blush/ivory, Cormorant + Jost, radius 0, no AI look, no clutter, soft sounds. Judge the idea, emotion, premium feel, typography, restraint, coherence, and whether it is the best possible use of ALL the footage (Kinn editorial, Riya, Pankti, Ananaya, pearl creator, GRWM, stills, packaging).' },
  { key: 'editor', l: 'Lens: a master commercial editor. Judge rhythm and cut points, continuity, shot selection (is each the best moment available?), lip-sync, transitions, text timing and legibility (enough time to read? safe zone y 270-1250?), graphics collisions with faces or products, the end card, and the sound plan.' },
  { key: 'customer', l: 'Lens: the target customer - a 24-32-year-old woman in Bengaluru or Delhi scrolling Instagram Reels at night, who likes jewellery but has never heard of Naira. Narrate your honest moment-by-moment reaction: would you stop? what do you understand? what do you doubt (quality, price, is it real gold, delivery, returns)? would you tap? what is missing for you to buy two pieces?' },
]
phase('Review')
const reviews = (await parallel(LENSES.map(L => () =>
  agent(`${L.l}\n\n${CONTEXT}`, { label: `review:${L.key}`, phase: 'Review', schema: REVIEW }).then(r => r && { ...r, lens: L.key })
))).filter(Boolean)

const BRIEF = {
  type: 'object',
  properties: {
    verdict: { type: 'string' },
    keep: { type: 'array', items: { type: 'string' } },
    changes: { type: 'array', items: { type: 'object', properties: { priority: { type: 'number' }, change: { type: 'string' }, how: { type: 'string', description: 'exact footage/time/text/graphic/sound to use' } }, required: ['priority', 'change', 'how'] } },
    new_script: { type: 'string', description: 'the next version as a beat-by-beat script with times, picture (exact source/clip/in-time), sound and on-screen text' },
  },
  required: ['verdict', 'keep', 'changes', 'new_script'],
}
phase('Brief')
const brief = await agent(`You are the head of creative. ${CONTEXT}\n\nFour reviewers watched VIDEO ${A.version}:\n${JSON.stringify(reviews)}\n\nWeigh them (the owner's taste and the performance lens matter most; reject suggestions that break the hard rules or that the footage cannot support - check the inventory and sheets yourself). Decide what VIDEO ${A.version + 1} keeps, what it changes (ranked), and write its full beat-by-beat script, 25-32 s. It must be clearly better, not just different, and must use the footage library more fully where that helps.`,
  { label: 'brief:next', phase: 'Brief', schema: BRIEF })
return { reviews, brief }
