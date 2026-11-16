#!/bin/sh
set -e

mkdir -p /app/data /app/public/uploads

SECRETS_FILE="/app/data/.strapi-secrets.env"

# Generate and persist Strapi secrets on first boot if not explicitly passed via env
if [ ! -f "$SECRETS_FILE" ]; then
  node -e '
    const crypto = require("crypto");
    const fs = require("fs");
    const rand = (bytes = 32) => crypto.randomBytes(bytes).toString("base64");
    const lines = [
      `GENERATED_APP_KEYS="${rand()},${rand()}"`,
      `GENERATED_API_TOKEN_SALT="${rand()}"`,
      `GENERATED_ADMIN_JWT_SECRET="${rand()}"`,
      `GENERATED_TRANSFER_TOKEN_SALT="${rand()}"`,
      `GENERATED_JWT_SECRET="${rand()}"`,
      `GENERATED_ENCRYPTION_KEY="${rand()}"`
    ];
    fs.writeFileSync("/app/data/.strapi-secrets.env", lines.join("\n") + "\n", { mode: 0o600 });
  '
fi

# Load generated fallbacks
. "$SECRETS_FILE"

export APP_KEYS="${APP_KEYS:-$GENERATED_APP_KEYS}"
export API_TOKEN_SALT="${API_TOKEN_SALT:-$GENERATED_API_TOKEN_SALT}"
export ADMIN_JWT_SECRET="${ADMIN_JWT_SECRET:-$GENERATED_ADMIN_JWT_SECRET}"
export TRANSFER_TOKEN_SALT="${TRANSFER_TOKEN_SALT:-$GENERATED_TRANSFER_TOKEN_SALT}"
export JWT_SECRET="${JWT_SECRET:-$GENERATED_JWT_SECRET}"
export ENCRYPTION_KEY="${ENCRYPTION_KEY:-$GENERATED_ENCRYPTION_KEY}"

exec "$@"
