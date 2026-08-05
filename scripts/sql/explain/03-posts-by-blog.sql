SELECT "public_id" AS "id", "title", "created_at"
FROM "posts"
WHERE "blog_id" = (SELECT "id" FROM "blogs" WHERE "public_id" = '{{blog_id}}')
ORDER BY "created_at" DESC
LIMIT 20
