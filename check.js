import http from 'http';

function fetch(path) {
  return new Promise((resolve) => {
    http.get({
      host: 'localhost',
      port: 3000,
      path: path
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({code: res.statusCode, data}));
    });
  });
}

async function run() {
  const index = await fetch('/');
  console.log('INDEX:', index.code);
  console.log(index.data.substring(0, 500));
  
  const manifest = await fetch('/manifest.webmanifest');
  console.log('MANIFEST:', manifest.code);
  console.log(manifest.data.substring(0, 500));
  
  const sw = await fetch('/dev-sw.js?dev-sw');
  console.log('SW:', sw.code);
  console.log(sw.data.substring(0, 200));
}

run();
