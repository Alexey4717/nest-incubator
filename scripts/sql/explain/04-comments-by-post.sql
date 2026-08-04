SELECT "id", "content", "created_at"
FROM "comments"
WHERE "post_id" = '{{post_id}}'
ORDER BY "created_at" DESC
LIMIT 20
