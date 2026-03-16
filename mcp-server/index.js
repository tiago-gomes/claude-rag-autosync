#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { memoryRAGSearch } from './tools/search.js';
import { memoryRAGStore } from './tools/store.js';
import { memoryRAGExtract } from './tools/extract.js';
import { memoryRAGStats } from './tools/stats.js';

// Create MCP server
const server = new Server(
  {
    name: 'memory-rag-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'memory_rag_search',
        description: 'Search memories semantically using RAG (Retrieval-Augmented Generation)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for finding relevant memories'
            },
            top_k: {
              type: 'number',
              description: 'Number of results to return (default: 2)',
              default: 2
            },
            min_similarity: {
              type: 'number',
              description: 'Minimum similarity score (0-1, default: 0.75)',
              default: 0.75
            },
            include_episodic: {
              type: 'boolean',
              description: 'Include episodic memories (default: true)',
              default: true
            },
            include_semantic: {
              type: 'boolean',
              description: 'Include semantic memories (default: false)',
              default: false
            }
          },
          required: ['query']
        }
      },
      {
        name: 'memory_rag_store',
        description: 'Store a new memory in the RAG system',
        inputSchema: {
          type: 'object',
          properties: {
            memory_type: {
              type: 'string',
              enum: ['episodic', 'semantic'],
              description: 'Type of memory to store'
            },
            event: {
              type: 'string',
              description: 'Event description (required for episodic)'
            },
            entity: {
              type: 'string',
              description: 'Entity name (required for semantic)'
            },
            type: {
              type: 'string',
              description: 'Memory subtype (e.g., feature_implementation, deployment)'
            },
            description: {
              type: 'string',
              description: 'Additional description'
            },
            importance: {
              type: 'number',
              description: 'Importance score (0-1, default: 0.5)',
              default: 0.5
            },
            project: {
              type: 'string',
              description: 'Associated project name'
            },
            related_entities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Related entities (files, components, etc.)'
            }
          },
          required: ['memory_type']
        }
      },
      {
        name: 'memory_rag_extract',
        description: 'Extract memories from text automatically using NLP',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to analyze and extract memories from'
            },
            project: {
              type: 'string',
              description: 'Associated project name'
            },
            min_importance: {
              type: 'number',
              description: 'Minimum importance score (0-1, default: 0.7)',
              default: 0.7
            }
          },
          required: ['text']
        }
      },
      {
        name: 'memory_rag_stats',
        description: 'Get statistics about the memory system',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'memory_rag_search':
        return { content: [{ type: 'text', text: JSON.stringify(await memoryRAGSearch(args), null, 2) }] };

      case 'memory_rag_store':
        return { content: [{ type: 'text', text: JSON.stringify(await memoryRAGStore(args), null, 2) }] };

      case 'memory_rag_extract':
        return { content: [{ type: 'text', text: JSON.stringify(await memoryRAGExtract(args), null, 2) }] };

      case 'memory_rag_stats':
        return { content: [{ type: 'text', text: JSON.stringify(await memoryRAGStats(), null, 2) }] };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: error.message }, null, 2) }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Memory RAG MCP server running on stdio');
}

main().catch(console.error);
