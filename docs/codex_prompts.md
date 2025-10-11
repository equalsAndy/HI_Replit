Title: Fix IA‑4‑2 Reframe modal UX + wiring (challenge chip, layout overlap, chat error)

Context
We are editing:
client/src/components/ia/ReframeModal.tsx

Problems to fix
	1.	The “Your Challenge” area looks like a textbox but should be read‑only text/chip, matching the mockup (plain text above chat, not editable).
	2.	The right column sometimes covers buttons. Adjust layout so the header doesn’t overlap content and the right column doesn’t overlay its own buttons.
	3.	InlineChat is connected but we’re not surfacing failures. Add a lightweight error surface in the modal and pass an onError handler to InlineChat so any network/model errors show up.
	4.	“Looks right — explore what shifted” should only enable after an assistant reply (i.e., when we actually have a reframe).
	5.	Do not change any other files/components; keep the API contract of ReframeModal intact.

Edits (exact)

A) Header & container spacing (prevent overlay)
	•	In the <DialogContent …> wrapper, append the utility classes: relative min-h-[560px] so we can coordinate spacing within.
	•	Keep the header as it is, but ensure the content panes have clean spacing under the header: left column pt-24, right column pt-24, and add bottom padding so internal buttons aren’t hidden: pb-6 on both columns.
	•	For both left and right columns, add min-h-0 and overflow-auto so the grid respects available height.

B) Challenge display (make it look like a chip, not a textbox)
	•	Find the label that reads “Your Challenge”. Leave that as‑is.
	•	Replace the current challenge container <div id="challenge-echo" …> with a chip‑style surface (no input look):
	•	Use classes: rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-[14px] leading-5 text-gray-900 shadow-sm
	•	Remove any bg-white + heavy border that makes it look like an input.
	•	Keep aria-live="polite".

C) Chat error surface
	•	Right under the challenge chip and above the <InlineChat …>, add a small error area:
	•	A div with id="chat-error" and classes: hidden text-sm text-red-600 bg-red-50/70 border border-red-200 rounded px-3 py-2 mb-2.
	•	Pass an onError={(err)=>{ const el=document.getElementById('chat-error'); if(el){ el.textContent = (err?.message||'Something went wrong.'); el.classList.remove('hidden'); }}} prop to <InlineChat …>.
	•	If InlineChat already supports onError, this will work; if not, safely ignore (no runtime error if it forwards unknown props).

D) InlineChat wiring (no auto‑send)
	•	Ensure we do not auto‑seed an assistant reply. We only pass trainingId="ia-4-2", systemPrompt={PROMPTS.IA_4_2}, seed={challenge}, and the new onError. Keep onReply={onChatReply} as is. Do not add initialMessages that produce auto‑assistant text.

E) Enable/disable “Looks right — explore what shifted” correctly
	•	The button should be disabled until we have at least one assistant message. We already compute latestReframe from transcript. Keep the disable check as: disabled when !latestReframe.trim().

F) Right column overlap fix (buttons visible)
	•	Right column wrapper (the one with bg-white … border … pt-24 …) should include min-h-0 overflow-auto pb-6.
	•	Left column wrapper should include min-h-0 overflow-auto pt-24 pb-6.
	•	Do not position anything absolute inside the right column contents (we already removed that older overlay pattern). Keep everything in normal document flow.

G) Keep reframe visible across phases
	•	The “Reframing your challenge” section should remain at the top of the right column for all phases; we already render it outside the conditional blocks — keep it so. No extra absolute blocks.

Acceptance
	•	The “Your Challenge” area in the left column is read‑only text styled as a chip (not an input).
	•	The header does not overlay content; left and right columns scroll independently without covering bottom buttons.
	•	Chat errors show in a small red box above the chat if a network/model error occurs.
	•	The “Looks right — explore what shifted” button stays disabled until an AI assistant message arrives; after the first assistant reframe, it enables.
	•	No edits to other files; build passes.

Apply these surgical code changes in client/src/components/ia/ReframeModal.tsx only. After the patch, run the dev/build to verify the modal displays correctly, buttons are clickable, and a failed chat shows the error surface.
