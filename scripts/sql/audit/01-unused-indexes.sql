SELECT
  psi.schemaname AS schema_name,
  psi.relname AS table_name,
  psi.indexrelname AS index_name,
  psi.idx_scan AS index_scans,
  pg_size_pretty(pg_relation_size(psi.indexrelid)) AS index_size
FROM pg_stat_user_indexes psi
JOIN pg_index pi ON pi.indexrelid = psi.indexrelid
WHERE NOT pi.indisprimary
ORDER BY psi.idx_scan ASC, pg_relation_size(psi.indexrelid) DESC;
