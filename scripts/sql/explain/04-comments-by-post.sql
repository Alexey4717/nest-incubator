SELECT "public_id" AS "id", "content", "created_at"
FROM "comments"
WHERE "post_id" = (SELECT "id" FROM "posts" WHERE "public_id" = '{{post_id}}')
ORDER BY "created_at" DESC
LIMIT 20
