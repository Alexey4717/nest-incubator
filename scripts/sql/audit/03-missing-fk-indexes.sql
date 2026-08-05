WITH fk_columns AS (
  SELECT
    n.nspname AS schema_name,
    cl.relname AS table_name,
    att.attname AS column_name,
    ref_cl.relname AS referenced_table
  FROM pg_constraint con
  JOIN pg_class cl ON cl.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = cl.relnamespace
  JOIN pg_attribute att
    ON att.attrelid = con.conrelid
   AND att.attnum = ANY (con.conkey)
   AND NOT att.attisdropped
  JOIN pg_class ref_cl ON ref_cl.oid = con.confrelid
  WHERE con.contype = 'f'
    AND n.nspname = 'public'
),
unindexed_fk AS (
  SELECT
    fk.schema_name,
    fk.table_name,
    fk.column_name,
    fk.referenced_table,
    'foreign_key' AS issue_type
  FROM fk_columns fk
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_index idx
    JOIN pg_class tc ON tc.oid = idx.indrelid
    JOIN pg_namespace tn ON tn.oid = tc.relnamespace
    JOIN pg_attribute ta
      ON ta.attrelid = tc.oid
     AND ta.attnum = idx.indkey[0]
     AND NOT ta.attisdropped
    WHERE tn.nspname = fk.schema_name
      AND tc.relname = fk.table_name
      AND ta.attname = fk.column_name
  )
),
orphan_id_columns AS (
  SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    a.attname AS column_name,
    NULL::text AS referenced_table,
    'no_fk_no_index' AS issue_type
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_attribute a ON a.attrelid = c.oid AND NOT a.attisdropped
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND a.attname ~ '_id$'
    AND a.attname <> 'public_id'
    AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint con
      WHERE con.conrelid = c.oid
        AND con.contype = 'f'
        AND a.attnum = ANY (con.conkey)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM pg_index idx
      JOIN pg_attribute ta
        ON ta.attrelid = c.oid
       AND ta.attnum = idx.indkey[0]
       AND NOT ta.attisdropped
      WHERE idx.indrelid = c.oid
        AND ta.attname = a.attname
    )
)
SELECT
  schema_name,
  table_name,
  column_name,
  referenced_table,
  issue_type
FROM unindexed_fk
UNION ALL
SELECT
  schema_name,
  table_name,
  column_name,
  referenced_table,
  issue_type
FROM orphan_id_columns
ORDER BY issue_type, table_name, column_name;
