// Jira integration utility using acli
import { spawn } from 'child_process';
import { promisify } from 'util';

export interface JiraTicket {
  key: string;
  type: string;
  summary: string;
  status: string;
  assignee: string;
  priority: string;
  description?: string;
}

export interface JiraSearchOptions {
  projects?: string[];
  status?: string[];
  assignee?: string;
  type?: string[];
  limit?: number;
}

// Execute acli command and return parsed output
async function executeAcli(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn('acli', args, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true 
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`acli command failed: ${stderr}`));
      }
    });
  });
}

// Search for Jira tickets
export async function searchJiraTickets(options: JiraSearchOptions = {}): Promise<JiraTicket[]> {
  try {
    const jqlParts: string[] = [];
    
    if (options.projects && options.projects.length > 0) {
      jqlParts.push(`project in (${options.projects.join(', ')})`);
    }
    
    if (options.status && options.status.length > 0) {
      jqlParts.push(`status in ("${options.status.join('", "')}")`);
    }
    
    if (options.assignee) {
      jqlParts.push(`assignee = "${options.assignee}"`);
    }
    
    if (options.type && options.type.length > 0) {
      jqlParts.push(`issuetype in ("${options.type.join('", "')}")`);
    }
    
    const jql = jqlParts.length > 0 ? jqlParts.join(' AND ') : 'project is not EMPTY';
    const limit = options.limit || 20;
    
    const args = [
      'jira', 'workitem', 'search',
      '--jql', jql,
      '--limit', limit.toString(),
      '--json'
    ];
    
    const output = await executeAcli(args);
    
    // Parse JSON output from acli
    try {
      const data = JSON.parse(output);
      return data.issues?.map((issue: any) => ({
        key: issue.key,
        type: issue.fields.issuetype?.name || 'Unknown',
        summary: issue.fields.summary || '',
        status: issue.fields.status?.name || 'Unknown',
        assignee: issue.fields.assignee?.emailAddress || 'Unassigned',
        priority: issue.fields.priority?.name || 'Medium'
      })) || [];
    } catch (parseError) {
      // Fallback: parse table output if JSON fails
      return parseTableOutput(output);
    }
  } catch (error) {
    console.error('Error searching Jira tickets:', error);
    return [];
  }
}

// Get detailed information for a specific ticket
export async function getJiraTicket(ticketKey: string): Promise<JiraTicket | null> {
  try {
    const args = ['jira', 'workitem', 'view', ticketKey];
    const output = await executeAcli(args);
    
    return parseTicketView(output, ticketKey);
  } catch (error) {
    console.error(`Error getting Jira ticket ${ticketKey}:`, error);
    return null;
  }
}

// Parse table output as fallback
function parseTableOutput(output: string): JiraTicket[] {
  const lines = output.split('\n').filter(line => line.trim());
  const tickets: JiraTicket[] = [];
  
  for (const line of lines) {
    if (line.includes('─') || line.includes('Type') || !line.trim()) continue;
    
    const parts = line.split(/\s{2,}/).map(part => part.trim());
    if (parts.length >= 6) {
      tickets.push({
        key: parts[1] || '',
        type: parts[0] || '',
        summary: parts[5] || '',
        status: parts[4] || '',
        assignee: parts[2] || 'Unassigned',
        priority: parts[3] || 'Medium'
      });
    }
  }
  
  return tickets;
}

// Parse ticket view output
function parseTicketView(output: string, key: string): JiraTicket {
  const lines = output.split('\n');
  const ticket: JiraTicket = {
    key,
    type: '',
    summary: '',
    status: '',
    assignee: '',
    priority: ''
  };
  
  let description = '';
  let captureDescription = false;
  
  for (const line of lines) {
    if (line.startsWith('Type: ')) {
      ticket.type = line.replace('Type: ', '').trim();
    } else if (line.startsWith('Summary: ')) {
      ticket.summary = line.replace('Summary: ', '').trim();
    } else if (line.startsWith('Status: ')) {
      ticket.status = line.replace('Status: ', '').trim();
    } else if (line.startsWith('Priority: ')) {
      ticket.priority = line.replace('Priority: ', '').trim();
    } else if (line.startsWith('Description: ')) {
      captureDescription = true;
      description = line.replace('Description: ', '').trim();
    } else if (captureDescription && line.trim()) {
      description += '\n' + line;
    }
  }
  
  ticket.description = description;
  return ticket;
}

// Get tickets related to AI development
export async function getAIRelatedTickets(): Promise<JiraTicket[]> {
  const searchTerms = ['AI', 'coaching', 'Claude', 'OpenAI', 'chatbot', 'holistic', 'report'];
  const jql = `project in (KAN, SA) AND (summary ~ "${searchTerms.join('" OR summary ~ "')}")`;
  
  try {
    const args = [
      'jira', 'workitem', 'search',
      '--jql', jql,
      '--limit', '50'
    ];
    
    const output = await executeAcli(args);
    return parseTableOutput(output);
  } catch (error) {
    console.error('Error getting AI-related tickets:', error);
    return [];
  }
}

// Get tickets for specific projects mentioned in CLAUDE.md
export async function getProjectTickets(): Promise<Record<string, JiraTicket[]>> {
  const projects = ['SA', 'KAN', 'AWB', 'CR'];
  const results: Record<string, JiraTicket[]> = {};
  
  for (const project of projects) {
    try {
      results[project] = await searchJiraTickets({ 
        projects: [project], 
        limit: 10 
      });
    } catch (error) {
      console.error(`Error getting tickets for project ${project}:`, error);
      results[project] = [];
    }
  }
  
  return results;
}

// Link Jira tickets with feature flags for tracking
export function linkTicketWithFeatureFlag(ticketKey: string, flagName: string): {
  ticket: string;
  flag: string;
  relationship: string;
} {
  return {
    ticket: ticketKey,
    flag: flagName,
    relationship: `Feature flag '${flagName}' implements requirements from ${ticketKey}`
  };
}

// Generate development status report combining Jira and feature flags
export async function generateDevStatusReport(): Promise<{
  aiTickets: JiraTicket[];
  flagStatus: Record<string, boolean>;
  recommendations: string[];
}> {
  const aiTickets = await getAIRelatedTickets();
  
  // This would integrate with the feature flag system
  // Import would be: import { getFlagsByEnvironment } from './feature-flags.js';
  const flagStatus = {
    holisticReports: false,
    aiCoaching: false,
    workshopLocking: true,
    debugPanel: true
  };
  
  const recommendations: string[] = [];
  
  // Generate recommendations based on ticket status
  const openAITickets = aiTickets.filter(t => t.status !== 'Done');
  if (openAITickets.length > 0 && !flagStatus.holisticReports) {
    recommendations.push('Consider enabling holisticReports feature flag for AI ticket development');
  }
  
  if (aiTickets.some(t => t.summary.toLowerCase().includes('coaching')) && !flagStatus.aiCoaching) {
    recommendations.push('AI coaching tickets found - aiCoaching flag may need enabling');
  }
  
  return {
    aiTickets,
    flagStatus,
    recommendations
  };
}