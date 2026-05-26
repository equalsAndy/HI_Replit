# IA Closing Reflection Survey

The end-of-workshop survey for the **Imaginal Agility (IA)** workshop.

| | |
|---|---|
| **Component** | [`client/src/components/content/imaginal-agility/IA_ClosingReflectionModal.tsx`](../client/src/components/content/imaginal-agility/IA_ClosingReflectionModal.tsx) |
| **Stored as** | `workshop_step_data` row → `workshop_type = 'ia'`, `step_id = 'ia-survey'` |
| **Save endpoint** | `POST /api/workshop-data/step` |
| **Modal title** | **Closing reflection** |
| **Subtitle** | *A few questions to consolidate what you've practiced. Your answers are private.* |

Questions 1–7 are **required**; question 8 is **optional**.

---

## 1. Your capability prism
> *(Shows the user's assessment radar chart above the question.)*

**Q1. Look at the shape of your prism. What do you notice?**
- Type: free text (textarea)
- Placeholder: *"When I look at my prism, I notice..."*
- Field: `prismNotice` · **Required**

## 2. In your own words

**Q2. If a colleague asked "what's imaginal agility?" — what would you say in one sentence?**
- Type: free text (textarea)
- Placeholder: *"In my own words..."*
- Field: `definition` · **Required**

## 3. Your capabilities
> *(Single-select. Options: Imagination · Curiosity · Courage · Creativity · Caring)*

**Q3. Which capability did you lean on most during the microcourse?**
- Type: single choice
- Field: `capabilityMost` · **Required**

**Q4. Which capability surprised you — one you didn't expect to use?**
- Type: single choice
- Field: `capabilitySurprise` · **Required**

## 4. What shifted

**Q5 / Q6. Complete this sentence about your understanding of human imagination and AI:**
- Two paired free-text inputs (before → after):
  - *"Before this, I thought..."* → Field: `shiftBefore` · **Required**
  - *"Now I see that..."* → Field: `shiftAfter` · **Required**

## 5. Your experience
> *(1–5 Likert scale.)*

**Q7a. How likely are you to use what you learned here?**
- Scale: 1–5 — anchors: **Unlikely** → **Already planning to**
- Field: `likelyToUse` · **Required**

**Q7b. Would you recommend this to a colleague?**
- Scale: 1–5 — anchors: **No** → **Definitely**
- Field: `recommend` · **Required**

## 6. Help us improve *(Optional)*

**Q8. One thing we should change next time:**
- Type: free text (textarea)
- Placeholder: *"What would have made this better..."*
- Field: `changeNextTime` · **Optional**

---

**Submit button:** *Submit reflection*

**After submission** the user sees a transition screen — *"You've completed the core journey."* — with an **Explore Module 5 →** button.

## Stored data shape

```json
{
  "prismNotice": "string",
  "definition": "string",
  "capabilityMost": "imagination | curiosity | courage | creativity | caring",
  "capabilitySurprise": "imagination | curiosity | courage | creativity | caring",
  "shiftBefore": "string",
  "shiftAfter": "string",
  "likelyToUse": 1,
  "recommend": 1,
  "changeNextTime": "string | null"
}
```
