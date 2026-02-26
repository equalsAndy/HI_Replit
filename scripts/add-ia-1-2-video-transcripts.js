#!/usr/bin/env node

import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

console.log('🎥 IA-1-2 Video Transcript Update Script');
console.log('=========================================');

const videoUpdates = [
  {
    id: 68,
    editable_id: 'EAen8KoGAZk',
    transcript_md: `(00:00) Welcome. In this unit, we explore how imagination arises through the brain-mind interface, its link to self-awareness and meaning, and why strengthening it matters now more than ever in an AI-shaped world. Neuroscience now confirms that asking "what if" activates the brain's generative systems.

(00:21) Imagination allows us to see beyond current reality and fuels every major step in human progress. Imagination manifests through a dynamic interface between the human brain and our various states of mind. The brain provides structure. The mind gives imagination form and meaning. Across all cultures, imagination has helped people make sense of themselves and their purpose.

(00:45) It remains the neural bridge that links who we are today with who we have the potential to become. Everyone imagines differently through images, sounds, or emotions, for example. However you may do it, your core neurocognitive capability is highly trainable and strengthened with simple practice. This unit explores where imagination originates, how memory supports it, and how the mind transforms raw images into meaningful possibilities.

(01:13) This foundation prepares you for the reflective work ahead.`
  },
  {
    id: 69,
    editable_id: 'Hovs_aTIwpw',
    transcript_md: `(00:00) In this unit, we explore its primal roots and how early humans used imagination as a survival advantage. Human imagination evolved in stages, each expanding how our ancestors made sense of their lives and worlds. This primal substrate is our cognitive bedrock, still foundational as to how we imagine today.

(00:22) Early humans lived in a state of constant simulation, blending sensation, emotion, and prediction. Their waking life was fluid and associative, much like dreaming. Archaeology reveals that imagination played a central role in ritual, identity, and meaning-making in order to navigate an unpredictable world. Prehistoric humans were always scanning for what might happen next.

(00:46) This continuous forecasting kept them alive in uncertain environments. The first imaginers survived. Those who couldn't simulate what might happen next didn't pass on their genes. Three modes shaped early imagination: mimicry, rehearsal, and resonance. Each allowed humans to learn, anticipate, and understand one another.

(01:11) Emotions steered imagination by signaling what mattered. Fear, desire, and curiosity each generated different imagined futures. Sensory-affective imagination forms the earliest layer of meaning. It arises when what we sense in the world blends with our internal emotions and bodily states to create a felt picture of experience.

(01:33) Embodied imagination is rooted in the body's sensations, movements, and emotions. It gives us a felt sense of meaning before concepts, images, or language appear. Motor imagination rehearses a movement in the mind, activating motor pathways without performing it. This prepares the body for precise and efficient action.

(01:57) Watching someone move activates the same motor circuits in our brain, allowing us to learn by observation and feel the action from within. Play is evolution's way of developing imagination. Through play, young animals and children test scenarios and build mental models for life. Before language, gestures allowed humans to imagine together.

(02:19) Embodied signals created shared understanding and laid the groundwork for speech. Meaning emerges from how we perceive and act in the environment. Affordances show us what is possible and guide our behavior. Primal imagination handles the immediate moment, but long-range imagining requires memory.

(02:40) The hippocampus expands imagination beyond the present. Imagination began as embodied survival intelligence driven by emotion, prediction, and action. These primal functions remain the foundation for all higher forms of imagination today.`
  },
  {
    id: 70,
    editable_id: 'HkOPs39jUA8',
    transcript_md: `(00:00) In this unit, we explore how the hippocampus transforms experience into memory, meaning, and imagination. Imagination becomes truly powerful when it reaches beyond the immediate moment. The hippocampus makes this possible by storing experiences and reconstructing them into scenes, allowing the mind to simulate futures, alternatives, and possibilities.

(00:24) Spike and wave bursts mark sudden sensory events. They help the brain register what matters and lay down vivid memories of important moments. The hippocampus switches between different rhythms depending on what we're doing. Some support active exploration, while others support rest, replay, and internal reflection.

(00:46) Pattern separation helps the brain keep similar experiences distinct, so imagination has clean information to work with. Pattern completion allows the brain to fill in missing details, letting us reconstruct memories and imagine complete scenes from fragments. Replay revisits experience during sleep, strengthening memory and refining learning.

(01:10) As she rests, her mind quietly retraces the path she walked earlier. Experience and imagination shape one another over time. As we grow, our concepts become richer and more personal because memory and imagination continually update them. The hippocampus maps not only physical spaces but also social relationships. It helps us navigate people, groups, and the emotional terrain of our social world.

(01:36) Memory is not replayed exactly as it was. The brain blends facts, experiences, and associations to create something new each time we recall. Scene construction builds the mental worlds we imagine. It assembles images, memories, and ideas into a coherent inner landscape. The brain constantly uses memory to predict what will happen next.

(02:00) These predictions help us stay stable in a changing environment. When the world doesn't match our predictions, the brain updates its model. The surprise signal helps us learn and adapt. Our sense of self emerges from the ongoing flow of experience as the brain encodes, stores, and reconstructs our memories.

(02:22) Now that we understand the hippocampus, we're ready to see how it connects to the default mode network and supports imagination at a higher level. Let's see what our hip students on campus learn next.`
  },
  {
    id: 71,
    editable_id: 'IR8SPcLo4dw',
    transcript_md: `(00:00) In this unit, we explore the default mode network, the brain system that transforms memory into self-awareness, imagination, and meaning. The hippocampus gives us memories, but the default mode network weaves those memories into whole cloth. This is where replay becomes imagination and where experience becomes meaning.

(00:21) The default mode network acts like an internal processing unit for imagination, self-awareness, flow, and future thinking. It's the neural engine beneath our inner life. Imagination emerges when memory replay meets cortical integration. The hippocampus provides the raw material and the DMN transforms it into possibilities.

(00:44) Imagination works by combining stored images into new ideas, what Einstein called combinatory play. This is the source of creative breakthroughs across history. Einstein saw imagination as the core of productive thought, where new insights emerge by fusing familiar elements in unexpected ways. The eureka moment happens when mental synthesis sparks a sudden new possibility.

(01:08) They typically occur during low cognitive demand moments like taking a bath or going for a walk in the forest. This is when the DMN is most receptive and active. Learning becomes transformative when reflection, memory, action, and imagination reinforce one another in a continuous loop of growth. The same neural default mode network supports imagination across the entire lifespan, individually and socially.

(01:35) Strengthening imagination elevates self-awareness, relationships, and organizational culture. Imagination is an active drive wired from birth. Childhood is the golden age of "what if," where play, story, and invention come naturally. Through imagination, our identity begins to form. Young children excel at imagination because they remain fluid, playful, and unconstrained.

(02:03) Their neural systems are highly plastic, making imaginative thinking effortless. This is why 98% of five-year-olds score at creative genius level. Imagination isn't abstract. It's built into the brain's design for sensing, simulating, and syncing with others. A shared inner picture guides coordinated insight and action. Great teams don't just respond.

(02:27) They anticipate together. They imagine the next move before acting through a shared mental model. Synchronized foresight and performance across individuals, teams, and organizations. Imagination is the engine of renewal. Strengthening it revitalizes purpose, culture, and shared future direction. Neuroscience shows why organizational vision is more than a slogan.`
  }
];

async function updateVideoTranscripts() {
  try {
    console.log('🔍 Connecting to database...\n');

    // Show current state
    console.log('📊 Current ia-1-2 video status:');
    const currentVideos = await sql`
      SELECT id, step_id, title, editable_id,
             COALESCE(LENGTH(transcript_md), 0) as transcript_length
      FROM videos
      WHERE step_id = 'ia-1-2'
      ORDER BY sort_order
    `;
    currentVideos.forEach(v => {
      console.log(`  ID ${v.id}: ${v.title} (editable_id: ${v.editable_id || 'NULL'}, transcript: ${v.transcript_length} chars)`);
    });

    console.log(`\n🔄 Processing ${videoUpdates.length} video updates...\n`);

    let updatedCount = 0;

    for (const update of videoUpdates) {
      try {
        await sql`
          UPDATE videos
          SET editable_id = ${update.editable_id},
              transcript_md = ${update.transcript_md},
              updated_at = NOW()
          WHERE id = ${update.id}
        `;

        console.log(`✅ Updated ID ${update.id}: editable_id=${update.editable_id}, transcript=${update.transcript_md.length} chars`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating ID ${update.id}:`, error.message);
      }
    }

    console.log(`\n📈 Update Summary: ${updatedCount}/${videoUpdates.length} videos updated`);

    // Verification
    console.log('\n🔍 Verification:');
    const verifyResults = await sql`
      SELECT id, step_id, title, editable_id,
             LENGTH(transcript_md) as transcript_length,
             LEFT(transcript_md, 80) as transcript_preview,
             updated_at
      FROM videos
      WHERE step_id = 'ia-1-2'
      ORDER BY sort_order
    `;

    verifyResults.forEach(v => {
      console.log(`  ID ${v.id}: ${v.title}`);
      console.log(`    editable_id: ${v.editable_id}`);
      console.log(`    transcript: ${v.transcript_length} chars`);
      console.log(`    preview: "${v.transcript_preview}..."`);
      console.log(`    updated: ${v.updated_at}`);
      console.log('');
    });

    console.log('🎉 Done!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await sql.end();
  }
}

updateVideoTranscripts().catch(console.error);
