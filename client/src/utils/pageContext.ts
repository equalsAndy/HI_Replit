// Auto-detection utility for current page context
export interface PageData {
  title: string;
  workshop: 'ast' | 'ia';
  workshopName: string;
  module?: string;
  url: string;
  stepId?: string;
}

// Map content step IDs to readable titles and modules
const STEP_MAPPINGS: Record<string, { title: string; workshop: 'ast' | 'ia'; module?: string }> = {
  // AST Workshop Steps - Using step IDs with menu item names
  '1-1': { title: 'Introduction', workshop: 'ast', module: 'Introduction' },
  '2-1': { title: 'Intro to Star Strengths', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  '2-2': { title: 'Star Strengths Self-Assessment', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  '2-3': { title: 'Review Your Star Card', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  '2-4': { title: 'Strength Reflection', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  '3-1': { title: 'Intro to Flow', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  '3-2': { title: 'Flow Assessment', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  '3-3': { title: 'Rounding Out', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  '3-4': { title: 'Add Flow to Star Card', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  '4-1': { title: 'Ladder of Well-being', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 1' },
  '4-2': { title: 'Well-being Reflections', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 1' },
  '4-3': { title: 'Visualizing You', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },
  '4-4': { title: 'Your Future Self', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },
  '4-5': { title: 'Final Reflection', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },
  '5-1': { title: 'Download your Star Card', workshop: 'ast', module: 'NEXT STEPS' },
  '5-2': { title: 'Your Holistic Report', workshop: 'ast', module: 'NEXT STEPS' },
  '5-3': { title: 'Growth Plan', workshop: 'ast', module: 'NEXT STEPS' },
  '5-4': { title: 'Team Workshop Prep', workshop: 'ast', module: 'NEXT STEPS' },
  '6-1': { title: 'Workshop Resources', workshop: 'ast', module: 'NEXT STEPS' },
  
  // Legacy content key mappings for backward compatibility
  'welcome': { title: 'Introduction', workshop: 'ast', module: 'Introduction' },
  'intro-strengths': { title: 'Intro to Star Strengths', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  'strengths-assessment': { title: 'Star Strengths Self-Assessment', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  'star-card-preview': { title: 'Review Your Star Card', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  'reflection': { title: 'Strength Reflection', workshop: 'ast', module: 'DISCOVER YOUR STAR STRENGTHS' },
  'intro-to-flow': { title: 'Intro to Flow', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  'flow-assessment': { title: 'Flow Assessment', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  'flow-rounding-out': { title: 'Rounding Out', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  'flow-star-card': { title: 'Add Flow to Star Card', workshop: 'ast', module: 'IDENTIFY YOUR FLOW' },
  'wellbeing': { title: 'Ladder of Well-being', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 1' },
  'cantril-ladder': { title: 'Well-being Reflections', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 1' },
  'visualizing-you': { title: 'Visualizing You', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },
  'future-self': { title: 'Your Future Self', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },
  'final-reflection': { title: 'Final Reflection', workshop: 'ast', module: 'VISUALIZE YOUR POTENTIAL Part 2' },

  // IA Workshop Steps
  'ia-1-1': { title: 'Introduction to IA', workshop: 'ia', module: 'Section 1: Getting Started' },
  'ia-1-2': { title: 'IA Foundations', workshop: 'ia', module: 'Section 1: Getting Started' },
  'ia-2-1': { title: 'Current State Assessment', workshop: 'ia', module: 'Section 2: Foundations' },
  'ia-2-2': { title: 'IA Assessment & Results', workshop: 'ia', module: 'Section 2: Foundations' },
  'ia-3-1': { title: 'Planning Overview', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-3-2': { title: 'Planning Step 2', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-3-3': { title: 'Planning Step 3', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-3-4': { title: 'Planning Step 4', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-3-5': { title: 'Planning Step 5', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-3-6': { title: 'Planning Step 6', workshop: 'ia', module: 'Section 3: Planning' },
  'ia-4-1': { title: 'Practice Step 1', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-4-2': { title: 'Practice Step 2', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-4-3': { title: 'Practice Step 3', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-4-4': { title: 'Practice Step 4', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-4-5': { title: 'Practice Step 5', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-4-6': { title: 'Practice Step 6', workshop: 'ia', module: 'Section 4: Practice' },
  'ia-5-1': { title: 'Assessment and Results', workshop: 'ia', module: 'Section 5: Assessment' },
  'ia-6-1': { title: 'Team Integration', workshop: 'ia', module: 'Section 6: Team Integration' },
  'ia-7-1': { title: 'Team Practice 1', workshop: 'ia', module: 'Section 7: Team Practice' },
  'ia-7-2': { title: 'Team Practice 2', workshop: 'ia', module: 'Section 7: Team Practice' },
  'ia-8-1': { title: 'More Info 1', workshop: 'ia', module: 'Section 8: More Info' },
  'ia-8-2': { title: 'More Info 2', workshop: 'ia', module: 'Section 8: More Info' },
};

// Map URL patterns to page data
const PAGE_MAPPINGS: Record<string, Partial<PageData>> = {
  // AST Workshop Pages
  '/allstarteams': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'AllStarTeams Workshop' },
  '/workshop/ast/strengths': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Strengths Discovery', module: 'Module 1' },
  '/workshop/ast/flow': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Flow Assessment', module: 'Module 1' },
  '/workshop/ast/future-self': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Future Self Vision', module: 'Module 1' },
  '/workshop/ast/vision-board': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Vision Board', module: 'Module 1' },
  '/workshop/ast/team-fusion': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Team Fusion', module: 'Module 2' },
  '/workshop/ast/team-vision': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Team Vision', module: 'Module 2' },
  '/workshop/ast/challenge-reframing': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Challenge Reframing', module: 'Module 2' },
  '/workshop/ast/growth-plan': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Growth Plan', module: 'Post-Workshop' },
  '/workshop/ast/progress': { workshop: 'ast', workshopName: 'AllStarTeams', title: 'Progress Tracking', module: 'Post-Workshop' },
  
  // IA Workshop Pages  
  '/imaginal-agility': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Imaginal Agility Workshop' },
  '/workshop/ia/intro': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Introduction', module: 'Module 1' },
  '/workshop/ia/vision': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Vision Setting', module: 'Module 1' },
  '/workshop/ia/current-state': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Current State Assessment', module: 'Module 2' },
  '/workshop/ia/reflection': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Reflection Exercises', module: 'Module 2' },
  '/workshop/ia/outcomes': { workshop: 'ia', workshopName: 'Imaginal Agility', title: 'Outcomes & Benefits', module: 'Post-Workshop' },
};

// Fallback page title detection from common patterns
const TITLE_PATTERNS = [
  // Look for page titles in various formats
  { pattern: /flow.{0,20}assessment/i, title: 'Flow Assessment', workshop: 'ast' as const },
  { pattern: /strengths?.{0,20}discovery/i, title: 'Strengths Discovery', workshop: 'ast' as const },
  { pattern: /future.{0,10}self/i, title: 'Future Self Vision', workshop: 'ast' as const },
  { pattern: /vision.{0,10}board/i, title: 'Vision Board', workshop: 'ast' as const },
  { pattern: /team.{0,10}fusion/i, title: 'Team Fusion', workshop: 'ast' as const },
  { pattern: /team.{0,10}vision/i, title: 'Team Vision', workshop: 'ast' as const },
  { pattern: /challenge.{0,10}reframing/i, title: 'Challenge Reframing', workshop: 'ast' as const },
  { pattern: /growth.{0,10}plan/i, title: 'Growth Plan', workshop: 'ast' as const },
  { pattern: /progress.{0,10}tracking/i, title: 'Progress Tracking', workshop: 'ast' as const },
  
  // IA patterns
  { pattern: /imaginal.{0,20}agility/i, title: 'Imaginal Agility', workshop: 'ia' as const },
  { pattern: /current.{0,10}state/i, title: 'Current State Assessment', workshop: 'ia' as const },
  { pattern: /reflection/i, title: 'Reflection Exercises', workshop: 'ia' as const },
  { pattern: /outcomes?.{0,10}benefits?/i, title: 'Outcomes & Benefits', workshop: 'ia' as const },
];

// Enhanced function that can accept a current step ID for accurate context
export function detectCurrentPage(currentStepId?: string): PageData {
  const currentUrl = window.location.pathname;
  const currentTitle = document.title;
  const currentHTML = document.documentElement.outerHTML;

  console.log('🔍 detectCurrentPage called with:', {
    currentStepId,
    currentUrl,
    currentTitle: currentTitle.substring(0, 100)
  });

  // If we have a step ID, use that for accurate detection
  if (currentStepId && STEP_MAPPINGS[currentStepId]) {
    const stepInfo = STEP_MAPPINGS[currentStepId];
    const result = {
      title: stepInfo.title,
      workshop: stepInfo.workshop,
      workshopName: stepInfo.workshop === 'ast' ? 'AllStarTeams' : 'Imaginal Agility',
      module: stepInfo.module,
      url: currentUrl,
      stepId: currentStepId,
    };
    console.log('✅ Found step mapping for', currentStepId, ':', result);
    return result;
  } else if (currentStepId) {
    console.log('❌ No step mapping found for stepId:', currentStepId, 'Available mappings:', Object.keys(STEP_MAPPINGS));
  }

  // Try exact URL mapping first
  for (const [urlPattern, pageData] of Object.entries(PAGE_MAPPINGS)) {
    if (currentUrl.includes(urlPattern) || currentUrl === urlPattern) {
      const result = {
        title: pageData.title || 'Unknown Page',
        workshop: pageData.workshop || 'ast',
        workshopName: pageData.workshopName || 'Workshop',
        module: pageData.module,
        url: currentUrl,
      };
      console.log('🔗 Found URL mapping for', urlPattern, ':', result);
      return result;
    }
  }

  // Try pattern matching on title and content
  for (const { pattern, title, workshop } of TITLE_PATTERNS) {
    if (pattern.test(currentTitle) || pattern.test(currentHTML)) {
      return {
        title,
        workshop,
        workshopName: workshop === 'ast' ? 'AllStarTeams' : 'Imaginal Agility',
        url: currentUrl,
      };
    }
  }

  // Determine workshop from URL if possible
  let workshop: 'ast' | 'ia' = 'ast';
  let workshopName = 'AllStarTeams';

  if (currentUrl.includes('imaginal') || currentUrl.includes('ia') || currentTitle.toLowerCase().includes('imaginal')) {
    workshop = 'ia';
    workshopName = 'Imaginal Agility';
  }

  // Fallback: try to extract title from document title or headings
  let detectedTitle = 'Current Page';
  
  // Try to get title from document title (remove site name)
  if (currentTitle) {
    const cleanTitle = currentTitle
      .replace(/\s*[|-]\s*(AllStarTeams|Imaginal Agility|Heliotrope|Workshop).*/i, '')
      .trim();
    if (cleanTitle && cleanTitle !== currentTitle) {
      detectedTitle = cleanTitle;
    }
  }

  // Try to get title from main heading
  if (detectedTitle === 'Current Page') {
    const mainHeading = document.querySelector('h1, h2, [data-page-title]');
    if (mainHeading?.textContent?.trim()) {
      detectedTitle = mainHeading.textContent.trim();
    }
  }

  // Try to detect from step identifiers (AST uses 1-1, 2-2, IA uses ia-1-1, ia-2-2)
  const stepMatch = currentUrl.match(/\/(\d+-\d+|ia-\d+-\d+)/);
  if (stepMatch) {
    const stepId = stepMatch[1];
    if (stepId.startsWith('ia-')) {
      workshop = 'ia';
      workshopName = 'Imaginal Agility';
    }
    
    // Could enhance this with step-specific titles
    detectedTitle = `Workshop Step ${stepId}`;
  }

  return {
    title: detectedTitle,
    workshop,
    workshopName,
    url: currentUrl,
  };
}

// Utility to check if current page is a workshop page
export function isWorkshopPage(): boolean {
  const currentUrl = window.location.pathname;
  return currentUrl.includes('/workshop/') || 
         currentUrl.includes('/allstarteams') || 
         currentUrl.includes('/imaginal-agility') ||
         Object.keys(PAGE_MAPPINGS).some(pattern => currentUrl.includes(pattern));
}

// Get workshop type from current page
export function getCurrentWorkshop(): 'ast' | 'ia' | null {
  const currentUrl = window.location.pathname;
  const currentTitle = document.title.toLowerCase();
  
  if (currentUrl.includes('imaginal') || currentUrl.includes('ia') || currentTitle.includes('imaginal')) {
    return 'ia';
  }
  
  if (currentUrl.includes('allstarteams') || currentUrl.includes('ast') || currentUrl.includes('workshop')) {
    return 'ast';
  }
  
  return null;
}