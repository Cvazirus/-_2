const fs = require('fs');
const https = require('https');

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
  await download('https://placehold.co/192x192/2563eb/ffffff/png?text=U', 'public/app-icon-v3-192.png');
  await download('https://placehold.co/512x512/2563eb/ffffff/png?text=U', 'public/app-icon-v3-512.png');
  console.log('Downloaded V3 icons');
})();
