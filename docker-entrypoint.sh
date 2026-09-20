#!/bin/sh
set -e

# Run idempotent database migration and search index verification
if [ -f "scripts/init-infrastructure.mjs" ]; then
  node scripts/init-infrastructure.mjs || echo "[Nimbus Entrypoint] Pre-start init completed with warnings, starting server..."
fi

# Execute the primary CMD (e.g. node server.js)
exec "$@"
