#!/usr/bin/env bash
# Keep-alive wrapper: restarts the Next.js dev server if it exits unexpectedly.
cd /home/z/my-project
while true; do
  echo "[keepalive] starting next dev at $(date -Iseconds)" >> /home/z/my-project/dev-keepalive.log
  bun run dev
  code=$?
  echo "[keepalive] next dev exited with code $code at $(date -Iseconds); restarting in 3s" >> /home/z/my-project/dev-keepalive.log
  sleep 3
done
