# Memory RAG MCP Server

Model Context Protocol (MCP) server for Claude CLI's RAG (Retrieval-Augmented Generation) memory system.

## Overview

This MCP server exposes the existing RAG memory system (`~/.claude/memory/`) as MCP tools that can be used directly by Claude Code. It reuses the existing embedding service, memory store, and extraction logic.

## Features

- **Semantic Search**: Search memories using vector similarity
- **Memory Storage**: Store episodic and semantic memories
- **Automatic Extraction**: Extract memories from text using NLP patterns
- **Statistics**: View memory system statistics

## Tools

### memory_rag_search
Search memories semantically using RAG.

**Parameters:**
- `query` (string, required): Search query
- `top_k` (number, optional): Number of results (default: 2)
- `min_similarity` (number, optional): Minimum similarity 0-1 (default: 0.75)
- `include_episodic` (boolean, optional): Include episodic memories (default: true)
- `include_semantic` (boolean, optional): Include semantic memories (default: false)

### memory_rag_store
Store a new memory in the RAG system.

**Parameters:**
- `memory_type` (string, required): "episodic" or "semantic"
- `event` (string, optional): Event description (required for episodic)
- `entity` (string, optional): Entity name (required for semantic)
- `type` (string, optional): Memory subtype
- `description` (string, optional): Additional description
- `importance` (number, optional): Importance 0-1 (default: 0.5)
- `project` (string, optional): Associated project
- `related_entities` (array, optional): Related entities

### memory_rag_extract
Extract memories from text automatically using NLP.

**Parameters:**
- `text` (string, required): Text to analyze
- `project` (string, optional): Associated project
- `min_importance` (number, optional): Minimum importance 0-1 (default: 0.7)

### memory_rag_stats
Get statistics about the memory system.

**Parameters:** None

## Architecture

```
Claude Code (CLI)
       ↓
   MCP Protocol (stdio)
       ↓
Memory RAG MCP Server
       ↓
~/.claude/memory/ (existing RAG system)
```

## Dependencies

- Reuses existing code from `~/.claude/memory/scripts/lib/`:
  - `embeddings.js`: Embedding generation using Xenova transformers
  - `memory-store.js`: File-based memory storage and retrieval
- No duplicate dependencies - uses file:// imports for existing modules

## Installation

1. Install dependencies:
```bash
cd ~/.claude/mcp-servers/memory-rag
npm install
```

2. Register in project `.mcp.json`:
```json
{
  "mcpServers": {
    "memory-rag": {
      "command": "node",
      "args": ["/home/geone/.claude/mcp-servers/memory-rag/index.js"]
    }
  }
}
```

3. Restart Claude Code

## Usage Examples

### Search for memories
```
Use memory_rag_search to find memories about "BarberProStudio"
```

### Store a memory
```
Use memory_rag_store to store:
- memory_type: episodic
- event: "Implemented MCP plugin for RAG system"
- type: feature_implementation
- importance: 0.9
- project: Claude-CLI-Memory-System
```

### Extract from text
```
Use memory_rag_extract with:
"Today I implemented the MCP server for the memory system. It was challenging but I managed to get it working."
```

## Testing

Test the server directly:
```bash
cd ~/.claude/mcp-servers/memory-rag
npm run dev
```

You should see: `Memory RAG MCP server running on stdio`

## Files

- `index.js`: MCP server entry point
- `tools/search.js`: Semantic search implementation
- `tools/store.js`: Memory storage implementation
- `tools/extract.js`: NLP-based extraction
- `tools/stats.js`: Statistics gathering
- `package.json`: Dependencies and metadata

## License

MIT
