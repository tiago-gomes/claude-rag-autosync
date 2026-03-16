#!/bin/bash
# Comando de sincronização RAG

MODE="${1:-status}"

case "$MODE" in
  status)
    echo "📊 Status do Sistema RAG Auto-Sync"
    echo "=================================="
    echo ""
    if [ -f ~/.claude/memory/rag-queue.json ]; then
      COUNT=$(cat ~/.claude/memory/rag-queue.json | grep -c "\"memory_type\"" || echo "0")
      echo "   📦 Pendentes: $COUNT"
    else
      echo "   📭 Fila vazia"
    fi
    echo ""
    if [ -x ~/.claude/hooks/post-response ]; then
      echo "   ✅ Hook ativo"
    else
      echo "   ❌ Hook inativo"
    fi
    ;;

  process)
    echo "🔄 Processando fila RAG..."
    node ~/.claude/memory/scripts/process-rag-queue.js process
    ;;

  clear)
    echo "🗑️ Limpando fila..."
    echo "[]" > ~/.claude/memory/rag-queue.json
    echo "✅ Fila limpa"
    ;;

  *)
    echo "Uso: $0 [status|process|clear]"
    echo "  status   - Mostra status"
    echo "  process  - Processa fila"
    echo "  clear    - Limpa fila"
    exit 1
    ;;
esac
