const Connection = require('tedious').Connection;
const Request = require('tedious').Request;  
const TYPES = require('tedious').TYPES;  

const execSql = ({ config, sql, connection}) =>
  new Promise((resolve, reject) => {
    if (connection) {
      resolve({ connection, keepAlive: true });
    }
    const localConnection = new Connection(config);
    localConnection.on('connect', (err) => {  
      // If no error, then good to proceed.
      if(err) {
        console.log(err);
        localConnection.close();

        console.log('closing on connect');
        reject(err);
      }
      resolve({ connection: localConnection, keepAlive: false });
    });
  }).then(({ connection, keepAlive }) =>
    executeStatement(sql, connection)
    .then((data) => {
      if (!keepAlive) {
        connection.close();
      }
      return data;
    })
  )

function executeStatement(sql, connection) {
  return new Promise((resolve, reject) => {
    const request = new Request(sql, function(err) {  
      if (err) {  
        console.log(err);
        connection.close();

        console.log('closing on executeStatement');
        reject(err);
      }  
    });

    let result = '';  
    request.on('row', function(columns) {
      let row = '';
      columns.forEach(function(column) {
        
        if (column.value === null) {  
          console.log('NULL');  
        } else {  
          row += column.value + ' ';  
        } 
      });

        result += result === "" ? row : `,${row}`;
    });  

    request.on('requestCompleted', () =>
      resolve(result)
    );
    connection.execSql(request);  
  });
}

module.exports = {
  execSql
};