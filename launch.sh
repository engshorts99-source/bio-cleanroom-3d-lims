#!/usr/bin/env bash

# BioClean 3D LIMS - One-Click Launcher for macOS
# Automatically launches Vite dev server if not running and opens browser

export PATH="/Users/pjw/.nvm/versions/node/v24.15.0/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

PROJECT_DIR="/Users/pjw/.gemini/antigravity/scratch/bio-cleanroom-3d-lims"
cd "$PROJECT_DIR" || exit 1

PORT=5173
URL="http://localhost:$PORT"

# Check if server is already responding
if curl -s --head --request GET "$URL" | grep "200 OK" > /dev/null 2>&1; then
    open "$URL"
    exit 0
fi

# Check if port 5173 is already listening
if lsof -i :$PORT > /dev/null 2>&1; then
    open "$URL"
    exit 0
fi

# Start Vite dev server in background and log to a file
npm run dev > "$PROJECT_DIR/.server.log" 2>&1 &
SERVER_PID=$!

# Wait up to 10 seconds for the server to spin up
for i in {1..20}; do
    if lsof -i :$PORT > /dev/null 2>&1; then
        sleep 0.4
        open "$URL"
        exit 0
    fi
    sleep 0.3
done

# Fallback open
open "$URL"
