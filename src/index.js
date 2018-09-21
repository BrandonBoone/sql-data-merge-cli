const Promise = require("bluebird");
const fs = require('fs');
const path = require('path');
const { writeJsonToFile } = require('./utils');
const queries = require('./queries');
const secrets = require('./secrets'); // file excluded from git.

const config = {  
    ...secrets,
    // If you are on Microsoft Azure, you need this:  
    options: { encrypt: true, database: secrets.database }  
};  

const directory = path.join(__dirname, '..', 'output')

if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory);
}

// queries.getTables({
//   config,
// })
// .then(tableData => {
//   const tables = JSON.parse(`[${tableData}]`);
//   let num = 0;
//   let len = tables.length;
//   return Promise.map(tables, ({ table_schema, table_name }) =>
//     console.log(`${++num} of ${len}: processing [${table_schema}].[${table_name}]`) ||

//     queries.getDependentTables({ config, table_name, table_schema })
//     .then((data) => {
//       console.log(data);
//     })
//   );
// });

// return; 

queries.getTables({
  config,
})
.then(tableData => {
  const tables = JSON.parse(`[${tableData}]`);
  let num = 0;
  let len = tables.length;
  return Promise.map(tables, ({ table_schema, table_name }) =>
    console.log(`${++num} of ${len}: processing [${table_schema}].[${table_name}]`) ||
    queries.getTableColumnNames({
      config,
      table_schema,
      table_name
    })
    .then(columnNames => queries.getTableData({
      config,
      columnNames,
      table_schema,
      table_name,
    }))
    .then(data => writeJsonToFile(directory, {
      data: JSON.parse(`[${data}]`),
      table_name,
      table_schema,
    })),
    {concurrency: 4}
  )
})
.then((data) => {
  console.log('exported all tables successfully');
})
.catch((ex) => console.log(ex))


