# Inter-Agent Communication Protocol

## Overview
This system enables subagents to share crucial information with each other during task execution.

## Core Principles
- **50-word limit** on all messages
- **Real-time updates** on critical findings
- **Structured reporting** for task completion
- **Priority-based messaging** for urgent information

## Message Types

### 1. Direct Messages
```bash
node .agent-comm/agent-comm.js send <agent-id> "Found critical bug in auth.js:line 45" <target-agent-id>
```

### 2. Broadcast Messages (to ALL agents)
```bash
node .agent-comm/agent-comm.js send <agent-id> "Database schema changed - update queries" ALL
```

### 3. Task Reports
```bash
node .agent-comm/agent-comm.js report <agent-id> "Code analysis complete" "Found 5 security vulnerabilities in user input validation"
```

## Priority Levels
- **critical**: Immediate action required (security, build failures)
- **high**: Important findings that affect other agents
- **normal**: Regular updates and completions
- **low**: Optional information

## Agent Integration Template

```javascript
// Add to agent prompts:
const AgentComm = require('./.agent-comm/agent-comm.js');
const comm = new AgentComm();
const agentId = comm.generateAgentId('your-task-description');

// Before starting work - check for messages
const messages = comm.readMessages(agentId);

// During work - send critical findings
comm.sendMessage(agentId, "Found API rate limiting issue", "ALL", "high");

// After completion - send report
comm.sendReport(agentId, "Security audit", "3 critical vulns fixed, auth system secure");
```

## Communication Standards

### DO send messages for:
- Security vulnerabilities found
- Database schema changes
- API/integration issues
- Build/deployment problems
- Critical bugs discovered
- Architecture decisions made

### DON'T send messages for:
- Minor code style changes
- Regular progress updates
- Non-critical findings
- Duplicate information

## Message Format
```json
{
  "id": "abc123",
  "from": "agent-xyz",
  "to": "agent-abc",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "priority": "high",
  "message": "Critical finding: auth bypass in login endpoint",
  "type": "direct"
}
```

## Usage Examples

### Security Agent → Code Agent
```bash
node .agent-comm/agent-comm.js send sec-agent "SQL injection vulnerability in users table queries" code-agent
```

### Build Agent → All Agents
```bash
node .agent-comm/agent-comm.js send build-agent "Build failing due to TypeScript errors in utils/" ALL
```

### Database Agent Report
```bash
node .agent-comm/agent-comm.js report db-agent "Schema migration" "Added indexes for performance, migration scripts ready"
```

## Reading Messages
```bash
# Read messages for specific agent
node .agent-comm/agent-comm.js read agent-id

# Check system status
node .agent-comm/agent-comm.js status

# Clean old messages
node .agent-comm/agent-comm.js clean
```

## Integration with Task Tool

When launching agents, include communication setup:

```
I need you to:
1. Set up agent communication: `const comm = new (require('./.agent-comm/agent-comm.js'))(); const agentId = comm.generateAgentId('your-task');`
2. Check messages before starting: `const messages = comm.readMessages(agentId);`
3. Send critical findings immediately: `comm.sendMessage(agentId, 'finding', 'ALL', 'high');`
4. Send completion report: `comm.sendReport(agentId, 'task', 'key findings');`
```

## Binary Protocol Extension

For advanced use cases, messages can include encoded data:
```javascript
// Encode complex data structures
const encoded = Buffer.from(JSON.stringify(complexData)).toString('base64');
comm.sendMessage(agentId, `DATA:${encoded}`, targetId);

// Decode on receiving end
const decoded = JSON.parse(Buffer.from(message.replace('DATA:', ''), 'base64').toString());
```