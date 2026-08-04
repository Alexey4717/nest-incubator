SELECT "id", "name", "created_at"
FROM "blogs"
WHERE "name" = '{{blog_name}}'
LIMIT 1
