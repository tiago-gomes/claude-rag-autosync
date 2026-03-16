# 🚀 Guia de Instalação Completa - Claude RAG Auto-Sync

Este guia explica como instalar e configurar o sistema completo de memória RAG para Claude Code.

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Claude Code CLI** ([Instalar](https://claude.ai/claude-code))
- **Git** ([Download](https://git-scm.com/))
- **npm** (vem com Node.js)

## 🔧 Instalação Passo a Passo

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/tiago-gomes/claude-rag-autosync.git
cd claude-rag-autosync
```

### Passo 2: Instalar o Servidor MCP RAG

O servidor MCP RAG é o componente principal que permite armazenar e buscar memórias semanticamente.

```bash
# Entrar no diretório do servidor MCP
cd mcp-server

# Instalar dependências
npm install

# Voltar ao diretório principal
cd ..
```

### Passo 3: Configurar o Claude Code

#### 3.1. Criar/Abrir configuração MCP

O Claude Code usa um arquivo `mcp.json` para configurar servidores MCP.

```bash
# Criar arquivo de configuração
nano ~/.claude/mcp.json
```

#### 3.2. Adicionar configuração do servidor RAG

```json
{
  "mcpServers": {
    "memory-rag": {
      "command": "node",
      "args": [
        "/caminho/absoluto/para/claude-rag-autosync/mcp-server/index.js"
      ]
    }
  }
}
```

**Substituir** `/caminho/absoluto/para/` pelo caminho onde clonaste o repositório.

**Exemplo**:
```json
{
  "mcpServers": {
    "memory-rag": {
      "command": "node",
      "args": [
        "/home/usuario/claude-rag-autosync/mcp-server/index.js"
      ]
    }
  }
}
```

#### 3.3. Obter caminho absoluto (fácil)

```bash
# No diretório do repositório
pwd
```

### Passo 4: Instalar Hooks de Auto-Extração

```bash
# Copiar hook pós-resposta
cp src/hooks/post-response ~/.claude/hooks/post-response
chmod +x ~/.claude/hooks/post-response

# Copiar scripts de processamento
mkdir -p ~/.claude/memory/scripts
cp src/scripts/*.js ~/.claude/memory/scripts/
chmod +x ~/.claude/memory/scripts/*.js

# Copiar script de controle
cp src/scripts/sync-rag.sh ~/.claude/memory/
chmod +x ~/.claude/memory/sync-rag.sh
```

### Passo 5: Testar a Instalação

#### 5.1. Verificar se o servidor MCP está a funcionar

```bash
# No diretório mcp-server
cd mcp-server
npm test
```

**Output esperado**:
```
✅ MCP RAG Server is running
✅ Available tools: store, search, extract, stats
```

#### 5.2. Verificar hooks

```bash
~/.claude/memory/sync-rag.sh status
```

**Output esperado**:
```
📊 Status do Sistema RAG Auto-Sync
==================================

   📭 Fila vazia

   ✅ Hook ativo
```

## 🎯 Primeiro Uso

### 1. Iniciar o Claude Code

```bash
claude
```

### 2. Verificar se o servidor MCP está conectado

Na conversa, pergunta:
```
"Quais ferramentas MCP estão disponíveis?"
```

Deverias ver:
- `memory_rag_store`
- `memory_rag_search`
- `memory_rag_extract`
- `memory_rag_stats`

### 3. Armazenar uma memória de teste

```
"Lembra que instalei o sistema RAG hoje"
```

### 4. Buscar a memória

```
"O que sabes sobre RAG?"
```

## 🔧 Solução de Problemas

### Problema: "Servidor MCP não encontrado"

**Solução**:
1. Verificar o caminho em `~/.claude/mcp.json`
2. Usar caminho absoluto (não relativo)
3. Verificar se executaste `npm install` no diretório `mcp-server`

### Problema: "Hook não funciona"

**Solução**:
1. Verificar permissões: `ls -la ~/.claude/hooks/post-response`
2. Deve ser executável: `-rwxr-xr-x`
3. Se não, executar: `chmod +x ~/.claude/hooks/post-response`

### Problema: "Memórias não são armazenadas"

**Solução**:
1. Verificar se o servidor MCP está a correr
2. Verificar configuração em `~/.claude/mcp.json`
3. Ver logs do servidor: `cd mcp-server && npm test`

### Problema: "Erro: Cannot find module"

**Solução**:
```bash
cd mcp-server
rm -rf node_modules package-lock.json
npm install
```

## 📚 Estrutura de Diretórios

Após instalação, terás:

```
~/.claude/
├── mcp.json                          # Configuração MCP
├── hooks/
│   └── post-response                 # Hook automático
└── memory/
    ├── scripts/
    │   ├── auto-memory-extractor.js  # Extrator
    │   ├── process-rag-queue.js      # Processador
    │   └── sync-rag.sh               # Controle
    ├── episodic/                     # Memórias episódicas
    ├── semantic/                     # Memórias semânticas
    └── vector/                       # Vector DB

/caminho/para/claude-rag-autosync/
└── mcp-server/
    ├── index.js                      # Servidor MCP
    ├── tools/                        # Ferramentas RAG
    ├── lib/                          # Bibliotecas
    └── node_modules/                 # Dependências
```

## ✅ Verificação Completa

Executa este comando para verificar tudo:

```bash
echo "=== Verificação de Instalação ===" && \
echo "" && \
echo "1. Node.js:" && node --version && \
echo "" && \
echo "2. Servidor MCP:" && ls -lh mcp-server/index.js && \
echo "" && \
echo "3. Dependências MCP:" && ls -d mcp-server/node_modules && \
echo "" && \
echo "4. Configuração MCP:" && cat ~/.claude/mcp.json && \
echo "" && \
echo "5. Hooks:" && ls -lh ~/.claude/hooks/post-response && \
echo "" && \
echo "6. Scripts:" && ls -lh ~/.claude/memory/scripts/*.js && \
echo "" && \
echo "✅ Verificação completa!"
```

## 🎉 Pronto!

Após seguir estes passos, terás o sistema completo de memória RAG a funcionar:

- ✅ Servidor MCP RAG ativo
- ✅ Hooks de auto-extração configurados
- ✅ Sistema de busca semântica funcional
- ✅ 90%+ de economia de tokens

**Próximo passo**: Ver [EXEMPLOS DE USO](examples/usage-examples.md)

---

*Precisas de ajuda? Abre uma issue em [GitHub Issues](https://github.com/tiago-gomes/claude-rag-autosync/issues)*
