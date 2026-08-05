SELECT "device_id", "ip", "title", "last_active_date"
FROM "sessions"
WHERE "user_id" = (SELECT "id" FROM "users" WHERE "public_id" = '{{user_id}}')
ORDER BY "last_active_date" DESC
LIMIT {{limit}}
