/**
 * Turtle RDF Serializer for Solid Pod writes
 *
 * Converts AST assessment and reflection data into Turtle (text/turtle) format
 * for storage in SelfActual Solid Pods.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escape special characters for Turtle string literals */
export function escapeTurtle(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const PREFIXES = `@prefix sa:      <https://vocab.selfactual.ai/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .`;

const PROFILE_PREFIXES = `@prefix sa:      <https://vocab.selfactual.ai/> .
@prefix foaf:    <http://xmlns.com/foaf/0.1/> .
@prefix schema:  <http://schema.org/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .`;

function toISOString(date: Date | string | undefined): string {
  if (!date) return new Date().toISOString();
  return date instanceof Date ? date.toISOString() : date;
}

function dominantQuadrant(scores: { thinking: number; acting: number; feeling: number; planning: number }): string {
  const entries = Object.entries(scores) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function profileShape(scores: { thinking: number; acting: number; feeling: number; planning: number }): string {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]) as [string, number][];
  const top = sorted[0][1];
  const bottom = sorted[3][1];
  const diff = top - bottom;
  if (diff <= 5) return 'balanced';
  if (diff <= 12) return 'moderate';
  return 'specialized';
}

// ── Star Card (Both Pods) ────────────────────────────────────────────────────

export interface StarCardData {
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
}

export function serializeStarCard(
  data: StarCardData,
  username: string,
  createdAt: string,
  appVersion: string = '2.5.1'
): string {
  const dominant = dominantQuadrant(data);
  const shape = profileShape(data);

  return `${PREFIXES}

<>
    a sa:Assessment, sa:StarCard ;
    dcterms:created     "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework        <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp        "AllStarTeams" ;
    sa:sourceVersion    "${escapeTurtle(appVersion)}" ;
    sa:thinking         ${data.thinking} ;
    sa:acting           ${data.acting} ;
    sa:feeling          ${data.feeling} ;
    sa:planning         ${data.planning} ;
    sa:dominantQuadrant "${dominant}" ;
    sa:profileShape     "${shape}" ;
    sa:hasReflections   <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/reflections/strength-reflections/> .
`;
}

export function serializeStarCardSub(
  data: StarCardData,
  createdAt: string,
  appVersion: string = '2.5.1'
): string {
  const dominant = dominantQuadrant(data);
  const shape = profileShape(data);

  return `${PREFIXES}

<>
    a sa:Assessment, sa:StarCard ;
    dcterms:created     "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework        <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp        "AllStarTeams" ;
    sa:sourceVersion    "${escapeTurtle(appVersion)}" ;
    sa:thinking         ${data.thinking} ;
    sa:acting           ${data.acting} ;
    sa:feeling          ${data.feeling} ;
    sa:planning         ${data.planning} ;
    sa:dominantQuadrant "${dominant}" ;
    sa:profileShape     "${shape}" .
`;
}

// ── Flow Attributes (Both Pods) ──────────────────────────────────────────────

export interface FlowAttributeItem {
  name: string;
  score: number;
}

export interface FlowAttributesData {
  attributes: FlowAttributeItem[];
}

export function serializeFlowAttributes(
  data: FlowAttributesData,
  createdAt: string,
  appVersion: string = '2.5.1'
): string {
  const attrTriples = data.attributes
    .map((a, i) => `    sa:attribute${i + 1}Name  "${escapeTurtle(a.name)}" ;\n    sa:attribute${i + 1}Score ${a.score}`)
    .join(' ;\n');

  return `${PREFIXES}

<>
    a sa:Assessment, sa:FlowAttributes ;
    dcterms:created     "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework        <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp        "AllStarTeams" ;
    sa:sourceVersion    "${escapeTurtle(appVersion)}" ;
${attrTriples} .
`;
}

// Sub pod version is identical (no master-only links)
export const serializeFlowAttributesSub = serializeFlowAttributes;

// ── Strength Reflections (Master Only) ───────────────────────────────────────

const DIMENSION_MAP: Record<string, { id: string; label: string; description: string }> = {
  strength1: {
    id: 'thinking',
    label: 'Thinking',
    description: 'Analytical and strategic reasoning — how you process information, solve problems, and make decisions.',
  },
  strength2: {
    id: 'acting',
    label: 'Acting',
    description: 'Execution and initiative — how you take action, drive results, and maintain momentum.',
  },
  strength3: {
    id: 'feeling',
    label: 'Feeling',
    description: 'Emotional intelligence and connection — how you relate to others, read the room, and build trust.',
  },
  strength4: {
    id: 'planning',
    label: 'Planning',
    description: 'Organization and foresight — how you structure work, anticipate needs, and manage complexity.',
  },
};

export interface StepByStepReflectionData {
  reflections: Record<string, string>;
  starCardData?: StarCardData;
  completedAt?: string;
}

export function serializeReflection(
  fieldKey: string,
  response: string,
  username: string,
  starCardData: StarCardData | undefined,
  createdAt: string
): string {
  const dim = DIMENSION_MAP[fieldKey];
  if (!dim) return '';

  const score = starCardData ? (starCardData as any)[dim.id] ?? 0 : 0;

  return `${PREFIXES}

<>
    a sa:Reflection ;
    dcterms:created         "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework            <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp            "AllStarTeams" ;
    sa:reflectionSet        "strength-reflections" ;
    sa:reflectionDimension  "${dim.id}" ;
    sa:aboutAssessment      <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/assessments/starcard> ;
    sa:aboutScore           ${score} ;
    sa:dimensionLabel       "${dim.label}" ;
    sa:dimensionDescription "${escapeTurtle(dim.description)}" ;
    sa:response             "${escapeTurtle(response)}" ;
    sa:completed            true .
`;
}

/** Serialize all four strength reflections as individual Turtle documents */
export function serializeAllReflections(
  data: StepByStepReflectionData,
  username: string,
  createdAt: string
): Map<string, string> {
  const results = new Map<string, string>();
  for (const [fieldKey, dim] of Object.entries(DIMENSION_MAP)) {
    const response = data.reflections?.[fieldKey];
    if (response) {
      results.set(
        dim.id,
        serializeReflection(fieldKey, response, username, data.starCardData, createdAt)
      );
    }
  }

  // teamValues and uniqueContribution go into the "thinking" and "planning" reflections
  // or can be added as additional triples — for now, the four dimensions cover the spec
  return results;
}

// ── Future Self Reflection (Master Only) ─────────────────────────────────────

export interface FutureSelfReflectionData {
  direction?: string;
  twentyYearVision?: string;
  tenYearMilestone?: string;
  fiveYearFoundation?: string;
  flowOptimizedLife?: string;
  futureSelfDescription?: string;
  visualizationNotes?: string;
  additionalNotes?: string;
  completedAt?: string;
}

export function serializeFutureSelf(data: FutureSelfReflectionData, createdAt: string): string {
  return `${PREFIXES}

<>
    a sa:Reflection, sa:FutureSelfReflection ;
    dcterms:created         "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework            <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp            "AllStarTeams" ;
    sa:direction            "${escapeTurtle(data.direction)}" ;
    sa:twentyYearVision     "${escapeTurtle(data.twentyYearVision)}" ;
    sa:tenYearMilestone     "${escapeTurtle(data.tenYearMilestone)}" ;
    sa:fiveYearFoundation   "${escapeTurtle(data.fiveYearFoundation)}" ;
    sa:flowOptimizedLife    "${escapeTurtle(data.flowOptimizedLife)}" ;
    sa:futureSelfDescription "${escapeTurtle(data.futureSelfDescription)}" ;
    sa:visualizationNotes   "${escapeTurtle(data.visualizationNotes)}" ;
    sa:additionalNotes      "${escapeTurtle(data.additionalNotes)}" ;
    sa:completed            true .
`;
}

// ── Cantril Ladder (Master Only) ─────────────────────────────────────────────

export interface CantrilLadderData {
  wellBeingLevel: number;
  futureWellBeingLevel: number;
}

export function serializeCantrilLadder(data: CantrilLadderData, username: string, createdAt: string): string {
  return `${PREFIXES}

<>
    a sa:Assessment, sa:CantrilLadder ;
    dcterms:created         "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework            <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp            "AllStarTeams" ;
    sa:wellBeingLevel       ${data.wellBeingLevel} ;
    sa:futureWellBeingLevel ${data.futureWellBeingLevel} ;
    sa:hasReflection        <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/wellbeing/cantril-ladder-reflection> .
`;
}

// ── Cantril Ladder Reflection (Master Only) ──────────────────────────────────

export interface CantrilLadderReflectionData {
  currentFactors?: string;
  futureImprovements?: string;
  specificChanges?: string;
  quarterlyProgress?: string;
  quarterlyActions?: string;
}

export function serializeCantrilLadderReflection(
  data: CantrilLadderReflectionData,
  username: string,
  createdAt: string
): string {
  return `${PREFIXES}

<>
    a sa:Reflection, sa:WellbeingReflection ;
    dcterms:created         "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework            <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp            "AllStarTeams" ;
    sa:aboutAssessment      <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/wellbeing/cantril-ladder> ;
    sa:currentFactors       "${escapeTurtle(data.currentFactors)}" ;
    sa:futureImprovements   "${escapeTurtle(data.futureImprovements)}" ;
    sa:specificChanges      "${escapeTurtle(data.specificChanges)}" ;
    sa:quarterlyProgress    "${escapeTurtle(data.quarterlyProgress)}" ;
    sa:quarterlyActions     "${escapeTurtle(data.quarterlyActions)}" .
`;
}

// ── Rounding Out Reflection (Master Only) ────────────────────────────────────

export interface RoundingOutReflectionData {
  strengths?: string;
  values?: string;
  passions?: string;
  growthAreas?: string;
}

export function serializeRoundingOut(data: RoundingOutReflectionData, createdAt: string): string {
  return `${PREFIXES}

<>
    a sa:Reflection, sa:RoundingOutReflection ;
    dcterms:created         "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework            <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp            "AllStarTeams" ;
    sa:strengths            "${escapeTurtle(data.strengths)}" ;
    sa:values               "${escapeTurtle(data.values)}" ;
    sa:passions             "${escapeTurtle(data.passions)}" ;
    sa:growthAreas          "${escapeTurtle(data.growthAreas)}" .
`;
}

// ── Final Insight (Master Only) ──────────────────────────────────────────────

export interface FinalInsightData {
  /** Maps to finalReflections.insight column in DB */
  insight?: string;
  /** @deprecated Use insight instead — kept for backwards compatibility */
  futureLetterText?: string;
}

export function serializeFinalInsight(data: FinalInsightData, username: string, createdAt: string): string {
  const text = data.insight || data.futureLetterText || '';

  return `${PREFIXES}

<>
    a sa:Reflection, sa:FinalInsight ;
    dcterms:created     "${toISOString(createdAt)}"^^xsd:dateTime ;
    sa:framework        <https://vocab.selfactual.ai/frameworks/ast> ;
    sa:sourceApp        "AllStarTeams" ;
    sa:synthesizes      <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/assessments/starcard> ;
    sa:synthesizes      <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/assessments/flow-attributes> ;
    sa:synthesizes      <https://vaults.selfactual.ai/${escapeTurtle(username)}/master/reflections/strength-reflections/> ;
    sa:insight          "${escapeTurtle(text)}" .
`;
}

// ── Profile (Master Pod) ────────────────────────────────────────────────────

export interface ProfileData {
  name: string;
  email: string;
  jobTitle?: string | null;
  organization?: string | null;
}

export interface VaultAccountData {
  masterPodUrl: string;
  subPodUrl: string;
  createdAt: Date | string;
}

export function serializeProfile(
  user: ProfileData,
  vault: VaultAccountData,
  username: string
): string {
  const optionals: string[] = [];
  if (user.jobTitle) {
    optionals.push(`    schema:jobTitle     "${escapeTurtle(user.jobTitle)}" ;`);
  }
  if (user.organization) {
    optionals.push(`    schema:worksFor     "${escapeTurtle(user.organization)}" ;`);
  }
  const optionalBlock = optionals.length > 0 ? '\n' + optionals.join('\n') + '\n' : '\n';

  return `${PROFILE_PREFIXES}

<>
    a foaf:Person, sa:VaultOwner ;
    foaf:name           "${escapeTurtle(user.name)}" ;
    schema:email        "${escapeTurtle(user.email)}" ;${optionalBlock}    sa:vaultCreated     "${toISOString(vault.createdAt)}"^^xsd:dateTime ;
    sa:masterPod        <${vault.masterPodUrl}> ;
    sa:subPod           <${vault.subPodUrl}> .
`;
}

// ── Profile Summary (Sub Pod) ───────────────────────────────────────────────

export function serializeProfileSummary(
  user: ProfileData,
  username: string
): string {
  const optionals: string[] = [];
  if (user.jobTitle) {
    optionals.push(`    schema:jobTitle     "${escapeTurtle(user.jobTitle)}" ;`);
  }
  if (user.organization) {
    optionals.push(`    schema:worksFor     "${escapeTurtle(user.organization)}" ;`);
  }
  const optionalBlock = optionals.length > 0 ? '\n' + optionals.join('\n') + '\n' : '\n';

  return `${PROFILE_PREFIXES}

<>
    a foaf:Person, sa:SharedProfile ;
    foaf:name           "${escapeTurtle(user.name)}" ;${optionalBlock}    sa:hasAssessment    <https://vaults.selfactual.ai/${escapeTurtle(username)}/sub/assessments/starcard> ;
    sa:hasAssessment    <https://vaults.selfactual.ai/${escapeTurtle(username)}/sub/assessments/flow-attributes> .
`;
}

// ── Provenance Entry ─────────────────────────────────────────────────────────

export function serializeProvenanceEntry(
  resourcePath: string,
  action: 'created' | 'updated',
  timestamp: string
): string {
  return `${PREFIXES}

<#${Date.now()}>
    a sa:ProvenanceEntry ;
    sa:resource     "${escapeTurtle(resourcePath)}" ;
    sa:action       "${action}" ;
    sa:actor        <https://vaults.selfactual.ai/service/profile/card#me> ;
    sa:sourceApp    "AllStarTeams" ;
    dcterms:created "${toISOString(timestamp)}"^^xsd:dateTime .
`;
}
