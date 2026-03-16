# 🧠 Claude RAG Auto-Sync

Sistema completo de memória contínua automática para Claude Code com integração RAG (Retrieval-Augmented Generation). Inclui servidor MCP RAG + hooks de auto-extração. Reduz o uso de tokens em 90%+.

## 🎯 Características

- ✅ **Servidor MCP RAG Completo**: Busca semântica, armazenamento e extração de memórias
- ✅ **Extração Automática**: Hook que analisa cada resposta e extrai memórias importantes
- ✅ **Busca Semântica**: Encontra memórias por contexto, não só por keywords
- ✅ **Multi-idioma**: Suporta Português e Inglês
- ✅ **Económico**: 90%+ de economia de tokens comparado com MEMORY.md no contexto
- ✅ **Escalável**: Suporta milhões de memórias sem degradação de performance
- ✅ **Inteligente**: Filtra memórias de baixa qualidade automaticamente
- ✅ **Fácil de Instalar**: Guia passo a passo completo

## 📦 O Que Está Incluído

| Componente | Descrição |
|------------|-----------|
| **MCP RAG Server** | Servidor completo para armazenamento e busca semântica |
| **Auto-Extractor** | Hook que extrai memórias automaticamente das respostas |
| **Queue Processor** | Sistema de fila para processamento em lote |
| **CLI Tools** | Scripts para controle e monitorização |
| **Documentação** | Guias de instalação e uso completos |

## 📊 Comparação

| Cenário | MEMORY.md | RAG Auto-Sync | Economia |
|---------|-----------|---------------|----------|
| 100 conversas | 200.000 tokens | 20.000 tokens | **90%** |
| 1000 conversas | 2.000.000 tokens | 200.000 tokens | **90%** |
| 10000 conversas | 20.000.000 tokens ❌ | 2.000.000 tokens | **90%** ✅ |

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 18+
- Claude Code CLI
- npm

### 1. Clonar o Repositório

```bash
git clone https://github.com/tiago-gomes/claude-rag-autosync.git
cd claude-rag-autosync
```

### 2. Instalar Servidor MCP

```bash
cd mcp-server
npm install
```

### 3. Configurar Claude Code

Criar ou editar `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "memory-rag": {
      "command": "node",
      "args": ["$(pwd)/mcp-server/index.js"]
    }
  }
}
```

**⚠️ Importante**: Substituir `$(pwd)` pelo caminho absoluto completo.

### 4. Instalar Hooks

```bash
# Copiar hook
cp src/hooks/post-response ~/.claude/hooks/post-response
chmod +x ~/.claude/hooks/post-response

# Copiar scripts
mkdir -p ~/.claude/memory/scripts
cp src/scripts/*.js ~/.claude/memory/scripts/
chmod +x ~/.claude/memory/scripts/*.js

# Copiar script de controle
cp src/scripts/sync-rag.sh ~/.claude/memory/
chmod +x ~/.claude/memory/sync-rag.sh
```

### 5. Testar

```bash
# Testar servidor MCP
cd mcp-server
npm test

# Verificar hooks
~/.claude/memory/sync-rag.sh status
```

## 📖 Documentação Completa

- **[Guia de Instalação Completo](MCP-INSTALLATION.md)** - Instruções detalhadas passo a passo
- **[Guia do Sistema Auto-Sync](docs/AUTO-SYNC-GUIDE.md)** - Como funciona o sistema automático
- **[Exemplos de Uso](examples/usage-examples.md)** - Exemplos práticos
- **[README do Servidor MCP](mcp-server/README.md)** - Documentação técnica do servidor

## 📖 Como Usar

### Uso Automático

O sistema funciona automaticamente em segundo plano:

1. Tu fazes uma pergunta ao Claude
2. Claude responde
3. Hook analisa a resposta e extrai memórias importantes
4. Memórias são adicionadas à fila
5. Tu pedes "sincroniza o RAG"
6. Claude armazena as memórias no RAG

### Ver Status

```bash
~/.claude/memory/sync-rag.sh status
```

### Buscar Memórias

Na conversa com Claude:

```
"O que sabes sobre [tópico]?"
"Mostra memórias sobre [assunto]"
"Quais foram as últimas implementações?"
```

## 🧠 O Que É Extraído Automaticamente

### Implementações ✨
- "Implementámos sistema de autenticação..."
- "Criámos handler para webhooks..."
- "Adicionámos suporte para subdomínios..."

### Corrections 🐛
- "Corrigi bug no RLS..."
- "Resolvemos problema de CORS..."
- "Arrumei layout mobile..."

### Arquitetura 🏗️
- "Refatorei estrutura de hooks..."
- "Reestruturamos sistema de auth..."

### Configurações ⚙️
- "Configurámos SMTP..."
- "Definimos variáveis de ambiente..."

## 📁 Estrutura do Projeto

```
claude-rag-autosync/
├── mcp-server/                 # 🔧 Servidor MCP RAG
│   ├── index.js               # Servidor principal
│   ├── tools/                 # Ferramentas MCP (store, search, extract, stats)
│   ├── lib/                   # Bibliotecas internas
│   ├── package.json           # Dependências
│   └── README.md              # Documentação do servidor
├── src/
│   ├── hooks/
│   │   └── post-response      # Hook automático
│   └── scripts/
│       ├── auto-memory-extractor.js  # Extrator de memórias
│       ├── process-rag-queue.js      # Processador de fila
│       └── sync-rag.sh               # Comando de controle
├── docs/
│   └── AUTO-SYNC-GUIDE.md     # Guia detalhado do sistema
├── examples/
│   └── usage-examples.md      # Exemplos práticos
├── MCP-INSTALLATION.md         # 📖 Guia de instalação completo
├── README.md                   # Este arquivo
├── LICENSE                     # Licença MIT
└── package.json               # Metadados do projeto
```

## 🔧 Configuração

### Configurar Extração

Edite `src/scripts/auto-memory-extractor.js` para personalizar:

- Padrões de extração (linhas 25-50)
- Threshold de importância (linhas 120-130)
- Tecnologias reconhecidas (linha 60)

### Configurar Busca

O sistema RAG usa estes parâmetros:

- `top_k`: Número de resultados (default: 2)
- `min_similarity`: Similaridade mínima (default: 0.75)
- `embedding_model`: Modelo de embeddings (default: Xenova/all-MiniLM-L6-v2)

## 📈 Estatísticas

Ver estatísticas do sistema:

```bash
# Via CLI
~/.claude/memory/sync-rag.sh status

# Via Claude
"Mostra as estatísticas do RAG"
```

**Exemplo de output**:
```
📊 Status do Sistema RAG Auto-Sync
==================================

   📦 Pendentes: 4
   ✅ Hook ativo

   Total memórias: 30
   Episódicas: 19
   Semânticas: 11
   Vector DB: 0.68MB
```

## 🎨 Demonstração

### Antes (Sem RAG)
```
Tu: "O que sabes sobre o sistema de email?"
Claude: [Resposta genérica sem contexto específico]
Tokens: 2.000 (MEMORY.md completo carregado)
```

### Depois (Com RAG)
```
Tu: "O que sabes sobre o sistema de email?"
Claude: [Responde com contexto preciso das memórias relevantes]
- SMTP: mail.barberprostudio.com:465
- 6 handlers ativos (confirmação, cancelamento, etc.)
- Credenciais em global_reminder_settings
Tokens: 200 (só 2 memórias relevantes)
Economia: 90%
```

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Cria uma branch para a tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as tuas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abre um Pull Request

## 🐛 Problemas?

Encontraste um bug? Tens sugestões?

- [Abre uma issue](https://github.com/tiago-gomes/claude-rag-autosync/issues)
- Ver a [documentação de troubleshooting](MCP-INSTALLATION.md#solução-de-problemas)

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - ver o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**Tiago Gomes**

- GitHub: [@tiago-gomes](https://github.com/tiago-gomes)

## 🙏 Agradecimentos

- Claude Code team pela plataforma incrível
- Comunidade MCP pelo protocolo Model Context
- Todos os contribuidores de código aberto

## 🌟 Se isto te ajudou

Dá uma ⭐ ao repositório!

---

**Feito com ❤️ por Tiago Gomes**
