SELECT
  n.nspname AS schema_name,
  c.relname AS table_name,
  ROUND(c.reltuples)::bigint AS estimated_rows,
  array_agg(i.relname ORDER BY i.relname) AS secondary_index_names,
  COUNT(*) AS secondary_index_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_index idx ON idx.indrelid = c.oid AND NOT idx.indisprimary
JOIN pg_class i ON i.oid = idx.indexrelid
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.reltuples < 1000
GROUP BY n.nspname, c.relname, c.reltuples
ORDER BY c.reltuples ASC, c.relname;
