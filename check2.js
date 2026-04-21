import http from 'http';

function fetch(path) {
  return new Promise((resolve) => {
    http.get({
      host: 'localhost',
      port: 3000,
      path: path
    }, (res) => {
      resolve({code: res.statusCode, type: res.headers['content-type'], len: res.headers['content-length']});
    });
  });
}

async function run() {
  console.log('192:', await fetch('/icon-192.png'));
  console.log('512:', await fetch('/icon-512.png'));
  console.log('svg:', await fetch('/icon.svg'));
}

run();
