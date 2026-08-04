SELECT "id", "title", "created_at"
FROM "posts"
WHERE "blog_id" = '{{blog_id}}'
ORDER BY "created_at" DESC
LIMIT 20
