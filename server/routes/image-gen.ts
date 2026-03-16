import express from 'express';
import OpenAI from 'openai';
import { getProvider } from '../services/ai-provider.js';
import { photoStorageService, ImageType } from '../services/photo-storage-service.js';

const router = express.Router();

/** Style directives for DALL-E prompt generation — selected by participant in the UI */
const STYLE_PROMPTS: Record<string, string> = {
  photorealistic: 'Professional photography, natural lighting, realistic setting, cinematic depth of field, photorealistic',
  illustration: 'Bold digital illustration, vivid saturated colors, clean graphic style, modern editorial illustration',
  watercolor: 'Soft watercolor painting, gentle flowing colors, artistic and dreamy, hand-painted feel, delicate washes of color',
};

/**
 * OpenAI client — used ONLY for DALL-E image generation (images.generate).
 * All text/prompt generation uses Claude via getProvider('ia').
 */
function getDalleClient(): OpenAI {
  const apiKey = process.env.OPENAI_KEY_IA || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API key for DALL-E (OPENAI_KEY_IA)');
  return new OpenAI({ apiKey });
}

/**
 * POST /api/ai/image/stretch
 *
 * Generates a DALL-E image from the stretch conversation.
 * Two-step: Claude builds the DALL-E prompt from meaning → DALL-E renders it.
 * Images stored in photo_storage table.
 *
 * Body: {
 *   original_title: string,
 *   original_reflection: string,
 *   transcript_summary: string,
 *   adjustment?: string
 * }
 *
 * Returns: {
 *   success: boolean,
 *   photo_id: number,
 *   photo_url: string,
 *   suggested_title: string,
 *   dalle_prompt: string,
 * }
 */
router.post('/stretch', express.json(), async (req, res) => {
  try {
    const { original_title, original_reflection, transcript_summary, adjustment, image_description, style } = req.body;
    const styleDirective = STYLE_PROMPTS[style] || STYLE_PROMPTS.photorealistic;

    if (!original_title || !transcript_summary) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Step 1: Claude builds the DALL-E prompt from conversation meaning
    const provider = await getProvider('ia');
    const adjustmentNote = adjustment
      ? `\n\nIMPORTANT: The previous image didn't capture the stretch well. The participant said: "${adjustment}". Adjust the image concept to address this.`
      : '';

    const claudeResponse = await provider.complete({
      systemPrompt: `You translate a participant's stretch conversation into a DALL-E image prompt and title.

The participant started with an image titled "${original_title}".
Their reflection: "${original_reflection || 'none'}"
${image_description ? `Visual description of their starting image: "${image_description}"` : ''}

Through conversation, they stretched their visualization of this UNDERUSED quality — something they have but don't fully express. The stretch is about bringing it forward, not analyzing what they already do.

Your job: Read the conversation and produce TWO things:

1. TITLE: A short evocative title (2-5 words) that captures WHERE they stretched to. Not the starting point — the destination.

2. IMAGE_PROMPT: A DALL-E 3 prompt (50-80 words) describing a scene that captures the MEANING of their stretch. Rules:
   - GROUND THE IMAGE IN THEIR ACTUAL WORLD. If they work in finance, show a finance setting transformed. If they teach, show a classroom. If they're a student, show a lab or library. The reflection tells you their context — USE IT. An abstract cosmic scene fails if they're talking about redesigning client presentations.
   - INCLUDE THEIR SPECIFIC WORDS. If they said "presentations," "clients," "engaging," "interactive" — those concepts must appear visually in the scene. The conversation tells you what they stretched toward — render THAT, not a generic aspiration.
   - ECHO THE STARTING IMAGE: ${image_description ? `The participant's starting image shows: "${image_description}". Weave a visual echo or evolution of elements from their starting image into the stretch image. For example, if their starting image has flames, the stretch image might show those flames transformed — warming a room, lighting a path, spreading to others. The stretch image should feel like it came FROM the starting image, not from a completely different world. This is secondary to grounding it in their real context — don't force visual references if they conflict with the stretch meaning.` : 'No visual description of the starting image is available.'}
   - Describe a SCENE with mood, lighting, composition
   - Style: "${styleDirective}"
   - NEVER include text, words, letters, or numbers in the image
   - NEVER describe people's faces in detail (DALL-E struggles with this)
   - Show figures from behind or at a distance if people are needed
   - Capture WHERE THEY STRETCHED TO, grounded in their real context

EXAMPLE: If someone whose starting image was a campfire said their stretch is about their passion spreading to their team:
BAD: "A cosmic explosion of creativity and light beams" (generic, ignores their context AND their starting image)
GOOD: "Professional photography, natural lighting. A conference room where each person at the table has a small flame on their desk — echoing the original campfire but spread across a team. Papers and laptops glow warm. The room feels energized, collaborative. One figure stands at the whiteboard, gesturing. Cinematic depth of field."

QUALITY GUARD: If the conversation is very thin — participant only said "I'm not sure" or gave very short answers — do NOT generate dramatic imagery. Instead, create a simple warm scene that gently extends the feeling of "${original_title}" in their context. Match the energy of the conversation.
${adjustmentNote}

Format your response EXACTLY as:
TITLE: [your title]
IMAGE_PROMPT: [your prompt]

Nothing else.`,
      messages: [
        { role: 'user', content: `Here is the stretch conversation:\n\n${transcript_summary}` }
      ],
      maxTokens: 200,
      temperature: 0.8,
    });

    const fullReply = claudeResponse.content ?? '';

    const titleMatch = fullReply.match(/TITLE:\s*(.+)/);
    const promptMatch = fullReply.match(/IMAGE_PROMPT:\s*(.+)/s);

    const suggestedTitle = titleMatch ? titleMatch[1].trim() : 'My Stretch';
    const dallePrompt = promptMatch ? promptMatch[1].trim() : '';

    if (!dallePrompt) {
      console.error('[image-gen/stretch] No IMAGE_PROMPT in response:', fullReply);
      return res.status(500).json({ success: false, error: 'Failed to generate image prompt' });
    }

    // Step 2: Generate with DALL-E 3 (OpenAI only — Claude has no image generation)
    const dalleClient = getDalleClient();
    console.log(`[image-gen/stretch] Generating. Title: "${suggestedTitle}". Prompt: ${dallePrompt.substring(0, 100)}...`);

    const imageResponse = await dalleClient.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    });

    const base64Data = imageResponse.data?.[0]?.b64_json;
    if (!base64Data) {
      return res.status(500).json({ success: false, error: 'DALL-E returned no image data' });
    }

    // Step 3: Store in photo_storage
    const userId = (req.session as any)?.userId;
    const base64DataUrl = `data:image/png;base64,${base64Data}`;
    try {
      const photoId = await photoStorageService.storePhoto(
        base64DataUrl,
        userId,
        true,
        `dalle-stretch-${userId}-${Date.now()}.png`,
        ImageType.DALLE_STRETCH,
        `AI-generated stretch: ${suggestedTitle}`,
        undefined
      );

      console.log(`[image-gen/stretch] Success. Title: "${suggestedTitle}", photo_id: ${photoId}`);
      return res.json({
        success: true,
        photo_id: photoId,
        photo_url: `/api/photos/${photoId}`,
        suggested_title: suggestedTitle,
        dalle_prompt: dallePrompt,
      });
    } catch (storageErr: any) {
      console.error('[image-gen/stretch] Photo storage failed, falling back to base64:', storageErr);
      return res.json({
        success: true,
        photo_url: base64DataUrl,
        storage_fallback: true,
        suggested_title: suggestedTitle,
        dalle_prompt: dallePrompt,
      });
    }

  } catch (error: any) {
    console.error('[image-gen/stretch] Error:', error);
    if (error?.code === 'content_policy_violation') {
      return res.status(400).json({ success: false, error: 'Content policy issue. Try describing your stretch differently.' });
    }
    return res.status(500).json({ success: false, error: error?.message || 'Image generation failed' });
  }
});

/**
 * POST /api/ai/image/capability-stretch
 *
 * Generates a capability-lens stretch image + text.
 *
 * Body: {
 *   original_title: string,
 *   stretch_title: string,
 *   story: string,
 *   capability: 'courage' | 'curiosity' | 'creativity' | 'caring',
 *   transcript_summary?: string
 * }
 */
router.post('/capability-stretch', express.json(), async (req, res) => {
  try {
    const { original_title, stretch_title, story, capability, transcript_summary, style } = req.body;
    const styleDirective = STYLE_PROMPTS[style] || STYLE_PROMPTS.photorealistic;

    if (!original_title || !stretch_title || !story || !capability) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validCaps = ['courage', 'curiosity', 'creativity', 'caring'];
    if (!validCaps.includes(capability)) {
      return res.status(400).json({ success: false, error: 'Invalid capability' });
    }

    // Step 1: Claude generates capability stretch text + DALL-E prompt
    const provider = await getProvider('ia');

    const capabilityAngles: Record<string, string> = {
      courage: `Through COURAGE: Show what becomes possible when they go where they've been avoiding. The bold, risky extension of their stretch. What does this look like when they stop playing it safe?`,
      curiosity: `Through CURIOSITY: Show what they'd discover if they looked closer. The exploratory, questioning extension of their stretch. What opens up when they follow the thread?`,
      creativity: `Through CREATIVITY: Show the version nobody would predict. The surprising, inventive extension. What does their stretch look like combined with something unexpected?`,
      caring: `Through CARING: Show what happens when their stretch isn't solo. The connected, service-oriented extension. Who else moves forward? What does it become when it's bigger than them?`,
    };

    const claudeResponse = await provider.complete({
      systemPrompt: `You show a participant's stretch through a capability lens.

Their image pair:
- Original: "${original_title}"
- Stretch: "${stretch_title}"
- Story: "${story}"
${transcript_summary ? `- Conversation context: ${transcript_summary}` : ''}

Produce THREE things:

1. TEXT: 2-3 sentences showing what their stretch reveals through ${capability}. Be CONCRETE — use their specific words and imagery. Make statements, don't ask questions. This should feel like a genuine new angle, not a restatement.

2. IMAGE_PROMPT: A DALL-E 3 prompt (50-80 words) visualizing this capability stretch. Style: "${styleDirective}" Connect to their metaphors but shift the mood/angle to reflect ${capability}. NEVER include text/words/letters.

3. TITLE: A short evocative title (2-5 words) for this capability view.

Format:
TEXT: [your 2-3 sentences]
IMAGE_PROMPT: [your prompt]
TITLE: [title]`,
      messages: [
        { role: 'user', content: capabilityAngles[capability] }
      ],
      maxTokens: 300,
      temperature: 0.8,
    });

    const fullReply = claudeResponse.content ?? '';
    const textMatch = fullReply.match(/TEXT:\s*(.+?)(?=IMAGE_PROMPT:)/s);
    const promptMatch = fullReply.match(/IMAGE_PROMPT:\s*(.+?)(?=TITLE:)/s);
    const titleMatch = fullReply.match(/TITLE:\s*(.+)/);

    const stretchText = textMatch ? textMatch[1].trim() : '';
    const dallePrompt = promptMatch ? promptMatch[1].trim() : '';
    const title = titleMatch ? titleMatch[1].trim() : `Through ${capability}`;

    if (!dallePrompt || !stretchText) {
      console.error('[image-gen/capability] Parse failed:', fullReply);
      return res.status(500).json({ success: false, error: 'Failed to generate capability stretch' });
    }

    // Step 2: DALL-E generates the image
    const dalleClient = getDalleClient();
    console.log(`[image-gen/capability] Generating ${capability}. Title: "${title}"`);

    const imageResponse = await dalleClient.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    });

    const base64Data = imageResponse.data?.[0]?.b64_json;
    if (!base64Data) {
      return res.status(500).json({ success: false, error: 'DALL-E returned no image' });
    }

    // Step 3: Store in photo_storage
    const userId = (req.session as any)?.userId;
    const base64DataUrl = `data:image/png;base64,${base64Data}`;
    try {
      const photoId = await photoStorageService.storePhoto(
        base64DataUrl,
        userId,
        true,
        `dalle-capability-${capability}-${userId}-${Date.now()}.png`,
        ImageType.DALLE_CAPABILITY,
        `AI-generated ${capability} stretch: ${title}`,
        undefined
      );

      return res.json({
        success: true,
        photo_id: photoId,
        photo_url: `/api/photos/${photoId}`,
        text: stretchText,
        suggested_title: title,
        dalle_prompt: dallePrompt,
      });
    } catch (storageErr: any) {
      console.error('[image-gen/capability] Photo storage failed, falling back to base64:', storageErr);
      return res.json({
        success: true,
        photo_url: base64DataUrl,
        storage_fallback: true,
        text: stretchText,
        suggested_title: title,
        dalle_prompt: dallePrompt,
      });
    }

  } catch (error: any) {
    console.error('[image-gen/capability] Error:', error);
    if (error?.code === 'content_policy_violation') {
      return res.status(400).json({ success: false, error: 'Content policy issue. Try a different capability.' });
    }
    return res.status(500).json({ success: false, error: error?.message || 'Image generation failed' });
  }
});

/**
 * POST /api/ai/image/describe
 *
 * Uses GPT-4o-mini Vision to describe an image.
 * Returns a 2-3 sentence description of the scene, mood, colors, and content.
 *
 * Body: { image_url: string }
 * Returns: { success: boolean, description: string }
 */
router.post('/describe', express.json(), async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) {
      return res.status(400).json({ success: false, error: 'Missing image_url' });
    }

    const client = getDalleClient();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: image_url, detail: 'low' }
          },
          {
            type: 'text',
            text: 'Describe this image in 2-3 sentences. Focus on the scene, mood, colors, composition, and what it depicts. Be concrete and specific — mention actual objects, settings, and visual qualities. Do not interpret symbolism or meaning.'
          }
        ]
      }]
    });

    const description = response.choices?.[0]?.message?.content?.trim() || '';
    console.log(`[image-gen/describe] Description: ${description.substring(0, 100)}...`);

    return res.json({ success: true, description });
  } catch (error: any) {
    console.error('[image-gen/describe] Error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Vision description failed' });
  }
});

export default router;
