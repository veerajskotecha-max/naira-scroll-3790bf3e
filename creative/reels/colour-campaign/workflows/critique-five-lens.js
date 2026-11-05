export const meta = {
  name: 'naira-colour-ad-critique',
  description: 'Five reviewers watch one colour-campaign ad (sheets, frames, timeline, audio) and a lead ranks the fixes and decides whether it is ready for 4K',
  phases: [
    { title: 'Review', detail: 'performance / creative director / AI-artifact and fidelity / editor / customer' },
    { title: 'Lead', detail: 'score, ranked fixes, ready for 4K?' },
  ],
}
const A = args
const CTX = `You are reviewing ${A.name}, a 9:16 Meta Reels ad in Naira's colour campaign (Indian demi-fine jewellery; AI studio footage finished with brand type and motion graphics in our own engine). The campaign brief, hard rules and every product's listing facts: ${A.brief} (read it). What this ad is meant to be: ${A.desc} Frame sheets (open each with Read; each frame is labelled with its time; the magenta lines mark the Reels safe zone y 270-1250): ${A.sheets.join(', ')}. Full-resolution rendered frames: ${A.frames} (f_NNNNN.jpg, frame = t*${A.fps}+1; open individual frames to inspect detail). The real product's listing photos: ${A.product_photos} (compare the piece on screen against them for fidelity). Timeline as built: ${A.timeline}. Audio report: ${A.audio}. ${A.prev ? 'Earlier round notes: ' + A.prev : ''} You cannot hear audio; judge sound from the timeline and report. Be concrete: cite times, quote text, say exactly what to change. Do not write files; return structured output.`
const REVIEW = { type: 'object', properties: {
  score: { type: 'number', description: 'overall /10 from your lens' },
  working: { type: 'array', items: { type: 'string' } },
  issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['critical', 'major', 'minor'] }, at: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'at', 'issue', 'fix'] } },
  idea_to_make_it_10: { type: 'string' } },
  required: ['score', 'working', 'issues', 'idea_to_make_it_10'] }
const LENSES = [
  { key: 'performance', l: 'Lens: Meta performance-creative lead for Indian D2C jewellery (past reels: 4-7% held to a quarter, CTR 1.9-2.7%, ROAS under 1, break-even 2.1, AOV about Rs 1,712). Judge frame-1 thumb-stop, the 3-s hold, price and offer on mute, proof, CTA, length.' },
  { key: 'creative', l: "Lens: the brand creative director who knows the owner's taste: elegant not tacky, sage/blush/ivory brand marks, Cormorant + Jost, radius 0, little clutter, soft sound, and no visible 'AI look'. Judge the idea, the colour concept, beauty, premium feel, typography and restraint." },
  { key: 'vfx', l: 'Lens: VFX supervisor and product-fidelity QC. Open individual full-resolution frames across every shot. Hunt for AI artifacts: morphing or melting metal, stones appearing or disappearing, prong or claw changes, chain links re-forming, colour drift, flicker, boiling texture, impossible physics, ghost objects, seams, compositing edges, upscaling halos. Compare the piece against the listing photos (stone colour and cut, metal colour, shape, clasp). Say exactly which frames fail and whether a re-generation, a trim or a mask fixes it.' },
  { key: 'editor', l: 'Lens: a master commercial editor and motion designer. Judge rhythm, cut points against the music, how smooth and premium the motion graphics are, text timing and legibility, safe zone and right-edge rule, collisions with the piece, the end card and the sound plan.' },
  { key: 'customer', l: 'Lens: the target customer, a 24-32-year-old woman in Bengaluru or Delhi scrolling Reels at night who has never heard of Naira. Narrate moment by moment: would you stop, understand, trust it, want it, tap? What is missing for you to buy?' },
]
phase('Review')
const reviews = (await parallel(LENSES.map(L => () => agent(`${L.l}\n\n${CTX}`, { label: `review:${L.key}`, phase: 'Review', schema: REVIEW }).then(r => r && { ...r, lens: L.key })))).filter(Boolean)
const LEAD = { type: 'object', properties: {
  score: { type: 'number', description: 'the ad as it stands, /10' },
  verdict: { type: 'string' },
  fixes: { type: 'array', items: { type: 'object', properties: { priority: { type: 'number' }, fix: { type: 'string' }, how: { type: 'string', description: 'exact times, text, positions, frames or regeneration prompt' }, cost_credits: { type: 'number' } }, required: ['priority', 'fix', 'how', 'cost_credits'] } },
  expected_score_after_fixes: { type: 'number' },
  ready_for_4k_after_fixes: { type: 'boolean' },
  lessons_for_next_ads: { type: 'array', items: { type: 'string' } } },
  required: ['score', 'verdict', 'fixes', 'expected_score_after_fixes', 'ready_for_4k_after_fixes', 'lessons_for_next_ads'] }
phase('Lead')
const lead = await agent(`You are the head of creative. ${CTX}\n\nFive reviewers: ${JSON.stringify(reviews)}\n\nWeigh them (the owner's taste, product fidelity and the performance lens matter most; reject any suggestion that breaks the hard rules or that the footage cannot support - check frames yourself). Rank the fixes that would take this ad to 10/10 or as close as the footage allows, each with exact instructions and its credit cost (0 for edits in our engine). Say whether it is ready for the 4K upscale after those fixes, and list lessons the next ads in the campaign should carry.`, { label: 'lead', phase: 'Lead', schema: LEAD })
return { reviews, lead }
