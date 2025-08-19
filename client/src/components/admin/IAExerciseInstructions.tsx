import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';

const IAExerciseInstructions: React.FC = () => {
  const { toast } = useToast();

  // Steps available for training
  const IA_STEPS = [
    { id: 'ia-4-2', label: 'IA 4-2: Reframe with AI' },
    { id: 'ia-4-3', label: 'IA 4-3: Stretch Potential (AI Assist)' },
    { id: 'ia-4-4', label: 'IA 4-4: Higher Purpose → World Challenges (AI Perspectives)' },
    { id: 'ia-4-5', label: 'IA 4-5: Inviting the Muse (AI Inspiration)' },
  ];

  // Preview copy for each step
  const STEP_SUMMARY: Record<string, { title: string; bullets: string[] }> = {
    'ia-4-2': {
      title: 'Reframe with AI',
      bullets: [
        'Describe a current challenge in your own words.',
        'Ask the assistant to reframe the challenge constructively.',
        'Note the “shift” in perspective and tag it (e.g., mindset, scope, language).',
        'Capture a short “new perspective” statement.'
      ]
    },
    'ia-4-3': {
      title: 'Stretch Potential (AI Assist)',
      bullets: [
        'State your current frame or limit from the prior visualization.',
        'Ask the assistant to propose a bold but realistic “stretch.”',
        'Describe your stretch vision in a few lines.',
        'Name likely resistance and give your stretch a short name.'
      ]
    },
    'ia-4-4': {
      title: 'Higher Purpose → World Challenges',
      bullets: [
        'Select a world challenge aligned with your higher purpose.',
        'Ask the assistant for multiple perspectives or entry points.',
        'Define a concrete contribution you could make; name the “bridge.”',
        'Scale the contribution (personal → team/organization) in one line.'
      ]
    },
    'ia-4-5': {
      title: 'Inviting the Muse (AI Inspiration)',
      bullets: [
        'Review your recent patterns/insights from the interlude.',
        'Write a short “muse prompt” that invites a creative reply.',
        'Have a brief conversation with the assistant-as-muse.',
        'Capture the insight and give your muse a name.'
      ]
    }
  };

  // Recommended starters per step
  const SIM_STARTER: Record<string, string> = {
    'ia-4-2': "Here is my challenge: <brief sentence>. Please help me reframe it constructively, propose a short ‘shift’ in perspective, and suggest a tag (e.g., mindset, scope, language).",
    'ia-4-3': "My current frame is: <one-line description>. Please propose a bold but realistic stretch, help me write a 2–3 sentence stretch vision, and note likely resistance.",
    'ia-4-4': "My higher purpose is <one line>. For the world challenge <select one>, offer 2–3 perspectives or entry points and help me define a concrete contribution (name the ‘bridge’).",
    'ia-4-5': "From my recent patterns: <one or two cues>. As a ‘muse’, respond with a short, inspiring nudge I can act on and help me name the muse."
  };

  // State
  const [stepId, setStepId] = useState(IA_STEPS[0].id);
  const [instruction, setInstruction] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [globalInstruction, setGlobalInstruction] = useState('');
  const [savedStarter, setSavedStarter] = useState('');

  // Load existing step config
  const loadExisting = async (sid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/ai/exercise-instructions?workshop=ia&stepId=${encodeURIComponent(sid)}`, { credentials: 'include' });
      const data = await res.json();
      if (data?.instruction) {
        setInstruction(data.instruction.instruction || '');
        setEnabled(!!data.instruction.enabled);
        setSavedStarter(data.instruction.simulation_starter || '');
      } else {
        setInstruction('');
        setEnabled(true);
        setSavedStarter('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExisting(stepId); }, [stepId]);

  // Load global guidance on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/ai/exercise-instructions/global', { credentials: 'include' });
        const data = await res.json();
        if (data?.instruction) {
          setGlobalInstruction(data.instruction.instruction || '');
          setGlobalEnabled(!!data.instruction.enabled);
        }
      } catch {}
    })();
  }, []);

  // Save step config
  const save = async () => {
    if (!stepId) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai/exercise-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workshopType: 'ia', stepId, instruction, simulationStarter: savedStarter, enabled })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Saved', description: `Instruction saved for ${stepId}` });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to save' });
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  // Save global guidance
  const saveGlobal = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai/exercise-instructions/global', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ instruction: globalInstruction, enabled: globalEnabled })
      });
      const data = await res.json();
      if (data.success) toast({ title: 'Saved', description: 'Global guidance saved' });
      else toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to save global' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to save global' });
    } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left: Editor (≈2/3) */}
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>IA Exercise AI Training</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="step1">
              <TabsList className="mb-3">
                <TabsTrigger value="step1">1. Exercise</TabsTrigger>
                <TabsTrigger value="step2">2. Step Instruction</TabsTrigger>
                <TabsTrigger value="step3">3. Participant Starter</TabsTrigger>
              </TabsList>

              {/* Step 1: Exercise */}
              <TabsContent value="step1" className="space-y-3">
                <div className="space-y-2">
                  <Label>Exercise</Label>
                  <Select value={stepId} onValueChange={(v) => setStepId(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select IA step" />
                    </SelectTrigger>
                    <SelectContent>
                      {IA_STEPS.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch id="enabled" checked={enabled} onCheckedChange={(v) => setEnabled(!!v)} />
                    <Label htmlFor="enabled" className="text-sm">Use custom training for this step</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved to Admin DB via <code>/api/admin/ai/exercise-instructions</code> (not stored in the vector store).
                  </p>
                </div>
              </TabsContent>

              {/* Step 2: Step Instruction */}
              <TabsContent value="step2" className="space-y-2">
                <Label htmlFor="instr">Step Instruction (required)</Label>
                <Textarea
                  id="instr"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  rows={8}
                  placeholder="Tell the assistant how to behave for this exercise: goals, tone, boundaries, what to avoid. Keep concise and specific."
                />
                <p className="text-xs text-muted-foreground">Instruction is added to every user message in this step.</p>
              </TabsContent>

              {/* Step 3: Participant Starter */}
              <TabsContent value="step3" className="space-y-2">
                <Label htmlFor="starter">Participant Starter (optional)</Label>
                <Textarea
                  id="starter"
                  value={savedStarter}
                  onChange={(e) => setSavedStarter(e.target.value)}
                  rows={4}
                  placeholder="Write the opening prompt participants will see when they launch AI on this step..."
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setSavedStarter(SIM_STARTER[stepId] || '')}>Use Recommended Starter</Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save/Reload */}
            <div className="flex gap-2 pt-4">
              <Button onClick={save} disabled={loading}>Save Step</Button>
              <Button variant="outline" onClick={() => loadExisting(stepId)} disabled={loading}>Reload from Server</Button>
            </div>
          </CardContent>
        </Card>

        {/* Global Guidance (Accordion, collapsed by default) */}
        <Accordion type="single" collapsible>
          <AccordionItem value="global">
            <AccordionTrigger className="text-base">Global Guidance (optional)</AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Switch id="global-enabled" checked={globalEnabled} onCheckedChange={(v) => setGlobalEnabled(!!v)} />
                  <Label htmlFor="global-enabled" className="text-sm">Enable Global Guidance</Label>
                </div>
                <Textarea
                  value={globalInstruction}
                  onChange={(e) => setGlobalInstruction(e.target.value)}
                  rows={5}
                  placeholder="High-level guidance that always applies (e.g., safety, tone, coaching principles)."
                />
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={saveGlobal} disabled={loading}>Save Global Guidance</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Saved to Admin DB via <code>/api/admin/ai/exercise-instructions/global</code>.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Right: Sticky Participant Preview (≈1/3) */}
      <div className="md:sticky md:top-4 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Participant Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-medium">{STEP_SUMMARY[stepId]?.title}</div>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {(STEP_SUMMARY[stepId]?.bullets || []).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Starter shown to participant</div>
              <div className="rounded border p-2 text-sm bg-white/50 whitespace-pre-wrap">{savedStarter || '—'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IAExerciseInstructions;

