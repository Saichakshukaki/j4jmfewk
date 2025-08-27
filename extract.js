const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');

function extractZip(zipPath, outputDir) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);

      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          const dirPath = path.join(outputDir, entry.fileName);
          fs.mkdirSync(dirPath, { recursive: true });
          zipfile.readEntry();
        } else {
          // File entry
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);

            const filePath = path.join(outputDir, entry.fileName);
            const dirPath = path.dirname(filePath);
            
            // Ensure directory exists
            fs.mkdirSync(dirPath, { recursive: true });

            const writeStream = fs.createWriteStream(filePath);
            readStream.pipe(writeStream);
            
            writeStream.on('close', () => {
              zipfile.readEntry();
            });
          });
        }
      });

      zipfile.on('end', () => {
        console.log('Extraction complete');
        resolve();
      });

      zipfile.on('error', reject);
    });
  });
}

// Extract hello.zip to current directory
extractZip('hello.zip', '.')
  .then(() => {
    console.log('Successfully extracted hello.zip');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Extraction failed:', error);
    process.exit(1);
  });