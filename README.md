# 🧠 Claude RAG Auto-Sync

Sistema de memória contínua automática para Claude Code com integração RAG (Retrieval-Augmented Generation). Extrai, armazena e busca memórias semanticamente, reduzindo o uso de tokens em 90%+.

## 🎯 Características

- ✅ **Extração Automática**: Hook que analisa cada resposta e extrai memórias importantes
- ✅ **Busca Semântica**: Encontra memórias por contexto, não só por keywords
- ✅ **Multi-idioma**: Suporta Português e Inglês
- ✅ **Económico**: 90%+ de economia de tokens comparado com MEMORY.md no contexto
- ✅ **Escalável**: Suporta milhões de memórias sem degradação de performance
- ✅ **Inteligente**: Filtra memórias de baixa qualidade automaticamente

## 📊 Comparação

| Cenário | MEMORY.md | RAG Auto-Sync | Economia |
|---------|-----------|---------------|----------|
| 100 conversas | 200.000 tokens | 20.000 tokens | **90%** |
| 1000 conversas | 2.000.000 tokens | 200.000 tokens | **90%** |

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- Claude Code CLI
- MCP RAG server configurado

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/tiago-gomes/claude-rag-autosync.git
cd claude-rag-autosync
```

### Passo 2: Instalar dependências

```bash
cd ~/.claude/memory
npm install
```

### Passo 3: Configurar hooks

```bash
# Copiar hook pós-resposta
cp src/hooks/post-response ~/.claude/hooks/post-response
chmod +x ~/.claude/hooks/post-response
```

### Passo 4: Configurar scripts

```bash
# Copiar scripts para o diretório de memória
cp src/scripts/*.js ~/.claude/memory/scripts/
cp src/scripts/sync-rag.sh ~/.claude/memory/
chmod +x ~/.claude/memory/sync-rag.sh
```

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

### Sincronizar Manualmente

Na conversa com Claude, pede:

```
"Sincroniza o RAG"
"Processa a fila de memórias"
"Armazena as memórias pendentes"
```

### Buscar Memórias

```
"O que sabes sobre [tópico]?"
"Mostra memórias sobre [assunto]"
"Quais foram as últimas implementações?"
```

## 🧠 O Que É Extraído

### Implementações
- "Implementámos sistema de autenticação..."
- "Criámos handler para webhooks..."
- "Adicionámos suporte para subdomínios..."

### Corrections
- "Corrigi bug no RLS..."
- "Resolvemos problema de CORS..."
- "Arrumei layout mobile..."

### Arquitetura
- "Refatorei estrutura de hooks..."
- "Reestruturamos sistema de auth..."

### Configurações
- "Configurámos SMTP..."
- "Definimos variáveis de ambiente..."

## 📁 Estrutura do Projeto

```
claude-rag-autosync/
├── src/
│   ├── hooks/
│   │   └── post-response          # Hook automático
│   └── scripts/
│       ├── auto-memory-extractor.js    # Extrator de memórias
│       ├── process-rag-queue.js        # Processador de fila
│       └── sync-rag.sh                 # Comando de controle
├── docs/
│   └── AUTO-SYNC-GUIDE.md         # Guia detalhado
├── examples/
│   └── usage-examples.md          # Exemplos de uso
├── README.md
├── LICENSE
└── package.json
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

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Cria uma branch para a tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as tuas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abre um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - ver o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

**Tiago Gomes**

- GitHub: [@tiago-gomes](https://github.com/tiago-gomes)

## 🙏 Agradecimentos

- Claude Code team pela plataforma
- Comunidade MCP pelos servidores RAG

## 📄 Licença

[MIT](LICENSE)

---

**Feito com ❤️ por Tiago Gomes**
