#!/bin/bash

# Agent Communication Helper Script
# Simplified interface for inter-agent communication

COMM_SCRIPT=".agent-comm/agent-comm.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate agent ID from current context
generate_agent_id() {
    echo "agent-$(date +%s | tail -c 5)"
}

# Send critical message to all agents
broadcast_critical() {
    local agent_id="$1"
    local message="$2"
    echo -e "${RED}[CRITICAL BROADCAST]${NC} $message"
    node "$COMM_SCRIPT" send "$agent_id" "$message" ALL
}

# Send high priority message to specific agent
send_high_priority() {
    local agent_id="$1"
    local message="$2"
    local target="$3"
    echo -e "${YELLOW}[HIGH PRIORITY]${NC} To: $target - $message"
    node "$COMM_SCRIPT" send "$agent_id" "$message" "$target"
}

# Send normal message
send_message() {
    local agent_id="$1"
    local message="$2"
    local target="${3:-ALL}"
    echo -e "${BLUE}[MESSAGE]${NC} To: $target - $message"
    node "$COMM_SCRIPT" send "$agent_id" "$message" "$target"
}

# Send completion report
send_report() {
    local agent_id="$1"
    local task="$2"
    local findings="$3"
    echo -e "${GREEN}[REPORT]${NC} Task: $task - $findings"
    node "$COMM_SCRIPT" report "$agent_id" "$task" "$findings"
}

# Read messages for agent
read_messages() {
    local agent_id="$1"
    echo -e "${BLUE}[READING MESSAGES]${NC} For agent: $agent_id"
    node "$COMM_SCRIPT" read "$agent_id"
}

# Show communication status
show_status() {
    echo -e "${GREEN}[COMM STATUS]${NC}"
    node "$COMM_SCRIPT" status
}

# Clean old messages
clean_messages() {
    echo -e "${YELLOW}[CLEANING]${NC} Removing old messages..."
    node "$COMM_SCRIPT" clean
}

# Main command dispatcher
case "$1" in
    "critical")
        broadcast_critical "$2" "$3"
        ;;
    "high")
        send_high_priority "$2" "$3" "$4"
        ;;
    "send")
        send_message "$2" "$3" "$4"
        ;;
    "report")
        send_report "$2" "$3" "$4"
        ;;
    "read")
        read_messages "$2"
        ;;
    "status")
        show_status
        ;;
    "clean")
        clean_messages
        ;;
    "id")
        generate_agent_id
        ;;
    *)
        echo -e "${GREEN}Agent Communication System${NC}"
        echo ""
        echo "Usage:"
        echo "  $0 id                              # Generate agent ID"
        echo "  $0 critical <agent-id> <message>  # Broadcast critical message"
        echo "  $0 high <agent-id> <message> <target> # Send high priority message"
        echo "  $0 send <agent-id> <message> [target] # Send normal message"
        echo "  $0 report <agent-id> <task> <findings> # Send completion report"
        echo "  $0 read <agent-id>                 # Read messages for agent"
        echo "  $0 status                          # Show system status"
        echo "  $0 clean                           # Clean old messages"
        echo ""
        echo "Examples:"
        echo "  $0 critical agent-123 'Build failing - TypeScript errors'"
        echo "  $0 high agent-123 'Security vuln found' agent-456"
        echo "  $0 report agent-123 'Code review' 'Found 3 bugs, all fixed'"
        ;;
esac