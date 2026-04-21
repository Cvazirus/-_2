import http from 'http';
function fetch(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 3000, path: path }, (res) => {
      resolve({code: res.statusCode, type: res.headers['content-type'], size: res.headers['content-length']});
    });
  });
}
async function run() {
  console.log('Manifest:', await fetch('/manifest.webmanifest'));
  console.log('Icon 192:', await fetch('/app-icon-192.png'));
  console.log('Icon 512:', await fetch('/app-icon-512.png'));
}
run();
