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
  const m = await fetch('/dev-sw.js?dev-sw');
  console.log(m.code, m.data.substring(0, 500));
}
run();
