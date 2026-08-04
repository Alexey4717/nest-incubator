SELECT *
FROM "users"
WHERE "login" = '{{target_login_or_email}}'
   OR "email" = '{{target_login_or_email}}'
LIMIT 1
