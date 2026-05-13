#!/bin/bash
# DevTeam Pipeline Helper
# Script para verificar el estado actual del pipeline

DEVTEAM_DIR="${DEVTTEAM_DIR:-/home/canfron/hermes/DevTeam}"

echo "🔧 DevTeam Pipeline Status — $(date '+%Y-%m-%d %H:%M')"
echo "======================================"
echo ""

# 1. Verificar estructura
echo "📁 Estructura:"
MISSING=""
for DIR in .spec .task_queue .context agents project; do
    if [ -d "$DEVTEAM_DIR/$DIR" ]; then
        echo "  ✅ $DIR/"
    else
        echo "  ❌ $DIR/ (NO EXISTE)"
        MISSING="$MISSING $DIR"
    fi
done
if [ -n "$MISSING" ]; then
    echo ""
    echo "  ⚠️ FALTAN directorios:$MISSING"
fi
echo ""

# 2. Verificar task queue
echo "📋 Task Queue:"
if [ -f "$DEVTEAM_DIR/.task_queue/tasks.md" ]; then
    grep -E "^\| " "$DEVTEAM_DIR/.task_queue/tasks.md" | while read line; do
        if echo "$line" | grep -q "done"; then
            echo "  ✅ $(echo "$line" | cut -d'|' -f 2 | x | cut -d'|' -f 2)"
        elif echo "$line" | grep -q "in-progress"; then
            echo "  🔵 $(echo "$line" | cut -d'|' -f 2 | xargs | cut -d'|' -f 2)"
        elif echo "$line" | grep -q "⏳"; then
            echo "  ⏳ $(echo "$line" | cut -d'|' -f 2 | xargs | cut -d'|' -f 2)"
        fi
    done
else
    echo "  ⚠️ tasks.md no encontrado"
fi
echo ""

# 3. Verificar specs
echo "📐 Specs:"
for FILE in requirements.md api-contract.md ui-contract.md architecture.md; do
    if [ -f "$DEVTEAM_DIR/.spec/$FILE" ]; then
        echo "  ✅ $FILE"
    else
        echo "  ❌ $FILE"
    fi
done
echo ""

# 4. Verificar project output
echo "📦 Project files:"
if [ -d "$DEVTEAM_DIR/project/" ]; then
    find "$DEVTEAM_DIR/project/" "project/" -type f -not -path "*/.git*" | while read f; do
        SIZE=$(stat -c%s "$f" 2>/dev/null || echo "?")
        echo "  📄 $(basename "$f") ($SIZE bytes)"
    done
else
    echo "  ⚠️ project/ no existe"
fi
echo ""

# 5. Verificar cron jobs
echo "🤖 Cron Jobs:"
for AGENT in orchestrator backend frontend qa devops; do
    JOB_ID=$(cronjob action='list' | grep -i "$AGENT" | head -1 | cut -d':' -f 1)
    if [ -n "$JOB_ID" ]; then
        echo "  ✅ $AGENT (job $JOB_ID)"
    else
        echo "  ❌ $AGENT (no cron job)"
    fi
done
echo ""
echo "======================================"
