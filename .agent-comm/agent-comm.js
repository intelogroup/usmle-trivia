#!/usr/bin/env node

// Inter-Agent Communication System
// Allows subagents to share crucial information with each other

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AgentComm {
  constructor() {
    this.commDir = path.join(process.cwd(), '.agent-comm');
    this.messagesDir = path.join(this.commDir, 'messages');
    this.broadcastsDir = path.join(this.commDir, 'broadcasts');
    this.reportsDir = path.join(this.commDir, 'reports');
  }

  // Generate unique agent ID based on task context
  generateAgentId(taskDescription) {
    return crypto.createHash('md5').update(taskDescription + Date.now()).digest('hex').substring(0, 8);
  }

  // Send a message to specific agent or broadcast to all
  sendMessage(fromAgentId, message, toAgentId = 'ALL', priority = 'normal') {
    const timestamp = new Date().toISOString();
    const messageId = crypto.randomBytes(4).toString('hex');
    
    const messageData = {
      id: messageId,
      from: fromAgentId,
      to: toAgentId,
      timestamp,
      priority, // low, normal, high, critical
      message: message.substring(0, 50), // Enforce 50 word limit
      type: toAgentId === 'ALL' ? 'broadcast' : 'direct'
    };

    const targetDir = toAgentId === 'ALL' ? this.broadcastsDir : this.messagesDir;
    const filename = `${timestamp.replace(/:/g, '-')}-${messageId}.json`;
    
    fs.writeFileSync(path.join(targetDir, filename), JSON.stringify(messageData, null, 2));
    
    return messageId;
  }

  // Read messages for specific agent
  readMessages(agentId) {
    const messages = [];
    
    // Read direct messages
    if (fs.existsSync(this.messagesDir)) {
      const files = fs.readdirSync(this.messagesDir);
      files.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(this.messagesDir, file)));
          if (data.to === agentId || data.to === 'ALL') {
            messages.push(data);
          }
        } catch (e) {
          // Skip invalid files
        }
      });
    }

    // Read broadcasts
    if (fs.existsSync(this.broadcastsDir)) {
      const files = fs.readdirSync(this.broadcastsDir);
      files.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(this.broadcastsDir, file)));
          messages.push(data);
        } catch (e) {
          // Skip invalid files
        }
      });
    }

    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Send completion report with key findings
  sendReport(agentId, taskSummary, keyFindings, nextSteps = '') {
    const timestamp = new Date().toISOString();
    const reportId = crypto.randomBytes(4).toString('hex');
    
    const reportData = {
      id: reportId,
      agentId,
      timestamp,
      taskSummary: taskSummary.substring(0, 30),
      keyFindings: keyFindings.substring(0, 50),
      nextSteps: nextSteps.substring(0, 30),
      status: 'completed'
    };

    const filename = `report-${timestamp.replace(/:/g, '-')}-${reportId}.json`;
    fs.writeFileSync(path.join(this.reportsDir, filename), JSON.stringify(reportData, null, 2));
    
    // Also broadcast the report to other agents
    this.sendMessage(agentId, `Task completed: ${keyFindings}`, 'ALL', 'normal');
    
    return reportId;
  }

  // Read all reports
  readReports() {
    const reports = [];
    
    if (fs.existsSync(this.reportsDir)) {
      const files = fs.readdirSync(this.reportsDir);
      files.forEach(file => {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(this.reportsDir, file)));
          reports.push(data);
        } catch (e) {
          // Skip invalid files
        }
      });
    }

    return reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Clean old messages (older than 1 hour)
  cleanOldMessages() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const dirs = [this.messagesDir, this.broadcastsDir];
    
    dirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.mtime < oneHourAgo) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });
  }

  // Get communication status
  getStatus() {
    const messages = fs.existsSync(this.messagesDir) ? fs.readdirSync(this.messagesDir).length : 0;
    const broadcasts = fs.existsSync(this.broadcastsDir) ? fs.readdirSync(this.broadcastsDir).length : 0;
    const reports = fs.existsSync(this.reportsDir) ? fs.readdirSync(this.reportsDir).length : 0;
    
    return {
      activeMessages: messages,
      broadcasts: broadcasts,
      reports: reports,
      lastActivity: new Date().toISOString()
    };
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const comm = new AgentComm();
  const command = process.argv[2];
  
  switch (command) {
    case 'send':
      const [fromId, message, toId] = process.argv.slice(3);
      const messageId = comm.sendMessage(fromId, message, toId);
      console.log(`Message sent: ${messageId}`);
      break;
      
    case 'read':
      const [agentId] = process.argv.slice(3);
      const messages = comm.readMessages(agentId);
      console.log(JSON.stringify(messages, null, 2));
      break;
      
    case 'report':
      const [reportAgentId, summary, findings] = process.argv.slice(3);
      const reportId = comm.sendReport(reportAgentId, summary, findings);
      console.log(`Report sent: ${reportId}`);
      break;
      
    case 'status':
      console.log(JSON.stringify(comm.getStatus(), null, 2));
      break;
      
    case 'clean':
      comm.cleanOldMessages();
      console.log('Old messages cleaned');
      break;
      
    default:
      console.log(`Usage:
  node agent-comm.js send <from-id> <message> [to-id]
  node agent-comm.js read <agent-id>
  node agent-comm.js report <agent-id> <summary> <findings>
  node agent-comm.js status
  node agent-comm.js clean`);
  }
}

export default AgentComm;