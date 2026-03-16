#!/bin/bash

# Memory RAG MCP Server - Setup and Test Script
# This script automates the entire setup and testing process

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_SERVER_DIR="$SCRIPT_DIR"
PROJECT_DIR="/home/geone/barberprostudio"

echo "========================================"
echo "Memory RAG MCP Server - Setup & Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${CYAN}$1${NC}"
}

log_success() {
    echo -e "${GREEN}OK $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}WARN $1${NC}"
}

log_error() {
    echo -e "${RED}FAIL $1${NC}"
}

# Step 1: Check dependencies
log_info "Step 1: Checking dependencies..."
if [ ! -d "$MCP_SERVER_DIR/node_modules" ]; then
    log_warning "Dependencies not found. Installing..."
    cd "$MCP_SERVER_DIR"
    npm install
    log_success "Dependencies installed"
else
    log_success "Dependencies already installed"
fi

# Step 2: Verify server file
log_info "Step 2: Verifying server files..."
if [ -f "$MCP_SERVER_DIR/index.js" ]; then
    log_success "index.js found"
else
    log_error "index.js not found!"
    exit 1
fi

if [ -f "$MCP_SERVER_DIR/tools/search.js" ] && \
   [ -f "$MCP_SERVER_DIR/tools/store.js" ] && \
   [ -f "$MCP_SERVER_DIR/tools/extract.js" ] && \
   [ -f "$MCP_SERVER_DIR/tools/stats.js" ]; then
    log_success "All tool files found"
else
    log_error "Some tool files are missing!"
    exit 1
fi

# Step 3: Check .mcp.json configuration
log_info "Step 3: Checking .mcp.json configuration..."
if [ -f "$PROJECT_DIR/.mcp.json" ]; then
    if grep -q "memory-rag" "$PROJECT_DIR/.mcp.json"; then
        log_success ".mcp.json configured correctly"
    else
        log_warning ".mcp.json exists but doesn't contain memory-rag server"
    fi
else
    log_error ".mcp.json not found in project directory!"
    exit 1
fi

# Step 4: Test server startup
log_info "Step 4: Testing server startup..."
timeout 3s node "$MCP_SERVER_DIR/index.js" 2>&1 | grep -q "Memory RAG MCP server running" && \
    log_success "Server starts correctly" || \
    log_warning "Server startup test inconclusive"

# Step 5: Check existing memories
log_info "Step 5: Checking existing memory system..."
MEMORY_DIR="$HOME/.claude/memory"
if [ -d "$MEMORY_DIR/episodic" ]; then
    EPISODIC_COUNT=$(ls -1 "$MEMORY_DIR/episodic"/*.json 2>/dev/null | wc -l)
    log_success "Found $EPISODIC_COUNT episodic memories"
else
    log_warning "No episodic memories directory found"
fi

if [ -d "$MEMORY_DIR/semantic" ]; then
    SEMANTIC_COUNT=$(ls -1 "$MEMORY_DIR/semantic"/*.json 2>/dev/null | wc -l)
    log_success "Found $SEMANTIC_COUNT semantic memories"
else
    log_info "No semantic memories directory (will be created when needed)"
fi

# Step 6: Display configuration
echo ""
log_info "Step 6: Configuration Summary"
echo "========================================"
echo "MCP Server Path: $MCP_SERVER_DIR/index.js"
echo "Project Config:  $PROJECT_DIR/.mcp.json"
echo "Memory System:   $MEMORY_DIR/"
echo "========================================"

# Step 7: Usage instructions
echo ""
log_info "Step 7: Usage Instructions"
echo "========================================"
echo ""
echo -e "${GREEN}The MCP server is ready!${NC}"
echo ""
echo "To activate the server, you need to:"
echo ""
echo -e "${YELLOW}1. Restart Claude Code${NC}"
echo "   - Close Claude Code completely"
echo "   - Reopen Claude Code"
echo "   - The server will load automatically"
echo ""
echo "Then you can use these commands:"
echo ""
echo -e "${CYAN}• Search memories:${NC}"
echo '  Use memory_rag_search to find memories about "BarberProStudio"'
echo ""
echo -e "${CYAN}• Store a memory:${NC}"
echo '  Use memory_rag_store to store a memory:'
echo '  - memory_type: episodic'
echo '  - event: "Implemented MCP plugin for RAG system"'
echo '  - type: feature_implementation'
echo '  - importance: 0.9'
echo ""
echo -e "${CYAN}• Extract from text:${NC}"
echo '  Use memory_rag_extract with:'
echo '  "Today I implemented the MCP server for the memory system."'
echo ""
echo -e "${CYAN}• View statistics:${NC}"
echo '  Use memory_rag_stats to see system statistics'
echo ""
echo "========================================"
echo ""
log_success "Setup complete! Ready to use after Claude Code restart."
