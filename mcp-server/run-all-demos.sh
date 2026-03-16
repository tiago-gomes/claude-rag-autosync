#!/bin/bash

# Quick Demo Runner - Executes all memory operations
# Run this anytime to see the RAG memory system in action

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                                "
echo "║   🚀 Memory RAG System - Live Demo                             "
echo "║                                                                "
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd ~/.claude/mcp-servers/memory-rag

echo "Running all memory operations..."
echo ""

# Run the main demo
node demo-memory-operations.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run the BarberProStudio demo
node demo-operations-2.js

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                                "
echo "║   ✅ All demos complete!                                       "
echo "║                                                                "
echo "║   Check ~/.claude/memory/episodic/ to see stored memories      "
echo "║                                                                "
echo "╚══════════════════════════════════════════════════════════════╝"
