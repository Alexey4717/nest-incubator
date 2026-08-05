SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  array_agg(i.relname ORDER BY i.relname) AS duplicate_index_names,
  COUNT(*) AS duplicate_count
FROM pg_index idx
JOIN pg_class c ON c.oid = idx.indrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_class i ON i.oid = idx.indexrelid
WHERE n.nspname = 'public'
GROUP BY n.nspname, c.relname, idx.indrelid, idx.indkey
HAVING COUNT(*) > 1
ORDER BY c.relname;
