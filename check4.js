import fs from 'fs';
import { execSync } from 'child_process';
const b64 = fs.readFileSync('public/icon-192.png', 'base64');
console.log(b64.substring(0, 100));
