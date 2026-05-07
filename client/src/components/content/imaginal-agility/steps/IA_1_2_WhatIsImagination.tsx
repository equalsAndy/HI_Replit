import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import VideoTranscriptGlossary from '@/components/common/VideoTranscriptGlossary';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

const IA_1_2_TRANSCRIPT_HTML = `
<div style="font-family: inherit; line-height: 1.8; color: #1f2937;">
  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-top: 0; margin-bottom: 1rem;">What Is Imagination?</h2>
  <p>In this unit, we explore how imagination arises through the brain-mind interface, its link to self-awareness and meaning, and why strengthening it matters now more than ever in an AI-shaped world. Neuroscience now confirms that asking "what if" activates the brain's generative systems.</p>
  <p>Imagination allows us to see beyond current reality and fuels every major step in human progress. Imagination manifests through a dynamic interface between the human brain and our various states of mind. The brain provides structure. The mind gives imagination form and meaning.</p>
  <p>Across all cultures, imagination has helped people make sense of themselves and their purpose. It remains the neural bridge that links who we are today with who we have the potential to become. Everyone imagines differently — through images, sounds, or emotions, for example.</p>
  <p>However you may do it, your core neurocognitive capability is highly trainable and strengthened with simple practice. This unit explores where imagination originates, how memory supports it, and how the mind transforms raw images into meaningful possibilities. This foundation prepares you for the reflective work ahead.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Primal Imagination</h2>
  <p>Human imagination evolved in stages, each expanding how our ancestors made sense of their lives and worlds. This primal substrate is our cognitive bedrock, still foundational as to how we imagine today.</p>
  <p>Early humans lived in a state of constant simulation, blending sensation, emotion, and prediction. Their waking life was fluid and associative, much like dreaming. Archaeology reveals that imagination played a central role in ritual, identity, and meaning-making in order to navigate an unpredictable world.</p>
  <p>Prehistoric humans were always scanning for what might happen next. This continuous forecasting kept them alive in uncertain environments. <strong>The first imaginers survived.</strong> Those who couldn't simulate what might happen next didn't pass on their genes.</p>
  <p>Three modes shaped early imagination: <em>mimicry, rehearsal, and resonance.</em> Each allowed humans to learn, anticipate, and understand one another. Emotions steered imagination by signaling what mattered. Fear, desire, and curiosity each generated different imagined futures.</p>
  <p>Primal imagination handles the immediate moment, but long-range imagining requires memory. The hippocampus expands imagination beyond the present. Imagination began as embodied survival intelligence, driven by emotion, prediction, and action. These primal functions remain the foundation for all higher forms of imagination today.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Memory &amp; Imagination</h2>
  <p>Imagination becomes truly powerful when it reaches beyond the immediate moment. The hippocampus makes this possible by storing experiences and reconstructing them into scenes, allowing the mind to simulate futures, alternatives, and possibilities.</p>
  <p>Pattern separation helps the brain keep similar experiences distinct, so imagination has clean information to work with. Pattern completion allows the brain to fill in missing details, letting us reconstruct memories and imagine complete scenes from fragments.</p>
  <p>Replay revisits experience during sleep, strengthening memory and refining learning. Experience and imagination shape one another over time. As we grow, our concepts become richer and more personal because memory and imagination continually update them.</p>
  <p>The hippocampus maps not only physical spaces but also social relationships. It helps us navigate people, groups, and the emotional terrain of our social world. Memory is not replayed exactly as it was. The brain blends facts, experiences, and associations to create something new each time we recall.</p>
  <p>Scene construction builds the mental worlds we imagine. It assembles images, memories, and ideas into a coherent inner landscape. The brain constantly uses memory to predict what will happen next.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
  <h2 style="color: #7c3aed; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Meaning &amp; Emergent Imagination</h2>
  <p>The default mode network is the brain system that transforms memory into self-awareness, imagination, and meaning. The hippocampus gives us memories, but the default mode network weaves those memories into whole cloth. This is where replay becomes imagination and where experience becomes meaning.</p>
  <p>The default mode network acts like an internal processing unit for imagination, self-awareness, flow, and future thinking. It's the neural engine beneath our inner life. Imagination emerges when memory replay meets cortical integration. The hippocampus provides the raw material and the DMN transforms it into possibilities.</p>
  <p>Imagination works by combining stored images into new ideas — what Einstein called <em>combinatory play.</em> This is the source of creative breakthroughs across history. Einstein saw imagination as the core of productive thought, where new insights emerge by fusing familiar elements in unexpected ways. The eureka moment happens when mental synthesis sparks a sudden new possibility.</p>
  <p><strong>Imagination isn't abstract. It's built into the brain's design</strong> for sensing, simulating, and syncing with others. A shared inner picture guides coordinated insight and action. Great teams don't just respond — they anticipate together. They imagine the next move before acting, through a shared mental model.</p>
  <p>Across individuals, teams, and organizations, imagination is the engine of renewal. Strengthening it revitalizes purpose, culture, and shared future direction. Neuroscience shows why organizational vision is more than a slogan.</p>
</div>
`;

interface IA12WhatIsImaginationProps {
  onNext?: (stepId: string) => void;
}

const IA_1_2_WhatIsImagination: React.FC<IA12WhatIsImaginationProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Your Imagination Is Already Running
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="max-w-none text-gray-800 space-y-6">

          <VideoTranscriptGlossary
            youtubeId="OtXFf6fgZ8w"
            title="What Is Imagination?"
            transcriptHtml={IA_1_2_TRANSCRIPT_HTML}
          />

          <p className="text-lg leading-relaxed font-semibold">
            You don't need to "become more imaginative." Your imagination is already working.
          </p>

          <p className="text-lg leading-relaxed">
            Right now, your brain is doing things that qualify as imagination — and most of them are invisible to you.
          </p>

          <p className="text-lg leading-relaxed">
            When you picture how a meeting might go before it happens, that's imagination. When you replay something someone said and feel frustrated all over again, that's imagination too. When you lie awake at 2am running through worst-case scenarios — your imagination is in overdrive.
          </p>

          <p className="text-lg leading-relaxed">
            The problem isn't that adults lose their imagination. It's that nobody teaches us to notice it or steer it.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
            What's actually happening
          </h2>

          <div className="flex justify-center my-4">
            <img
              src="/assets/imagination_autopilot.png"
              alt="Your imagination running on autopilot — replaying, predicting, worrying"
              className="w-full max-w-lg rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <p className="text-lg leading-relaxed">
            Your brain runs a constant internal process. It takes bits and pieces from your memories and experience, mixes them up, and builds pictures of the future, other people's perspectives, and possible versions of yourself. This is happening all day long.
          </p>

          <p className="text-lg leading-relaxed">
            Think of it as a black box. It's powerful. It's always on. But for most people, it runs on autopilot — and autopilot has a negativity bias. Left to its own devices, your imagination tends to drift toward worry, self-criticism, and replaying things that already happened.
          </p>

          <div className="flex justify-center my-6">
            <img
              src="/assets/black_box_imagination.jpg"
              alt="The black box — your imagination running unseen, with light breaking through"
              className="w-full max-w-md rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <p className="text-lg leading-relaxed">
            That's not a character flaw. It's how brains work. But it means that the same system that can envision a breakthrough or imagine how someone else feels is also the system that keeps you up at night second-guessing yourself.
          </p>

          {/* Sidebar callout — the science name */}
          <div className="flex gap-4 bg-purple-50 border border-purple-100 rounded-xl p-5 my-8">
            <div className="flex-shrink-0 mt-1">
              <img src="/assets/HI BRAIN ICON.png" alt="Brain" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-700 mb-1">The science behind this</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Scientists call this system the Default Mode Network. It's most active when you're daydreaming, reflecting, or not focused on a task — which is when your deepest thinking happens. Your best ideas in the shower? That's this system at work.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-purple-700 mt-8 mb-4">
            The good news: the black box can be opened.
          </h2>

          <p className="text-lg leading-relaxed">
            What's inside isn't mysterious or complicated. It's a set of capabilities you already use, just not deliberately. This course gives you ways to see them, name them, and practice using them — so your imagination works for you instead of running on its own.
          </p>

          <p className="text-lg leading-relaxed">
            Here's what we mean by capabilities:
          </p>

          {/* Capability Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <img src="/assets/Imagination_sq.png" alt="Imagination" className="w-16 h-16 mx-auto mb-2" />
              <h3 className="font-semibold" style={{ color: '#8b5cf6' }}>Imagination</h3>
              <p className="text-sm text-gray-600 mt-1">Seeing what doesn't exist yet. The source that powers everything else.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <img src="/assets/Curiosity_sq.png" alt="Curiosity" className="w-16 h-16 mx-auto mb-2" />
              <h3 className="font-semibold" style={{ color: '#10b981' }}>Curiosity</h3>
              <p className="text-sm text-gray-600 mt-1">The drive to explore, question, and understand.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <img src="/assets/empathy_sq.png" alt="Caring" className="w-16 h-16 mx-auto mb-2" />
              <h3 className="font-semibold" style={{ color: '#3b82f6' }}>Caring</h3>
              <p className="text-sm text-gray-600 mt-1">Noticing what matters to others, not just yourself.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <img src="/assets/Creativity_sq.png" alt="Creativity" className="w-16 h-16 mx-auto mb-2" />
              <h3 className="font-semibold" style={{ color: '#f59e0b' }}>Creativity</h3>
              <p className="text-sm text-gray-600 mt-1">Making new connections between things that seem unrelated.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
              <img src="/assets/courage_sq.png" alt="Courage" className="w-16 h-16 mx-auto mb-2" />
              <h3 className="font-semibold" style={{ color: '#ef4444' }}>Courage</h3>
              <p className="text-sm text-gray-600 mt-1">Choosing to act even when the outcome isn't guaranteed.</p>
            </div>
          </div>

          <p className="text-lg leading-relaxed">
            Imagination is the substrate — the raw power that makes the other four possible. Without imagination, curiosity has nowhere to go, creativity has nothing to combine, caring can't picture another person's experience, and courage can't envision a better outcome worth risking something for.
          </p>

          {/* Go Deeper — modal */}
          <div className="my-8">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl px-5 py-4 transition-colors group cursor-pointer">
                  <span className="font-semibold text-purple-700 group-hover:text-purple-800">
                    How does imagination actually work in the brain?
                  </span>
                  <span className="text-purple-400 text-sm ml-4 flex-shrink-0">Learn more →</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-purple-700">How Imagination Works in the Brain</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-gray-700 text-base leading-relaxed mt-4">
                  <p>
                    Think of imagination as a three-stage system. Each layer builds on the last, transforming basic sensations into meaningful possibilities.
                  </p>
                  <div className="flex justify-center my-6">
                    <img
                      src="/assets/3_layer_brain.png"
                      alt="Three layers of imagination: Primal, Hippocampus, Default Mode Network"
                      className="w-full max-w-md rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-700 mb-1">Layer 1: Body</h4>
                      <p>Imagination starts in your body. Feelings, sensations, and gut reactions shape your inner world before you form any conscious thought. Fear imagines threats. Desire imagines rewards. Curiosity imagines possibilities.</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-700 mb-1">Layer 2: Memory</h4>
                      <p>Your brain stores experiences and reconstructs them into scenes. It fills in missing details and replays important moments — even remixing them into new combinations. Memory is the raw material. Imagination is what happens when memory becomes generative.</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-700 mb-1">Layer 3: Meaning</h4>
                      <p>A deeper brain network blends memory into meaning. It helps you reflect, understand yourself, and picture what's possible. This is where separate pieces combine into new ideas — what Einstein called "combinatory play." It's also where your best ideas tend to arrive: in the shower, on a walk, during moments when your mind is free to wander.</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 italic mt-4">
                    <a href="/assets/Imagination_QuickStart_Guide.pdf" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline">The Companion Guide</a> covers each layer in depth.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex justify-center my-8">
            <img
              src="/assets/prism_capabilities.png"
              alt="Imagination as white light refracting through a prism into five capability colors"
              className="w-full max-w-md rounded-xl shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          <p className="text-lg leading-relaxed">
            In the next module, you'll map how these capabilities show up in your own life right now. Not as a test — as a mirror.
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-1-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue: Why This Matters Now
        </Button>
      </div>
    </div>
  );
};

export default IA_1_2_WhatIsImagination;
