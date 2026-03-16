# 📚 Exemplos de Uso - Claude RAG Auto-Sync

## Exemplo 1: Implementação de Funcionalidade

### Conversa
```
Tu: "Adiciona autenticação com Supabase Auth"

Claude: [Implementa sistema completo de autenticação]
```

### O que acontece
1. Hook analisa a resposta
2. Extrai memória: "Implementámos sistema de autenticação com Supabase Auth"
3. Armazena na fila
4. Tu pedes "sincroniza o RAG"
5. Memória fica disponível para buscas futuras

### Busca futura
```
Tu: "O que sabes sobre autenticação?"

Claude: [Encontra memória e responde com contexto completo]
```

---

## Exemplo 2: Correção de Bug

### Conversa
```
Tu: "O RLS não está a funcionar corretamente"

Claude: [Identifica e corrige o problema]
```

### Memória extraída
- Tipo: `bug_fix`
- Evento: "Corrigi bug no RLS que permitia acesso cross-tenant"
- Importância: 0.8

---

## Exemplo 3: Configuração

### Conversa
```
Tu: "Configura email SMTP para notificações"

Claude: [Configura SMTP em global_reminder_settings]
```

### Memória extraída
- Tipo: `configuration`
- Evento: "Configurámos SMTP mail.barberprostudio.com:465 para notificações"
- Entidades: ["SMTP", "global_reminder_settings"]

---

## Exemplo 4: Busca Semântica

### Pergunta
```
"Como funciona o sistema de email?"
```

### Resultados
- ✅ Confirmação de booking (handleStripeWebhook)
- ✅ Lembretes 24h/1h (handleProcessReminders)
- ✅ Cancelamento (handleCancelAppointment)
- ✅ Reembolso (handleRefundPayment)

---

## Exemplo 5: Multi-idioma

### Português
```
"Implementámos sistema de pagamentos"
→ Memória extraída ✅
```

### Inglês
```
"We implemented payment system"
→ Memória extraída ✅
```

---

## Exemplo 6: Workflow Completo

### 1. Sessão de Trabalho
```
Tu: "Adiciona X"
Claude: [implementa]

Tu: "Corrige Y"
Claude: [corrige]

Tu: "Refactora Z"
Claude: [refactor]
```

### 2. Ver Fila
```bash
~/.claude/memory/sync-rag.sh status
# 📦 Pendentes: 7
```

### 3. Sincronizar
```
Tu: "Sincroniza o RAG"
Claude: ✅ 7 memórias armazenadas!
```

### 4. Buscar Depois
```
Tu: "O que fizemos na última sessão?"
Claude: [Responde com todas as memórias]
```

---

## Dicas de Uso

### ✅ Boas Práticas
- Sincroniza regularmente (depois de sessões longas)
- Usa perguntas específicas para buscas mais precisas
- Verifica a fila antes de sincronizar

### ❌ Evitar
- Sincronizar a cada mensagem (desnecessário)
- Buscas muito genéricas ("O que sabes?")
- Ignorar estatísticas do sistema

---

## Comandos Úteis

```bash
# Ver status
~/.claude/memory/sync-rag.sh status

# Processar fila
~/.claude/memory/sync-rag.sh process

# Limpar fila
~/.claude/memory/sync-rag.sh clear
```

---

*Para mais informações, ver [AUTO-SYNC-GUIDE.md](../docs/AUTO-SYNC-GUIDE.md)*
