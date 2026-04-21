import http from 'http';
function fetch(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 3000, path: path }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => resolve({code: res.statusCode, data}));
    });
  });
}
fetch('/manifest.webmanifest').then(r => console.log(r.code, r.data));
