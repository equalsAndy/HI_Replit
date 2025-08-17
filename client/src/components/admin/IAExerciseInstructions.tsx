import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Instruction {
  id?: number;
  workshop_type: string;
  step_id: string;
  instruction: string;
  enabled: boolean;
}

const IAExerciseInstructions: React.FC = () => {
  const { toast } = useToast();
  const IA_STEPS = [
    { id: 'ia-4-2', label: 'IA 4-2: Reframe with AI' },
    { id: 'ia-4-3', label: 'IA 4-3: Stretch Potential (AI Assist)' },
    { id: 'ia-4-4', label: 'IA 4-4: Higher Purpose → World Challenges (AI Perspectives)' },
    { id: 'ia-4-5', label: 'IA 4-5: Inviting the Muse (AI Inspiration)' },
  ];
  const [stepId, setStepId] = useState(IA_STEPS[0].id);
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
  const [instruction, setInstruction] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [globalInstruction, setGlobalInstruction] = useState('');
  const [brainstorm, setBrainstorm] = useState('');
  const [goals, setGoals] = useState('');
  const [constraints, setConstraints] = useState('');
  const [testMessage, setTestMessage] = useState("I'm stuck on this exercise – can you help?");
  const [simulation, setSimulation] = useState('');
  const [savedStarter, setSavedStarter] = useState('');
  const SIM_STARTER: Record<string, string> = {
    'ia-4-2': "Here is my challenge: <brief sentence>. Please help me reframe it constructively, propose a short ‘shift’ in perspective, and suggest a tag (e.g., mindset, scope, language).",
    'ia-4-3': "My current frame is: <one-line description>. Please propose a bold but realistic stretch, help me write a 2–3 sentence stretch vision, and note likely resistance.",
    'ia-4-4': "My higher purpose is <one line>. For the world challenge <select one>, offer 2–3 perspectives or entry points and help me define a concrete contribution (name the ‘bridge’).",
    'ia-4-5': "From my recent patterns: <one or two cues>. As a ‘muse’, respond with a short, inspiring nudge I can act on and help me name the muse."
  };

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

  useEffect(() => { loadExisting(stepId); setTestMessage(savedStarter || SIM_STARTER[stepId] || ""); }, [stepId]);

  // Load global instruction on mount
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

  const doBrainstorm = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai/exercise-instructions/brainstorm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ stepId, goals, constraints, currentDraft: instruction })
      });
      const data = await res.json();
      if (data.success) setBrainstorm(data.suggestion || '');
      else toast({ variant: 'destructive', title: 'Error', description: data.error || 'Brainstorm failed' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Brainstorm failed' });
    } finally { setLoading(false); }
  };

  const runSimulation = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai/exercise-instructions/simulate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ stepId, testMessage })
      });
      const data = await res.json();
      if (data.success) setSimulation(data.response || '');
      else toast({ variant: 'destructive', title: 'Error', description: data.error || 'Simulation failed' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Simulation failed' });
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>IA Exercise AI Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-xs text-muted-foreground">Only exercises with AI interactions are listed.</p>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Button type="button" variant={enabled ? 'default' : 'outline'} onClick={() => setEnabled(!enabled)}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>

        {/* Step summary */}
        <div className="rounded-md border p-4 bg-white/50">
          <div className="font-medium mb-1">What the participant does ({STEP_SUMMARY[stepId]?.title})</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {(STEP_SUMMARY[stepId]?.bullets || []).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>

        {/* Global guidance */}
        <div className="space-y-2">
          <Label>Global Guidance (applies to all IA exercises)</Label>
          <Textarea value={globalInstruction} onChange={(e) => setGlobalInstruction(e.target.value)} rows={5} placeholder="High-level guidance for the IA exercise helper..." />
          <div className="flex items-center gap-2">
            <Button type="button" variant={globalEnabled ? 'default' : 'outline'} onClick={() => setGlobalEnabled(!globalEnabled)}>
              {globalEnabled ? 'Enabled' : 'Disabled'}
            </Button>
            <Button onClick={saveGlobal} disabled={loading}>Save Global Guidance</Button>
          </div>
        </div>

        {/* Instruction Workshop (AI) */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="font-medium">Instruction Workshop (AI)</div>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Goals for this step</Label>
              <Textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={4} placeholder="What do you want the assistant to achieve?" />
            </div>
            <div className="space-y-2">
              <Label>Constraints / Do & Don’ts</Label>
              <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} rows={4} placeholder="Boundaries, tone, scope, NOT doing the work for the user" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={doBrainstorm} disabled={loading}>Brainstorm with AI</Button>
            <Button type="button" variant="outline" onClick={() => setInstruction((prev) => (prev ? prev + '\n\n' : '') + brainstorm)} disabled={!brainstorm}>Insert Suggestion</Button>
          </div>
          {brainstorm && (
            <div className="space-y-2">
              <Label>AI Suggestion</Label>
              <Textarea value={brainstorm} onChange={(e) => setBrainstorm(e.target.value)} rows={6} />
            </div>
          )}
        </div>

        {/* Simulation */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="font-medium">Simulation</div>
          <p className="text-xs text-muted-foreground">Starter reflects example exchanges from the activity. You can tweak before running.</p>
          <Label>Test participant message</Label>
          <Textarea value={testMessage} onChange={(e) => setTestMessage(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setTestMessage(SIM_STARTER[stepId] || '')}>Use Example Starter</Button>
            <Button type="button" variant="outline" onClick={() => setTestMessage(savedStarter || '')} disabled={!savedStarter}>Use Saved Starter</Button>
            <Button type="button" onClick={runSimulation} disabled={loading}>Run Simulation</Button>
          </div>
          {simulation && (
            <div className="space-y-2">
              <Label>Assistant Response</Label>
              <Textarea value={simulation} onChange={(e) => setSimulation(e.target.value)} rows={8} />
            </div>
          )}
        </div>

        {/* Default Simulation Starter (Save with Step) */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="font-medium">Default Simulation Starter (for this exercise)</div>
          <Textarea value={savedStarter} onChange={(e) => setSavedStarter(e.target.value)} rows={4} placeholder="Customize the default starter for simulations on this exercise..." />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setSavedStarter(SIM_STARTER[stepId] || '')}>Use Recommended Starter</Button>
            <Button type="button" onClick={save} disabled={loading}>Save Starter</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instr">Instruction for AI</Label>
          <Textarea id="instr" value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={8} placeholder="Guidance for the assistant on how to behave for this exercise (tone, scope, do/don'ts, references)..." />
          <p className="text-xs text-muted-foreground">Markdown supported. Keep concise but specific to the exercise.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={loading}>Save Instruction</Button>
          <Button variant="outline" onClick={() => loadExisting(stepId)} disabled={loading}>Reload</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IAExerciseInstructions;
