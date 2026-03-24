# 文枢AI Launch Checklist

## Environment

- Set `apps/api/.env` from `apps/api/.env.example`
- Set `apps/web/.env.local` from `apps/web/.env.example`
- Confirm `JWT_SECRET` is rotated away from the default value
- Confirm production `DATABASE_URL` and API keys are present

## Infrastructure

- Start PostgreSQL and Redis with [infra/docker-compose.yml](/Users/ze/Desktop/AI-writer/infra/docker-compose.yml)
- Apply Prisma migration in production before first deploy
- Verify database backup strategy and restore drill
- Verify object storage bucket and CORS settings

## Product Readiness

- Login flow verified end-to-end
- Novel create/edit/export verified
- Chapter autosave verified
- AI generation verified with production provider keys
- Sensitive-word scan verified on both manual text and AI output
- Membership quota behavior verified for free and member accounts

## Observability

- Enable request logs on API
- Confirm health endpoint is monitored
- Confirm frontend environment points to correct API base URL
- Capture AI generation failures and quota failures in logs

## Compliance

- Review sensitive-word dictionary and moderation fallback
- Publish privacy policy and user agreement
- Add AI-generated content disclaimer in product UI before launch
