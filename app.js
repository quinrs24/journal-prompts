'use strict';
(()=>{
const KEY='journal-prompts-v1';
const starter=["What has been taking up the most space in my mind lately?", "When have I felt most like myself recently?", "What small moments have felt meaningful lately?", "What am I learning about myself in this season of life?", "What feelings have I been trying to make sense of?", "What is something unexpected that happened recently?", "Who did I think about today, and what made them come to mind?", "What would I tell my past self about today?", "What am I grateful for?", "What’s a piece of music, art, writing, or other piece of media I've been thinking about?", "What did past me work hard to make possible for present me?", "What do I want my life to look like in 90 days?", "How do you think people see you?", "When are you most judgmental?", "What values are guiding your life right now?", "Are there any core values you hold that you are not currently living in alignment with?", "What do you wish was different?"];
const fresh=()=>({prompts:[...starter],current:0,session:[],history:[]});
let data;let storageOK=true;
try{const raw=localStorage.getItem(KEY);data=raw?JSON.parse(raw):fresh();if(!Array.isArray(data.prompts)||!Array.isArray(data.session)||!Array.isArray(data.history))throw Error('Invalid saved data');}catch(e){data=fresh();storageOK=false;}
const $=id=>document.getElementById(id);const msg=s=>{$('status').textContent=s};
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));storageOK=true;return true}catch(e){storageOK=false;msg('Could not save on this device. Export a backup and check browser storage settings.');return false}}
let shuffleTrail=[];let trailPosition=-1;
function resetShuffleTrail(){shuffleTrail=data.prompts.length?[data.prompts[Math.min(data.current,data.prompts.length-1)]]:[];trailPosition=shuffleTrail.length-1;}
function recordShuffle(prompt){if(trailPosition<shuffleTrail.length-1)shuffleTrail=shuffleTrail.slice(0,trailPosition+1);shuffleTrail.push(prompt);if(shuffleTrail.length>100)shuffleTrail.shift();trailPosition=shuffleTrail.length-1;}
function showTrailPosition(){const p=shuffleTrail[trailPosition];const i=data.prompts.findIndex(x=>x===p);if(i<0){resetShuffleTrail();return;}data.current=i;save();promptView();msg('');}
function promptView(){const count=data.prompts.length;$('promptCount').textContent=count+' prompt'+(count===1?'':'s');$('currentPrompt').textContent=count?data.prompts[Math.min(data.current,count-1)]:'Add a prompt to get started.';$('shuffle').disabled=count<2;$('keep').disabled=count===0;$('deleteCurrentPrompt').disabled=count===0||changeBusy||!accessToken;$('editCurrentPrompt').disabled=count===0||changeBusy||!accessToken;$('promptBack').disabled=trailPosition<=0;$('promptForward').disabled=trailPosition<0||trailPosition>=shuffleTrail.length-1;}
function tab(name){for(const el of document.querySelectorAll('[data-tab]'))el.setAttribute('aria-selected',String(el.dataset.tab===name));for(const key of ['session','history','library','settings'])$(key).classList.toggle('hidden',key!==name);if(name==='history')renderHistory();if(name==='library')renderLibrary();}
function entryUI(entry,onRemove){const box=document.createElement('div');box.className='entry';const heading=document.createElement('h3');heading.textContent=entry.prompt;box.append(heading);const area=document.createElement('textarea');area.value=entry.answer||'';area.placeholder='Write here, or use your paper journal…';area.setAttribute('aria-label','Response to '+entry.prompt);area.addEventListener('input',()=>{entry.answer=area.value;save()});box.append(area);if(onRemove){const btn=document.createElement('button');btn.className='subtle';btn.textContent='Remove prompt';btn.addEventListener('click',onRemove);box.append(btn)}return box;}
let activeWritingIndex=null;let writingPreviousFocus=null;
function sizeWritingArea(){const area=$('writingText');area.style.height='auto';area.style.height=Math.max(window.innerHeight*0.68,area.scrollHeight+40)+'px'}
function openWriting(index){const entry=data.session[index];if(!entry)return;activeWritingIndex=index;writingPreviousFocus=document.activeElement;$('writingPrompt').textContent=entry.prompt;$('writingText').value=entry.answer||'';$('writingMode').classList.remove('hidden');document.body.style.overflow='hidden';sizeWritingArea();$('writingText').focus({preventScroll:true});}
function closeWriting(){if(activeWritingIndex===null)return;const entry=data.session[activeWritingIndex];if(entry){entry.answer=$('writingText').value;save()}activeWritingIndex=null;$('writingMode').classList.add('hidden');document.body.style.overflow='';renderSession();if(writingPreviousFocus&&writingPreviousFocus.isConnected)writingPreviousFocus.focus({preventScroll:true});}
$('writingText').addEventListener('input',()=>{if(activeWritingIndex===null)return;const entry=data.session[activeWritingIndex];if(entry){entry.answer=$('writingText').value;save()}sizeWritingArea()});
$('writingDone').addEventListener('click',closeWriting);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeWritingIndex!==null)closeWriting()});
$('addSessionPrompt').addEventListener('click',()=>{tab('session');$('currentPrompt').scrollIntoView({behavior:'smooth',block:'center'});$('shuffle').focus({preventScroll:true});msg('Shuffle to find another prompt, then tap Keep this prompt.')});
function renderSession(){const box=$('sessionEntries');box.replaceChildren();$('emptySession').hidden=data.session.length>0;data.session.forEach((e,i)=>{const card=document.createElement('div');card.className='entry';const heading=document.createElement('h3');heading.textContent=e.prompt;card.append(heading);const preview=document.createElement('p');preview.className='note';preview.textContent=e.answer?(e.answer.length>170?e.answer.slice(0,170)+'…':e.answer):'A blank page is waiting for you.';preview.style.whiteSpace='pre-wrap';card.append(preview);const actions=document.createElement('div');actions.className='session-open';const open=document.createElement('button');open.className='open-writing';open.textContent=e.answer?'Continue writing':'Open writing mode';open.addEventListener('click',()=>openWriting(i));const remove=document.createElement('button');remove.className='subtle';remove.textContent='Remove prompt';remove.addEventListener('click',()=>{if(e.answer&&!confirm('Remove this prompt and its draft writing?'))return;data.session.splice(i,1);save();renderSession()});actions.append(open,remove);card.append(actions);box.append(card)})}

function renderHistory(){const box=$('historyEntries');box.replaceChildren();if(!data.history.length){const p=document.createElement('p');p.className='note';p.textContent='No past entries yet.';box.append(p);return}data.history.forEach((s,i)=>{const card=document.createElement('div');card.className='entry';const head=document.createElement('div');head.className='history-head';const title=document.createElement('strong');const date=new Date(s.created);title.textContent=(Number.isNaN(date.getTime())?'Saved session':date.toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'}))+' · '+s.entries.length+' prompt'+(s.entries.length===1?'':'s');const toggle=document.createElement('button');toggle.textContent='View / edit';toggle.setAttribute('aria-expanded','false');const body=document.createElement('div');body.className='history-items hidden';toggle.addEventListener('click',()=>{const open=body.classList.toggle('hidden')===false;toggle.textContent=open?'Close':'View / edit';toggle.setAttribute('aria-expanded',String(open))});s.entries.forEach(e=>body.append(entryUI(e,null)));const del=document.createElement('button');del.className='subtle';del.textContent='Delete saved session';del.addEventListener('click',()=>{if(confirm('Delete this saved session and its writing?')){data.history.splice(i,1);save();renderHistory()}});body.append(del);const upload=document.createElement('button');upload.textContent='Retry Google save';upload.addEventListener('click',async()=>{upload.disabled=true;try{await appendSession(s);data.history=data.history.filter(x=>x.id!==s.id);save();renderHistory();msg('Saved to Google Doc.')}catch(e){msg('Save not confirmed: '+e.message+'. Check the Doc before retrying.')}finally{upload.disabled=false}});body.append(upload);head.append(title,toggle);card.append(head,body);box.append(card)});}
function renderLibrary(){const box=$('libraryEntries');box.replaceChildren();data.prompts.forEach((p,i)=>{const row=document.createElement('div');row.className='entry row between';const text=document.createElement('span');text.style.flex='1 1 220px';text.textContent=p;const del=document.createElement('button');del.className='subtle';del.textContent='Delete';del.setAttribute('aria-label','Delete prompt: '+p);del.addEventListener('click',()=>{if(!accessToken){msg('Connect Google before deleting synced prompts.');return}changePrompts('delete',[p])});row.append(text,del);box.append(row)});}
$('shuffle').addEventListener('click',()=>{const n=data.prompts.length;if(n<2)return;const offset=1+Math.floor(Math.random()*(n-1));data.current=(data.current+offset)%n;recordShuffle(data.prompts[data.current]);save();promptView();msg('')});
$('promptBack').addEventListener('click',()=>{if(trailPosition>0){trailPosition--;showTrailPosition();}});
$('promptForward').addEventListener('click',()=>{if(trailPosition<shuffleTrail.length-1){trailPosition++;showTrailPosition();}});
$('editCurrentPrompt').addEventListener('click',async()=>{
 if(!accessToken){msg('Connect Google before editing prompts.');tab('settings');return;}
 if(changeBusy||googleBusy){msg('Please wait for the current sync to finish.');return;}
 const original=data.prompts[data.current];
 if(!original)return;
 const revised=prompt('Edit this prompt in your master Google Sheet:',original);
 if(revised===null)return;
 const updated=revised.trim();
 if(!updated){msg('A prompt cannot be blank.');return;}
 if(updated===original)return;
 if(data.prompts.some(p=>normalizePrompt(p)===normalizePrompt(updated)&&p!==original)){msg('That prompt already exists in your library.');return;}
 const ok=await changePrompts('edit',[original,updated]);
 if(ok){shuffleTrail=shuffleTrail.map(p=>p===original?updated:p);data.current=data.prompts.indexOf(updated);if(data.current<0)data.current=0;save();promptView();msg('Prompt updated in your Google Sheet. Existing journal entries stay unchanged.');}
});
$('deleteCurrentPrompt').addEventListener('click',async()=>{
  if(!data.prompts.length)return;
  if(!accessToken){msg('Connect Google before deleting a prompt from your master library.');tab('settings');return;}
  if(changeBusy||googleBusy){msg('Please wait for the current sync to finish.');return;}
  const prompt=data.prompts[Math.min(data.current,data.prompts.length-1)];
  if(!confirm('Permanently delete this prompt from your master Google Sheet and all synced devices?\n\n“'+prompt+'”\n\nExisting journal entries will not be affected.'))return;
  const button=$('deleteCurrentPrompt');button.disabled=true;
  try{
    const ok=await changePrompts('delete',[prompt]);
    if(ok){
      if(data.prompts.length>1)data.current=Math.floor(Math.random()*data.prompts.length);
      else data.current=0;
      resetShuffleTrail();save();promptView();msg('Prompt deleted from your Google Sheet. Here’s another one.');
    }
  }finally{promptView();}
});
$('keep').addEventListener('click',()=>{if(!data.prompts.length)return;data.session.push({prompt:data.prompts[data.current],answer:''});save();renderSession();tab('session');openWriting(data.session.length-1);msg('Prompt added to your session.')});
$('saveSession').addEventListener('click',async()=>{if(!data.session.length){msg('Add a prompt before saving.');return}if(!accessToken){msg('Connect Google before saving to your master journal. Your draft is still on this device.');tab('settings');return}const button=$('saveSession');button.disabled=true;const session={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),created:new Date().toISOString(),entries:data.session.map(e=>({...e}))};data.history.unshift(session);save();try{await appendSession(session);data.history=data.history.filter(x=>x.id!==session.id);data.session=[];save();renderSession();renderHistory();msg('Saved to your Google Doc!');}catch(e){data.session=[];save();renderSession();renderHistory();tab('history');msg('Google save not confirmed: '+e.message+'. Your session is safely kept under Pending entries. Check the Doc before retrying.')}finally{button.disabled=false}});
$('clearSession').addEventListener('click',()=>{if(data.session.length&&!confirm('Clear this session and all its responses?'))return;data.session=[];save();renderSession();msg('Session cleared.')});
$('promptForm').addEventListener('submit',e=>{e.preventDefault();const lines=$('newPrompts').value.split('\n').map(s=>s.trim()).filter(Boolean);if(!lines.length){msg('Enter at least one prompt.');return}if(lines.length>1000){msg('Please add at most 1,000 prompts at once.');return}if(accessToken){changePrompts('add',lines).then(ok=>{if(ok)$('newPrompts').value=''})}else{msg('Connect Google before adding prompts to the shared library.');tab('settings')}});
for(const btn of document.querySelectorAll('[data-tab]'))btn.addEventListener('click',()=>tab(btn.dataset.tab));
const enc=new TextEncoder(),dec=new TextDecoder();
function b64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}function unb64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function keyFor(pass,salt){const base=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
$('exportBackup').addEventListener('click',async()=>{const pass=$('backupPass').value;if(pass.length<12){msg('Use a backup passphrase of at least 12 characters.');return}if(!crypto.subtle){msg('Secure backup requires HTTPS or localhost.');return}try{const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const key=await keyFor(pass,salt);const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(JSON.stringify(data)));const output={format:'journal-prompts-encrypted-v1',kdf:'PBKDF2-SHA256',iterations:310000,salt:b64(salt),iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext))};const blob=new Blob([JSON.stringify(output)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='journal-prompts-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);$('backupPass').value='';msg('Encrypted backup created. Keep your passphrase safe.')}catch(e){msg('Backup failed. Please try again.')}});
$('restoreBackup').addEventListener('click',async()=>{const file=$('restoreFile').files[0],pass=$('restorePass').value;if(!file||!pass){msg('Choose a backup and enter its passphrase.');return}if(file.size>15*1024*1024){msg('Backup file is too large.');return}try{const obj=JSON.parse(await file.text());if(obj.format!=='journal-prompts-encrypted-v1'||obj.iterations!==310000)throw Error('Invalid backup');const key=await keyFor(pass,unb64(obj.salt));const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(obj.iv)},key,unb64(obj.ciphertext));const restored=JSON.parse(dec.decode(plaintext));if(!Array.isArray(restored.prompts)||!restored.prompts.every(p=>typeof p==='string')||!Array.isArray(restored.session)||!Array.isArray(restored.history))throw Error('Invalid journal data');if(!confirm('Replace all journal data on this device with this backup?'))return;data=restored;data.current=Math.max(0,Math.min(Number(data.current)||0,data.prompts.length-1));save();promptView();renderSession();tab('history');$('restorePass').value='';$('restoreFile').value='';resetShuffleTrail();promptView();msg('Backup restored. Connect Google and choose Sync prompts now to sync restored prompts.')}catch(e){msg('Could not restore backup. Check the file and passphrase.')}});

// Generate a genuine, self-contained Word .docx without contacting any server.
function xmlEscape(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function wordParagraph(value,style){const lines=String(value??'').split(/\r?\n/);const props=style?'<w:pPr><w:pStyle w:val="'+style+'"/></w:pPr>':'';return lines.map(line=>'<w:p>'+props+'<w:r><w:t xml:space="preserve">'+xmlEscape(line||' ')+'</w:t></w:r></w:p>').join('')}
const zipEncoder=new TextEncoder();
const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0}
function makeZip(files){const chunks=[],directory=[];let offset=0;const u16=(d,o,n)=>d.setUint16(o,n,true),u32=(d,o,n)=>d.setUint32(o,n>>>0,true);for(const [name,content] of files){const nameBytes=zipEncoder.encode(name),body=zipEncoder.encode(content),crc=crc32(body);const h=new Uint8Array(30+nameBytes.length),v=new DataView(h.buffer);u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,0x800);u16(v,8,0);u32(v,14,crc);u32(v,18,body.length);u32(v,22,body.length);u16(v,26,nameBytes.length);h.set(nameBytes,30);chunks.push(h,body);const d=new Uint8Array(46+nameBytes.length),dv=new DataView(d.buffer);u32(dv,0,0x02014b50);u16(dv,4,20);u16(dv,6,20);u16(dv,8,0x800);u32(dv,16,crc);u32(dv,20,body.length);u32(dv,24,body.length);u16(dv,28,nameBytes.length);u32(dv,42,offset);d.set(nameBytes,46);directory.push(d);offset+=h.length+body.length}const centralSize=directory.reduce((n,d)=>n+d.length,0);const end=new Uint8Array(22),ev=new DataView(end.buffer);u32(ev,0,0x06054b50);u16(ev,8,files.length);u16(ev,10,files.length);u32(ev,12,centralSize);u32(ev,16,offset);return new Blob([...chunks,...directory,end],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'})}
function exportJournal(){if(!data.history.length){msg('No saved sessions to export yet. Save a session first.');return}try{const sessions=[...data.history].sort((a,b)=>new Date(a.created||0)-new Date(b.created||0));let body=wordParagraph('Journal Prompts','Title')+wordParagraph('My Journal Archive','Subtitle');for(const session of sessions){const d=new Date(session.created);const date=Number.isNaN(d.getTime())?'Date unavailable':d.toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});body+=wordParagraph(date,'Heading1');for(const entry of session.entries||[]){body+=wordParagraph(entry.prompt||'Untitled prompt','Heading2');body+=wordParagraph(entry.answer||'(No written response)');}}const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr/></w:body></w:document>';const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:sz w:val="26"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style></w:styles>';const blob=makeZip([['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],['word/document.xml',doc],['word/styles.xml',styles],['word/_rels/document.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>']]);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='journal-prompts-entries-'+new Date().toISOString().slice(0,10)+'.docx';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);msg('Word document exported. Keep it somewhere private: this export is not encrypted.')}catch(e){msg('Could not export your journal. Please try again.')}}
$('exportJournal').addEventListener('click',exportJournal);


// Google integration: user-granted OAuth access token lives only in memory (not localStorage).
const CLIENT_ID='1078785397105-o7en9hjue91g808u058c9ojr2ivt723v.apps.googleusercontent.com';
const SHEET_ID='1Ud6j4mB0nTYnECrZ342gud96KF-Ta8I1VWtrEZ9hfr0';
const DOC_ID='18p2NmZczAyeQ2KQRX4m__bp0bLMf3ZvJkkCVBJK8-ic';
const SCOPES='https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents';
let accessToken=null,tokenClient=null,googleBusy=false,syncTimer=null;let lastSync=0;let changeBusy=false;
const normalizePrompt=p=>String(p||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const uniquePrompts=arr=>{const seen=new Set();return arr.map(p=>String(p).trim()).filter(p=>{const key=normalizePrompt(p);if(!key||seen.has(key))return false;seen.add(key);return true})};
function googleStatus(s){$('googleState').textContent=s}
function initTokenClient(){if(tokenClient)return true;if(!window.google?.accounts?.oauth2){googleStatus('Google sign-in has not loaded. Check your internet connection and refresh.');return false}tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:async result=>{if(result.error){googleStatus('Google authorization failed: '+result.error);return}accessToken=result.access_token;promptView();googleStatus('Connected to Google for this browser session. Syncing prompts…');await syncPrompts();if(data.history.length)msg('You have pending sessions. Open Past entries to retry saving them.')}});return true}
function connectGoogle(){if(!initTokenClient())return;tokenClient.requestAccessToken({prompt:accessToken?'':'consent'})}
async function googleFetch(url,opts={}){if(!accessToken)throw Error('Connect Google first.');const headers={Authorization:'Bearer '+accessToken,...opts.headers};const response=await fetch(url,{...opts,headers});let payload;try{payload=await response.json()}catch{payload={}}if(!response.ok){if(response.status===401){accessToken=null;googleStatus('Google authorization expired. Please reconnect.')}throw Error(payload.error?.message||'Google request failed ('+response.status+')')}return payload}
const sheetsBase='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(SHEET_ID);
async function sheetName(){const r=await googleFetch(sheetsBase+'?fields=sheets(properties(title,gridProperties))');if(!r.sheets?.length)throw Error('No worksheet found in the Google Sheet.');return r.sheets[0].properties.title}
function sheetRange(name){return "'"+name.replace(/'/g,"''")+"'!A:A"}
async function readSheet(){const name=await sheetName();const r=await googleFetch(sheetsBase+'/values/'+encodeURIComponent(sheetRange(name)));const cells=(r.values||[]).map(row=>row[0]||'');return {name,prompts:uniquePrompts(cells.filter((v,i)=>!(i===0&&normalizePrompt(v)==='prompt')))} }
async function writeSheet(name,prompts){const range="'"+name.replace(/'/g,"''")+"'!A:A";await googleFetch(sheetsBase+'/values/'+encodeURIComponent(range)+':clear',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const target="'"+name.replace(/'/g,"''")+"'!A1";await googleFetch(sheetsBase+'/values/'+encodeURIComponent(target)+'?valueInputOption=RAW',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({values:[['Prompt'],...prompts.map(p=>[p])]})})}
function showPrompts(prompts){const old=data.prompts[data.current];data.prompts=prompts;const idx=prompts.indexOf(old);data.current=idx>=0?idx:Math.min(data.current,Math.max(0,prompts.length-1));shuffleTrail=shuffleTrail.filter(p=>prompts.includes(p));if(!shuffleTrail.length||!shuffleTrail.includes(prompts[data.current]))resetShuffleTrail();else trailPosition=shuffleTrail.lastIndexOf(prompts[data.current]);save();promptView();renderLibrary()}
async function syncPrompts(){if(!accessToken||googleBusy||changeBusy)return;googleBusy=true;$('googleSync').disabled=true;try{const {prompts}=await readSheet();showPrompts(prompts);lastSync=Date.now();googleStatus('Google connected · '+prompts.length+' prompts synced.');msg('Prompt library refreshed from Google Sheets.')}catch(e){googleStatus('Sync error: '+e.message);msg('Sync failed: '+e.message)}finally{googleBusy=false;$('googleSync').disabled=false}}
async function changePrompts(action,items){if(!accessToken||changeBusy)return false;changeBusy=true;try{const {name,prompts}=await readSheet();let next;
 if(action==='add')next=uniquePrompts([...prompts,...items]);
 else if(action==='edit'){
   const [original,updated]=items;
   const at=prompts.findIndex(p=>normalizePrompt(p)===normalizePrompt(original));
   if(at<0)throw Error('This prompt has changed or was deleted on another device. Sync and try again.');
   if(prompts.some((p,i)=>i!==at&&normalizePrompt(p)===normalizePrompt(updated)))throw Error('That prompt already exists.');
   next=[...prompts];next[at]=updated;
 }else next=prompts.filter(p=>!items.some(item=>normalizePrompt(item)===normalizePrompt(p)));await writeSheet(name,next);showPrompts(next);lastSync=Date.now();googleStatus('Google connected · '+next.length+' prompts synced.');msg(action==='add'?'Prompt(s) added to Google Sheets.':action==='edit'?'Prompt edited in Google Sheets.':'Prompt deleted from Google Sheets.');return true}catch(e){msg('Google Sheets update failed: '+e.message);return false}finally{changeBusy=false;promptView()}}
function schedulePromptSync(){if(!accessToken)return;clearTimeout(syncTimer);syncTimer=setTimeout(syncPrompts,650)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastSync>10000)syncPrompts()});window.addEventListener('focus',()=>{if(Date.now()-lastSync>10000)syncPrompts()});setInterval(()=>{if(!document.hidden&&Date.now()-lastSync>60000)syncPrompts()},60000);
$('googleConnect').addEventListener('click',connectGoogle);
$('googleSync').addEventListener('click',()=>{if(accessToken)syncPrompts();else connectGoogle()});
$('googleDisconnect').addEventListener('click',()=>{if(accessToken&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(accessToken,()=>{});accessToken=null;promptView();googleStatus('Disconnected. Your local prompts and entries remain on this device.');msg('Disconnected from Google.')});
// Session uploads use a local receipt to prevent accidental duplicate uploads on the same device.
const receiptKey='journal-prompts-google-doc-receipts-v1';
function receipts(){try{return JSON.parse(localStorage.getItem(receiptKey)||'{}')}catch{return {}}}
async function appendSession(session){
  if(!accessToken)throw Error('Connect Google first.');
  const id=session.id||session.created;
  if(receipts()[id])return;
  const date=new Date(session.created);
  const title=Number.isNaN(date.getTime())?'Saved session':date.toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});
  // Google Docs uses UTF-16 code-unit indices, just like JavaScript string.length.
  let content='';
  const boldSpans=[];
  function add(text,bold=false){
    const start=content.length;
    content+=text;
    if(bold&&text.length)boldSpans.push({start,end:content.length});
  }
  add('\n\n');
  add(title,true);
  add('\n');
  for(const e of session.entries||[]){
    add('\n');
    add(e.prompt||'Untitled prompt',true);
    add('\n');
    add(e.answer||'(No written response)');
    add('\n');
  }
  const url='https://docs.googleapis.com/v1/documents/'+encodeURIComponent(DOC_ID);
  const doc=await googleFetch(url+'?fields=body(content(endIndex))');
  const elements=doc.body?.content||[];
  if(!elements.length)throw Error('Could not locate the end of the Google Doc.');
  const insertionIndex=elements[elements.length-1].endIndex-1;
  const requests=[
    {insertText:{endOfSegmentLocation:{},text:content}},
    // Reset inherited formatting so responses remain regular even if the Doc ends in bold.
    {updateTextStyle:{range:{startIndex:insertionIndex,endIndex:insertionIndex+content.length},textStyle:{bold:false},fields:'bold'}},
    ...boldSpans.map(span=>({updateTextStyle:{range:{startIndex:insertionIndex+span.start,endIndex:insertionIndex+span.end},textStyle:{bold:true},fields:'bold'}}))
  ];
  await googleFetch(url+':batchUpdate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests})});
  const r=receipts();r[id]=new Date().toISOString();localStorage.setItem(receiptKey,JSON.stringify(r));
}
$('deleteAll').addEventListener('click',()=>{if(!confirm('Permanently delete all prompts, current writing, and past entries from this device? Make a backup first.'))return;if(!confirm('Are you sure? This cannot be undone without a backup.'))return;data=fresh();save();promptView();renderSession();tab('session');msg('Local journal data deleted. Google Sheet and Doc were not changed.')});
if(!storageOK)msg('Saved journal data could not be loaded. Avoid writing until browser storage is available.');else save();resetShuffleTrail();promptView();renderSession();
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
