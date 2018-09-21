const { execSql } = require('./databroker');

const _getForeignTables = ({ config, table_name, table_schema, asProvider }) =>
  execSql({ config, sql:`
    Declare @T Table (
        PKTABLE_QUALIFIER sysname,
        PKTABLE_OWNER sysname,
        PKTABLE_NAME sysname,
        PKCOLUMN_NAME sysname,
        FKTABLE_QUALIFIER sysname,
        FKTABLE_OWNER sysname,
        FKTABLE_NAME sysname,
        FKCOLUMN_NAME sysname,
        KEY_SEQ smallint,
        UPDATE_RULE smallint,
        DELETE_RULE smallint,
        FK_NAME sysname,
        PK_NAME sysname,
        DEFERRABILITY smallint
    )
    ${
      asProvider ?
        `Insert @T EXEC sp_fkeys @pktable_name = '${table_name}', @pktable_owner = '${table_schema}'` :
        `Insert @T EXEC sp_fkeys @fktable_name = '${table_name}', @fktable_owner = '${table_schema}'`
    }
    SELECT
    (
      SELECT
        PKTABLE_OWNER As pkTableSchema,
        PKTABLE_NAME As pkTableName,
        PKCOLUMN_NAME As pkColumnName,
        FKTABLE_OWNER As fkTableSchema,
        FKTABLE_NAME As fkTableName,
        FKCOLUMN_NAME As fkColumName
        FOR json path,
          without_array_wrapper,
          INCLUDE_NULL_VALUES
    )
    FROM @T
  `});

const getProviderTables = ({ ...args }) => 
  _getForeignTables({...args, asProvider: false });

const getDependentTables = ({ ...args }) =>
  _getForeignTables({...args, asProvider: true });

const getTables = ({ config, filterToTable }) =>
  execSql({ config, sql:`
    SELECT
    (
      SELECT a.table_name, a.table_schema FOR json path, without_array_wrapper
    )
    FROM
      information_schema.tables a
      LEFT OUTER JOIN INFORMATION_SCHEMA.VIEWS b ON a.TABLE_CATALOG = b.TABLE_CATALOG
        AND a.TABLE_SCHEMA = b.TABLE_SCHEMA
        AND a.TABLE_NAME = b.TABLE_NAME
    WHERE b.Table_Name IS NULL
      ${filterToTable ? `AND a.table_name = '${filterToTable}'` : ''}
  `});

const getTableColumnNames = ({ config, table_name, table_schema }) =>
  execSql({ config, sql: `
      DECLARE @cols VARCHAR(MAX)

      SELECT
        @cols = COALESCE(@cols + ',' + quotename(column_name) ,quotename(column_name))
      FROM
        INFORMATION_SCHEMA.COLUMNS
      WHERE
        table_name = '${table_name}'
        AND table_schema = '${table_schema}'

      SELECT @cols As columnNames
    `});

const getTableData = ({ config, columnNames, table_schema, table_name }) =>
  execSql({ config, sql: `
    SELECT
    (
      SELECT ${columnNames} FOR json path, without_array_wrapper, INCLUDE_NULL_VALUES
    )
    FROM [${table_schema}].[${table_name}]
  `})

module.exports = {
  getTables,
  getProviderTables,
  getDependentTables,
  getTableColumnNames,
  getTableData,
};
