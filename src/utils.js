const fs = require('fs');
const path = require('path');

const clearFile = (filePath) => new Promise((resolve, reject) => {
  if (fs.existsSync(filePath)) {
    fs.truncate(filePath, 0, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  } else {
    resolve();
  }
})

// https://stackoverflow.com/a/6958773/402706
const writeJsonToFile = (directory, manifest) => new Promise((resolve, reject) => {
  const filePath = path.join(directory, `${manifest.table_schema}.${manifest.table_name}.json`);

  clearFile(filePath)
  .then(() => {
    const stream = fs.createWriteStream(filePath);
    stream.once('open', function(fd) {
      manifest.data.forEach(row => {
        stream.write(`${JSON.stringify(row)}\n`);
      });
      stream.end();
      resolve();
    });
  });
});

module.exports = {
  writeJsonToFile,
};
