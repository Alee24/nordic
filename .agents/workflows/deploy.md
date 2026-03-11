---
description: how to deploy the application after a git push
---

Whenever I perform a `git push`, I must provide the user with the following command to run on their VPS to synchronize the changes:

```bash
bash vps-update.sh
```

Or the full combined command if the script isn't used:

```bash
git fetch --all && git reset --hard origin/booking-engine && docker compose up -d --build && npm install --legacy-peer-deps && npm run build && echo "Waiting for DB..." && sleep 15 && docker exec nordic_backend npx prisma db push --force-reset && docker exec nordic_backend npm run prisma:seed
```

### Steps captured:
1. Hard reset to origin/booking-engine.
2. Docker rebuild.
3. Frontend build (for Apache dist).
4. Prisma DB push (engine reset).
5. Seed (Admin/Room recovery).
