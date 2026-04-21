const https = require('https');
const fs = require('fs');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

(async () => {
  await download('https://ui-avatars.com/api/?name=U&size=192&background=2563eb&color=fff&format=png', 'public/icon-192.png');
  await download('https://ui-avatars.com/api/?name=U&size=512&background=2563eb&color=fff&format=png', 'public/icon-512.png');
  console.log('Downloaded');
})();
