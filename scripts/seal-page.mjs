// Keep cleartext outside this public repository. The generated page is self-contained.
// PAGE_PASSWORD=... node scripts/seal-page.mjs seal /private/path/brief.html public/middlepowers/index.html
// PAGE_PASSWORD=... node scripts/seal-page.mjs open public/middlepowers/index.html /private/path/brief.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';

const [mode, input, output] = process.argv.slice(2);
const password = process.env.PAGE_PASSWORD;
if (!['seal', 'open'].includes(mode) || !input || !output || !password) {
  throw new Error('Usage: PAGE_PASSWORD=... node scripts/seal-page.mjs seal|open INPUT OUTPUT');
}
if (mode === 'open') {
  const match = readFileSync(input, 'utf8').match(/<script id="sealed" type="application\/json">([^<]+)<\/script>/);
  if (!match) throw new Error('Sealed payload missing');
  const { salt, iv, data, iterations } = JSON.parse(match[1]);
  const bytes = Buffer.from(data, 'base64');
  const key = pbkdf2Sync(password, Buffer.from(salt, 'base64'), iterations, 32, 'sha256');
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(bytes.subarray(-16));
  const clear = Buffer.concat([decipher.update(bytes.subarray(0, -16)), decipher.final()]);
  writeFileSync(output, clear, { mode: 0o600, flag: 'wx' });
} else {
  const salt = randomBytes(16), iv = randomBytes(12), iterations = 600000;
  const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(readFileSync(input)), cipher.final(), cipher.getAuthTag()]);
  const payload = JSON.stringify({ salt: salt.toString('base64'), iv: iv.toString('base64'), data: data.toString('base64'), iterations });
  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><title>Middle powers · Private brief</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#f1f2ec;color:#172c2a;font:16px/1.5 system-ui,sans-serif}main{width:min(420px,calc(100% - 40px));background:#fffef9;border:1px solid #d4ded8;padding:32px;border-radius:6px}h1{font-size:29px;letter-spacing:-.04em;margin:8px 0}p{color:#546864}label{display:block;font-size:14px;margin:20px 0 8px}input,button{width:100%;font:inherit;padding:12px;border:1px solid #9bada7;border-radius:4px}button{margin-top:12px;background:#156655;color:white;cursor:pointer}button:disabled{opacity:.6}input:focus-visible,button:focus-visible{outline:3px solid #156655;outline-offset:3px}#error{font-size:14px;color:#a32323;min-height:1.5em}.eyebrow{text-transform:uppercase;letter-spacing:.13em;font-size:11px;font-weight:700;color:#156655}</style></head>
<body><main><div class="eyebrow">Shared working brief</div><h1>Middle powers</h1><p>Enter the shared password to read the proposal.</p><form><label for="password">Password</label><input id="password" type="password" required autocomplete="current-password" autofocus><button type="submit">Read brief</button><p id="error" role="status" aria-live="polite"></p></form><noscript>JavaScript is required to decrypt this brief.</noscript></main>
<script id="sealed" type="application/json">${payload}</script>
<script>
const form=document.querySelector('form'),button=form.querySelector('button'),error=document.getElementById('error');
form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;error.textContent='';
try{if(!crypto.subtle)throw new Error('unsupported');const payload=JSON.parse(document.getElementById('sealed').textContent);const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(document.getElementById('password').value),'PBKDF2',false,['deriveKey']);
const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
const html=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.data)));
document.open();document.write(html);document.close();
}catch(e){error.textContent=e.message==='unsupported'?'Please use a modern browser over HTTPS.':'Incorrect password. Please try again.';button.disabled=false;document.getElementById('password').focus();}});
</script></body></html>`;
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, page);
}
