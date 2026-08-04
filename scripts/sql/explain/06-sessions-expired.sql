DELETE FROM "sessions"
WHERE "last_active_date" < '{{expired_before}}'
