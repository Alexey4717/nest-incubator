SELECT *
FROM "users"
WHERE "confirmation_code" = '00000000-0000-0000-0000-000000000001'
  AND "confirmation_code" IS NOT NULL
