import { spawn } from 'child_process';
async function executeAcli(args) {
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
            }
            else {
                reject(new Error(`acli command failed: ${stderr}`));
            }
        });
    });
}
export async function searchJiraTickets(options = {}) {
    try {
        const jqlParts = [];
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
        try {
            const data = JSON.parse(output);
            return data.issues?.map((issue) => ({
                key: issue.key,
                type: issue.fields.issuetype?.name || 'Unknown',
                summary: issue.fields.summary || '',
                status: issue.fields.status?.name || 'Unknown',
                assignee: issue.fields.assignee?.emailAddress || 'Unassigned',
                priority: issue.fields.priority?.name || 'Medium'
            })) || [];
        }
        catch (parseError) {
            return parseTableOutput(output);
        }
    }
    catch (error) {
        console.error('Error searching Jira tickets:', error);
        return [];
    }
}
export async function getJiraTicket(ticketKey) {
    try {
        const args = ['jira', 'workitem', 'view', ticketKey];
        const output = await executeAcli(args);
        return parseTicketView(output, ticketKey);
    }
    catch (error) {
        console.error(`Error getting Jira ticket ${ticketKey}:`, error);
        return null;
    }
}
function parseTableOutput(output) {
    const lines = output.split('\n').filter(line => line.trim());
    const tickets = [];
    for (const line of lines) {
        if (line.includes('─') || line.includes('Type') || !line.trim())
            continue;
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
function parseTicketView(output, key) {
    const lines = output.split('\n');
    const ticket = {
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
        }
        else if (line.startsWith('Summary: ')) {
            ticket.summary = line.replace('Summary: ', '').trim();
        }
        else if (line.startsWith('Status: ')) {
            ticket.status = line.replace('Status: ', '').trim();
        }
        else if (line.startsWith('Priority: ')) {
            ticket.priority = line.replace('Priority: ', '').trim();
        }
        else if (line.startsWith('Description: ')) {
            captureDescription = true;
            description = line.replace('Description: ', '').trim();
        }
        else if (captureDescription && line.trim()) {
            description += '\n' + line;
        }
    }
    ticket.description = description;
    return ticket;
}
export async function getAIRelatedTickets() {
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
    }
    catch (error) {
        console.error('Error getting AI-related tickets:', error);
        return [];
    }
}
export async function getProjectTickets() {
    const projects = ['SA', 'KAN', 'AWB', 'CR'];
    const results = {};
    for (const project of projects) {
        try {
            results[project] = await searchJiraTickets({
                projects: [project],
                limit: 10
            });
        }
        catch (error) {
            console.error(`Error getting tickets for project ${project}:`, error);
            results[project] = [];
        }
    }
    return results;
}
export function linkTicketWithFeatureFlag(ticketKey, flagName) {
    return {
        ticket: ticketKey,
        flag: flagName,
        relationship: `Feature flag '${flagName}' implements requirements from ${ticketKey}`
    };
}
export async function generateDevStatusReport() {
    const aiTickets = await getAIRelatedTickets();
    const flagStatus = {
        holisticReports: false,
        aiCoaching: false,
        workshopLocking: true,
        debugPanel: true
    };
    const recommendations = [];
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
