SELECT "device_id", "ip", "title", "last_active_date"
FROM "sessions"
WHERE "user_id" = '{{user_id}}'
