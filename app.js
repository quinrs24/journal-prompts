'use strict';
(()=>{
const KEY='journal-prompts-v1';
const starter=["What has been taking up the most space in my mind lately?", "When have I felt most like myself recently?", "What small moments have felt meaningful lately?", "What am I learning about myself in this season of life?", "What feelings have I been trying to make sense of?", "What is something unexpected that happened recently?", "Who did I think about today, and what made them come to mind?", "What would I tell my past self about today?", "What am I grateful for?", "What’s a piece of music, art, writing, or other piece of media I've been thinking about?", "What did past me work hard to make possible for present me?", "What do I want my life to look like in 90 days?", "How do you think people see you?", "When are you most judgmental?", "What values are guiding your life right now?", "Are there any core values you hold that you are not currently living in alignment with?", "What do you wish was different?"];
const fresh=()=>({prompts:[...starter],current:0,session:[],history:[],favorites:[]});
let data;let storageOK=true;
try{const raw=localStorage.getItem(KEY);data=raw?JSON.parse(raw):fresh();if(!Array.isArray(data.prompts)||!Array.isArray(data.session)||!Array.isArray(data.history))throw Error('Invalid saved data');}catch(e){data=fresh();storageOK=false;}
if(!Array.isArray(data.favorites))data.favorites=[];
const $=id=>document.getElementById(id);const msg=s=>{$('status').textContent=s};
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));storageOK=true;return true}catch(e){storageOK=false;msg('Could not save on this device. Check browser storage settings.');return false}}
let shuffleTrail=[];let trailPosition=-1;
// A shuffled deck avoids repeats until every prompt has been shown.
let shuffleDeck=[];
function resetDeck(){shuffleDeck=[...data.prompts];for(let i=shuffleDeck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffleDeck[i],shuffleDeck[j]]=[shuffleDeck[j],shuffleDeck[i]];}const current=data.prompts[data.current];shuffleDeck=shuffleDeck.filter(p=>p!==current);}
function nextDeckPrompt(){if(!shuffleDeck.length)resetDeck();return shuffleDeck.pop();}
function resetShuffleTrail(){shuffleTrail=data.prompts.length?[data.prompts[Math.min(data.current,data.prompts.length-1)]]:[];trailPosition=shuffleTrail.length-1;}
function recordShuffle(prompt){if(trailPosition<shuffleTrail.length-1)shuffleTrail=shuffleTrail.slice(0,trailPosition+1);shuffleTrail.push(prompt);if(shuffleTrail.length>100)shuffleTrail.shift();trailPosition=shuffleTrail.length-1;}
function showTrailPosition(){const p=shuffleTrail[trailPosition];const i=data.prompts.findIndex(x=>x===p);if(i<0){resetShuffleTrail();return;}data.current=i;save();promptView();msg('');}
function promptView(){const count=data.prompts.length;$('promptCount').textContent=count+' prompt'+(count===1?'':'s');$('currentPrompt').textContent=count?data.prompts[Math.min(data.current,count-1)]:'Add a prompt to get started.';$('shuffle').disabled=count<2;$('keep').disabled=count===0;$('deleteCurrentPrompt').disabled=count===0||changeBusy||!accessToken;$('editCurrentPrompt').disabled=count===0||changeBusy||!accessToken;$('promptBack').disabled=trailPosition<=0;const current=data.prompts[data.current];const isFav=!!current&&data.favorites.includes(current);$('favoriteCurrent').textContent=isFav?'★':'☆';$('favoriteCurrent').setAttribute('aria-pressed',String(isFav));$('favoriteCurrent').setAttribute('aria-label',isFav?'Remove prompt from Favorites':'Add prompt to Favorites');$('favoriteCurrent').disabled=!current||!accessToken||changeBusy;}
function tab(name){for(const el of document.querySelectorAll('[data-tab]'))el.setAttribute('aria-selected',String(el.dataset.tab===name));for(const key of ['session','favorites','memories','library','settings'])$(key).classList.toggle('hidden',key!==name);if(name==='settings')renderHistory();if(name==='memories')renderMemories();if(name==='library')renderLibrary();if(name==='favorites'){shuffleFavoritesOrder();renderFavorites();}}
function entryUI(entry,onRemove){const box=document.createElement('div');box.className='entry';const heading=document.createElement('h3');heading.textContent=entry.prompt;box.append(heading);const area=document.createElement('textarea');area.value=entry.answer||'';area.placeholder='Write here, or use your paper journal…';area.setAttribute('aria-label','Response to '+entry.prompt);area.addEventListener('input',()=>{entry.answer=area.value;save()});box.append(area);if(onRemove){const btn=document.createElement('button');btn.className='subtle';btn.textContent='Remove entry';btn.addEventListener('click',onRemove);box.append(btn)}return box;}
let activeWritingIndex=null;let writingPreviousFocus=null;
function sizeWritingArea(){const area=$('writingText');area.style.height='';}
function openWriting(index){const entry=data.session[index];if(!entry)return;activeWritingIndex=index;writingPreviousFocus=document.activeElement;$('writingPrompt').textContent=entry.prompt;$('writingText').value=entry.answer||'';$('writingMode').classList.remove('hidden');document.body.classList.add('writing-open');sizeWritingArea();$('writingText').focus({preventScroll:true});}
function closeWriting(){if(activeWritingIndex===null)return;const entry=data.session[activeWritingIndex];if(entry){entry.answer=$('writingText').value;save()}activeWritingIndex=null;$('writingMode').classList.add('hidden');document.body.classList.remove('writing-open');renderSession();if(writingPreviousFocus&&writingPreviousFocus.isConnected)writingPreviousFocus.focus({preventScroll:true});}
$('writingText').addEventListener('input',()=>{if(activeWritingIndex===null)return;const entry=data.session[activeWritingIndex];if(entry){entry.answer=$('writingText').value;save()}sizeWritingArea()});
// Plain-text list shortcuts; no rich-text editor or Google Doc format changes.
const writingArea=$('writingText');
writingArea.addEventListener('input',e=>{
 if(e.inputType!=='insertText'||e.data!==' '||writingArea.selectionStart!==writingArea.selectionEnd)return;
 const pos=writingArea.selectionStart, lineStart=writingArea.value.lastIndexOf('\n',pos-1)+1;
 const prefix=writingArea.value.slice(lineStart,pos);
 if(prefix==='- '||prefix==='* '){writingArea.setRangeText('• ',lineStart,pos,'end');writingArea.dispatchEvent(new Event('input',{bubbles:true}));}
});
writingArea.addEventListener('keydown',e=>{
 if(e.key!=='Enter'||e.shiftKey||writingArea.selectionStart!==writingArea.selectionEnd||e.isComposing)return;
 const pos=writingArea.selectionStart, start=writingArea.value.lastIndexOf('\n',pos-1)+1;
 const line=writingArea.value.slice(start,pos);
 const bullet=line.match(/^(\s*)• (.*)$/),numbered=line.match(/^(\s*)(\d+)\. (.*)$/);
 if(!bullet&&!numbered)return;
 e.preventDefault();const match=bullet||numbered;
 if(!match[bullet?2:3].trim()){writingArea.setRangeText('',start,pos,'end');writingArea.dispatchEvent(new Event('input',{bubbles:true}));return;}
 const next=bullet?match[1]+'• ':match[1]+(Number(match[2])+1)+'. ';
 writingArea.setRangeText('\n'+next,pos,pos,'end');writingArea.dispatchEvent(new Event('input',{bubbles:true}));
});
$('writingDone').addEventListener('click',closeWriting);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&activeWritingIndex!==null)closeWriting()});
$('addSessionPrompt').addEventListener('click',()=>{tab('session');$('currentPrompt').scrollIntoView({behavior:'smooth',block:'center'});$('shuffle').focus({preventScroll:true});msg('Shuffle to find another prompt, then tap Keep this prompt.')});
function renderSession(){const box=$('sessionEntries');box.replaceChildren();$('emptySession').hidden=data.session.length>0;data.session.forEach((e,i)=>{const card=document.createElement('div');card.className='entry';const heading=document.createElement('h3');heading.textContent=e.prompt;card.append(heading);const preview=document.createElement('p');preview.className='note';preview.textContent=e.answer?(e.answer.length>170?e.answer.slice(0,170)+'…':e.answer):'A blank page is waiting for you.';preview.style.whiteSpace='pre-wrap';card.append(preview);const actions=document.createElement('div');actions.className='session-open';const open=document.createElement('button');open.className='open-writing';open.textContent=e.answer?'Continue writing':'Open writing mode';open.addEventListener('click',()=>openWriting(i));const remove=document.createElement('button');remove.className='subtle';remove.textContent='Remove entry';remove.addEventListener('click',()=>{if(e.answer&&!confirm('Remove this entry and its draft writing?'))return;data.session.splice(i,1);save();renderSession()});actions.append(open,remove);if(accessToken&&historyLoaded&&historyCount(e.prompt)>0){card.classList.add('has-past');const past=document.createElement('button');past.className='past-link';past.textContent='✦ View past answers ('+historyCount(e.prompt)+')';past.addEventListener('click',()=>openPastAnswers(e.prompt));actions.append(past)}card.append(actions);box.append(card)})}

function renderHistory(){const box=$('historyEntries');box.replaceChildren();$('pendingGroup').classList.toggle('hidden',!data.history.length);if(!data.history.length)return;data.history.forEach((s,i)=>{const card=document.createElement('div');card.className='entry';const head=document.createElement('div');head.className='history-head';const title=document.createElement('strong');const date=new Date(s.created);title.textContent=(Number.isNaN(date.getTime())?'Saved session':date.toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'}))+' · '+s.entries.length+' prompt'+(s.entries.length===1?'':'s');const toggle=document.createElement('button');toggle.textContent='View / edit';toggle.setAttribute('aria-expanded','false');const body=document.createElement('div');body.className='history-items hidden';toggle.addEventListener('click',()=>{const open=body.classList.toggle('hidden')===false;toggle.textContent=open?'Close':'View / edit';toggle.setAttribute('aria-expanded',String(open))});s.entries.forEach(e=>body.append(entryUI(e,null)));const del=document.createElement('button');del.className='subtle';del.textContent='Delete saved session';del.addEventListener('click',()=>{if(confirm('Delete this saved session and its writing?')){data.history.splice(i,1);save();renderHistory()}});body.append(del);const upload=document.createElement('button');upload.textContent='Retry Google save';upload.addEventListener('click',async()=>{upload.disabled=true;try{await appendSession(s);queueAnswerHistory(s);await flushAnswerHistory();data.history=data.history.filter(x=>x.id!==s.id);save();renderHistory();msg('Saved to Google Doc.')}catch(e){msg('Save not confirmed: '+e.message+'. Check the Doc before retrying.')}finally{upload.disabled=false}});body.append(upload);head.append(title,toggle);card.append(head,body);box.append(card)});}
let favoriteOrder=[];
function shuffleFavoritesOrder(){favoriteOrder=data.favorites.filter(p=>data.prompts.includes(p));for(let i=favoriteOrder.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[favoriteOrder[i],favoriteOrder[k]]=[favoriteOrder[k],favoriteOrder[i]];}}
function renderFavorites(){const box=$('favoritesEntries');box.replaceChildren();const items=favoriteOrder.filter(p=>data.favorites.includes(p)&&data.prompts.includes(p));$('favoritesEmpty').hidden=items.length>0;$('shuffleFavorites').disabled=items.length<2;for(const promptText of items){const row=document.createElement('div');row.className='entry favorite-item';const open=document.createElement('button');open.className='favorite-text';open.textContent=promptText;open.setAttribute('aria-label','Write about: '+promptText);open.addEventListener('click',()=>{const idx=data.prompts.indexOf(promptText);if(idx<0)return;data.current=idx;recordShuffle(promptText);save();promptView();data.session.push({prompt:promptText,answer:''});save();renderSession();tab('session');openWriting(data.session.length-1)});const star=document.createElement('button');star.className='favorite-star';star.textContent='★';star.title='Remove from Favorites';star.setAttribute('aria-label','Remove from Favorites: '+promptText);star.addEventListener('click',()=>toggleFavorite(promptText));row.append(open,star);box.append(row)}}
$('shuffleFavorites').addEventListener('click',()=>{shuffleFavoritesOrder();renderFavorites()});
$('favoriteCurrent').addEventListener('click',()=>{const p=data.prompts[data.current];if(p)toggleFavorite(p)});
async function toggleFavorite(p){if(!accessToken){msg('Connect Google to sync Favorites across devices.');tab('settings');return}if(changeBusy||googleBusy){msg('Wait for syncing to finish, then try again.');return}changeBusy=true;promptView();try{const {name,prompts,favorites}=await readSheet();const key=normalizePrompt(p);const match=prompts.find(x=>normalizePrompt(x)===key);if(!match)throw Error('This prompt is no longer in your Google Sheet. Sync prompts and try again.');const next=new Set(favorites);if(next.has(match))next.delete(match);else next.add(match);await writeFavoritesColumn(name,prompts,next);data.favorites=[...next];save();promptView();favoriteOrder=favoriteOrder.filter(x=>data.favorites.includes(x));for(const x of data.favorites)if(!favoriteOrder.includes(x))favoriteOrder.push(x);renderFavorites();renderLibrary();msg(next.has(match)?'Added to Favorites.':'Removed from Favorites.')}catch(e){msg('Could not update Favorites: '+e.message)}finally{changeBusy=false;promptView()}}
async function writeFavoritesColumn(name,prompts,favorites){const range="'"+name.replace(/'/g,"''")+"'!B1:B"+(prompts.length+1);await googleFetch(sheetsBase+'/values/'+encodeURIComponent(range)+'?valueInputOption=RAW',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({values:[['Favorite'],...prompts.map(p=>[favorites.has(p)?'TRUE':''])]})})}
function renderLibrary(){const box=$('libraryEntries');box.replaceChildren();data.prompts.forEach((p,i)=>{const row=document.createElement('div');row.className='entry row between';const text=document.createElement('span');text.style.flex='1 1 220px';text.textContent=p;const del=document.createElement('button');del.className='subtle';del.textContent='Delete';del.setAttribute('aria-label','Delete prompt: '+p);del.addEventListener('click',()=>{if(!accessToken){msg('Connect Google before deleting synced prompts.');return}changePrompts('delete',[p])});const star=document.createElement('button');star.className='favorite-star';const selected=data.favorites.includes(p);star.textContent=selected?'★':'☆';star.setAttribute('aria-label',(selected?'Remove from':'Add to')+' Favorites: '+p);star.setAttribute('aria-pressed',String(selected));star.addEventListener('click',()=>toggleFavorite(p));row.append(text,star,del);box.append(row)});}
$('shuffle').addEventListener('click',()=>{if(data.prompts.length<2)return;const next=nextDeckPrompt();const i=data.prompts.indexOf(next);if(i<0){resetDeck();return;}data.current=i;recordShuffle(next);save();promptView();msg('')});
$('promptBack').addEventListener('click',()=>{if(trailPosition>0){trailPosition--;showTrailPosition();}});
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
$('saveSession').addEventListener('click',async()=>{if(!data.session.length){msg('Add a prompt before saving.');return}if(!accessToken){msg('Connect Google before saving to your master journal. Your draft is still on this device.');tab('settings');return}const button=$('saveSession');button.disabled=true;const session={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),created:new Date().toISOString(),entries:data.session.map(e=>({...e}))};data.history.unshift(session);save();try{await appendSession(session);queueAnswerHistory(session);const historySynced=await flushAnswerHistory();data.history=data.history.filter(x=>x.id!==session.id);data.session=[];save();renderSession();renderHistory();msg(historySynced?'Saved to your Google Doc and answer history!':'Saved to your Google Doc. Answer history is waiting to sync; retry in Settings.');}catch(e){data.session=[];save();renderSession();renderHistory();tab('settings');msg('Google save not confirmed: '+e.message+'. Your writing is saved under Unconfirmed saves in Settings. Check the Doc before retrying.')}finally{button.disabled=false}});
$('clearSession').addEventListener('click',()=>{if(data.session.length&&!confirm('Clear this session and all its responses?'))return;data.session=[];save();renderSession();msg('Session cleared.')});
$('promptForm').addEventListener('submit',e=>{e.preventDefault();const lines=$('newPrompts').value.split('\n').map(s=>s.trim()).filter(Boolean);if(!lines.length){msg('Enter at least one prompt.');return}if(lines.length>1000){msg('Please add at most 1,000 prompts at once.');return}if(accessToken){changePrompts('add',lines).then(ok=>{if(ok)$('newPrompts').value=''})}else{msg('Connect Google before adding prompts to the shared library.');tab('settings')}});
for(const btn of document.querySelectorAll('[data-tab]'))btn.addEventListener('click',()=>tab(btn.dataset.tab));
const enc=new TextEncoder(),dec=new TextDecoder();
function b64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}function unb64(s){return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
async function keyFor(pass,salt){const base=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
// Google integration: user-granted OAuth access token lives only in memory (not localStorage).
const CLIENT_ID='1078785397105-o7en9hjue91g808u058c9ojr2ivt723v.apps.googleusercontent.com';
const SHEET_ID='1Ud6j4mB0nTYnECrZ342gud96KF-Ta8I1VWtrEZ9hfr0';
const DOC_ID='18p2NmZczAyeQ2KQRX4m__bp0bLMf3ZvJkkCVBJK8-ic';
const SCOPES='https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/documents';
let accessToken=null,tokenClient=null,googleBusy=false,syncTimer=null;let lastSync=0;let changeBusy=false;
const normalizePrompt=p=>String(p||'').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const uniquePrompts=arr=>{const seen=new Set();return arr.map(p=>String(p).trim()).filter(p=>{const key=normalizePrompt(p);if(!key||seen.has(key))return false;seen.add(key);return true})};
function googleStatus(s){$('googleState').textContent=s; if(!accessToken)$('welcomeStatus').textContent=s;}
function initTokenClient(){if(tokenClient)return true;if(!window.google?.accounts?.oauth2){googleStatus('Google sign-in has not loaded. Check your internet connection and refresh.');return false}tokenClient=google.accounts.oauth2.initTokenClient({client_id:CLIENT_ID,scope:SCOPES,callback:async result=>{if(result.error){googleStatus('Google authorization failed: '+result.error);return}accessToken=result.access_token;$('welcome').classList.add('hidden');promptView();googleStatus('Connected to Google for this browser session. Syncing prompts…');await syncPrompts();await refreshHistoryCounts();if(pendingIndex().length)await flushAnswerHistory();if(data.history.length)msg('You have an unconfirmed save. Check Settings and your Google Doc before retrying.')}});return true}
function connectGoogle(){if(!initTokenClient())return;tokenClient.requestAccessToken({prompt:accessToken?'':'consent'})}
async function googleFetch(url,opts={}){if(!accessToken)throw Error('Connect Google first.');const headers={Authorization:'Bearer '+accessToken,...opts.headers};const response=await fetch(url,{...opts,headers});let payload;try{payload=await response.json()}catch{payload={}}if(!response.ok){if(response.status===401){accessToken=null;promptView();googleStatus('Google authorization expired. Please reconnect.');$('welcome').classList.remove('hidden')}throw Error(payload.error?.message||'Google request failed ('+response.status+')')}return payload}
const sheetsBase='https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(SHEET_ID);
async function sheetName(){const r=await googleFetch(sheetsBase+'?fields=sheets(properties(title,gridProperties))');if(!r.sheets?.length)throw Error('No worksheet found in the Google Sheet.');return r.sheets[0].properties.title}
function sheetRange(name){return "'"+name.replace(/'/g,"''")+"'!A:A"}
async function readSheet(){const name=await sheetName();const range="'"+name.replace(/'/g,"''")+"'!A:B";const r=await googleFetch(sheetsBase+'/values/'+encodeURIComponent(range));const rows=(r.values||[]).filter((row,i)=>!(i===0&&normalizePrompt(row[0])==='prompt'));const prompts=uniquePrompts(rows.map(row=>row[0]||''));const favorites=prompts.filter(p=>rows.some(row=>normalizePrompt(row[0])===normalizePrompt(p)&&/^(true|yes|1|★)$/i.test(String(row[1]||'').trim())));return {name,prompts,favorites} }
async function writeSheet(name,prompts,favorites){const range="'"+name.replace(/'/g,"''")+"'!A:B";await googleFetch(sheetsBase+'/values/'+encodeURIComponent(range)+':clear',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const target="'"+name.replace(/'/g,"''")+"'!A1";await googleFetch(sheetsBase+'/values/'+encodeURIComponent(target)+'?valueInputOption=RAW',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({values:[['Prompt','Favorite'],...prompts.map(p=>[p,favorites.has(p)?'TRUE':''])]})})}
function showPrompts(prompts,favorites=data.favorites){data.favorites=favorites.filter(p=>prompts.includes(p));const old=data.prompts[data.current];data.prompts=prompts;resetDeck();const idx=prompts.indexOf(old);data.current=idx>=0?idx:Math.min(data.current,Math.max(0,prompts.length-1));shuffleTrail=shuffleTrail.filter(p=>prompts.includes(p));if(!shuffleTrail.length||!shuffleTrail.includes(prompts[data.current]))resetShuffleTrail();else trailPosition=shuffleTrail.lastIndexOf(prompts[data.current]);save();promptView();renderLibrary();favoriteOrder=favoriteOrder.filter(p=>data.favorites.includes(p));for(const p of data.favorites)if(!favoriteOrder.includes(p))favoriteOrder.push(p);renderFavorites()}
async function syncPrompts(){if(!accessToken||googleBusy||changeBusy)return;googleBusy=true;$('googleSync').disabled=true;try{const {prompts,favorites}=await readSheet();showPrompts(prompts,favorites);lastSync=Date.now();googleStatus('Google connected · '+prompts.length+' prompts synced.');msg('Prompt library refreshed from Google Sheets.')}catch(e){googleStatus('Sync error: '+e.message);msg('Sync failed: '+e.message)}finally{googleBusy=false;$('googleSync').disabled=false}}
async function changePrompts(action,items){if(!accessToken||changeBusy)return false;changeBusy=true;try{const {name,prompts,favorites}=await readSheet();let next;let nextFavorites=new Set(favorites);
 if(action==='add')next=uniquePrompts([...prompts,...items]);
 else if(action==='edit'){
   const [original,updated]=items;
   const at=prompts.findIndex(p=>normalizePrompt(p)===normalizePrompt(original));
   if(at<0)throw Error('This prompt has changed or was deleted on another device. Sync and try again.');
   if(prompts.some((p,i)=>i!==at&&normalizePrompt(p)===normalizePrompt(updated)))throw Error('That prompt already exists.');
   next=[...prompts];next[at]=updated;if(nextFavorites.delete(prompts[at]))nextFavorites.add(updated);
 }else next=prompts.filter(p=>!items.some(item=>normalizePrompt(item)===normalizePrompt(p)));await writeSheet(name,next,nextFavorites);showPrompts(next,[...nextFavorites]);lastSync=Date.now();googleStatus('Google connected · '+next.length+' prompts synced.');msg(action==='add'?'Prompt(s) added to Google Sheets.':action==='edit'?'Prompt edited in Google Sheets.':'Prompt deleted from Google Sheets.');return true}catch(e){msg('Google Sheets update failed: '+e.message);return false}finally{changeBusy=false;promptView()}}
function schedulePromptSync(){if(!accessToken)return;clearTimeout(syncTimer);syncTimer=setTimeout(syncPrompts,650)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-lastSync>10000)syncPrompts()});window.addEventListener('focus',()=>{if(Date.now()-lastSync>10000)syncPrompts()});setInterval(()=>{if(!document.hidden&&Date.now()-lastSync>60000)syncPrompts()},60000);
$('googleConnect').addEventListener('click',connectGoogle);$('welcomeConnect').addEventListener('click',connectGoogle);$('welcomeDraft').addEventListener('click',()=>{$('welcome').classList.add('hidden');tab('session');msg('Offline draft mode. Connect Google in Settings to sync or save.');});
$('googleSync').addEventListener('click',()=>{if(accessToken)syncPrompts();else connectGoogle()});
$('googleDisconnect').addEventListener('click',()=>{if(accessToken&&window.google?.accounts?.oauth2)google.accounts.oauth2.revoke(accessToken,()=>{});accessToken=null;historyLoaded=false;historyCounts=new Map();promptView();renderSession();$('welcome').classList.remove('hidden');googleStatus('Disconnected. Your local prompts and entries remain on this device.');msg('Disconnected from Google.')});
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
  const dividerStart=content.length;
  add('⋆˚꩜｡⋆');
  const dividerEnd=content.length;
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
    ...boldSpans.map(span=>({updateTextStyle:{range:{startIndex:insertionIndex+span.start,endIndex:insertionIndex+span.end},textStyle:{bold:true},fields:'bold'}})),
    {updateParagraphStyle:{range:{startIndex:insertionIndex+dividerStart,endIndex:insertionIndex+dividerEnd},paragraphStyle:{alignment:'CENTER'},fields:'alignment'}}
  ];
  await googleFetch(url+':batchUpdate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests})});
  const r=receipts();r[id]=new Date().toISOString();localStorage.setItem(receiptKey,JSON.stringify(r));
}

// Future-only history: a hidden tab in the existing private prompts spreadsheet.
const INDEX_TAB='Answer History';
const INDEX_PENDING_KEY='journal-prompts-pending-answer-index-v1';
function pendingIndex(){try{const v=JSON.parse(localStorage.getItem(INDEX_PENDING_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function storePendingIndex(items){localStorage.setItem(INDEX_PENDING_KEY,JSON.stringify(items));updateIndexStatus()}
function updateIndexStatus(){const n=pendingIndex().length;$('indexState').textContent=n?n+' saved session'+(n===1?'':'s')+' waiting to be indexed.':'Future saved responses are indexed for comparison.'}
function queueAnswerHistory(session){const q=pendingIndex();if(!q.some(s=>s.id===session.id)){q.push({id:session.id,created:session.created,entries:session.entries.map(e=>({prompt:e.prompt,answer:e.answer||''}))});storePendingIndex(q)}}
function indexRange(tab,range){return encodeURIComponent("'"+tab.replace(/'/g,"''")+"'!"+range)}
async function ensureIndexTab(){
 const meta=await googleFetch(sheetsBase+'?fields=sheets(properties(title))');
 if((meta.sheets||[]).some(s=>s.properties?.title===INDEX_TAB))return;
 try{await googleFetch(sheetsBase+':batchUpdate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requests:[{addSheet:{properties:{title:INDEX_TAB,hidden:true}}}]})})}catch(e){if(!String(e.message).includes('already exists'))throw e}
 await googleFetch(sheetsBase+'/values/'+indexRange(INDEX_TAB,'A1:E1')+'?valueInputOption=RAW',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({values:[['Entry ID','Session date','Prompt','Response','Session ID']]})});
}
let historyLoaded=false;let historyCounts=new Map();function historyCount(p){return historyCounts.get(normalizePrompt(p))||0}async function refreshHistoryCounts(){if(!accessToken)return;try{const rows=await readIndexRows();const next=new Map();for(const row of rows){const key=normalizePrompt(row[2]);if(key)next.set(key,(next.get(key)||0)+1)}historyCounts=next;historyLoaded=true;renderSession()}catch(e){historyLoaded=false;historyCounts=new Map();renderSession();console.warn('Answer history counts unavailable:',e.message)}}
async function readIndexRows(){await ensureIndexTab();const r=await googleFetch(sheetsBase+'/values/'+indexRange(INDEX_TAB,'A2:E'));return r.values||[]}
let indexBusy=false;
async function flushAnswerHistory(){
 if(!accessToken||indexBusy)return false;
 const pending=pendingIndex();if(!pending.length){updateIndexStatus();return true}
 indexBusy=true;
 try{
   const existing=await readIndexRows();const ids=new Set(existing.map(row=>row[0]));const rows=[];
   for(const session of pending)(session.entries||[]).forEach((entry,i)=>{const id=session.id+':'+i;if(!ids.has(id)){rows.push([id,session.created,entry.prompt||'',entry.answer||'',session.id]);ids.add(id)}});
   if(rows.length)await googleFetch(sheetsBase+'/values/'+indexRange(INDEX_TAB,'A:E')+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({values:rows})});await refreshHistoryCounts();
   storePendingIndex([]);return true;
 }catch(e){updateIndexStatus();msg('Answer history could not sync: '+e.message+'. Your Google Doc save is unaffected.');return false}
 finally{indexBusy=false}
}
async function openPastAnswers(promptText){
 const overlay=$('pastAnswersOverlay'),list=$('pastAnswersList');$('pastAnswersPrompt').textContent=promptText;list.replaceChildren();
 const notice=document.createElement('p');notice.className='note';notice.textContent='Loading earlier answers…';list.append(notice);overlay.classList.remove('hidden');
 if(!accessToken){notice.textContent='Connect Google in Settings to see earlier answers.';return}
 try{
   const rows=await readIndexRows();const matches=rows.filter(row=>normalizePrompt(row[2]||'')===normalizePrompt(promptText)).sort((a,b)=>String(b[1]).localeCompare(String(a[1])));
   list.replaceChildren();if(!matches.length){notice.textContent='No earlier saved answers yet. Future saved answers will appear here.';list.append(notice);return}
   for(const row of matches){const card=document.createElement('article');card.className='entry';const time=document.createElement('strong');const date=new Date(row[1]);time.textContent=Number.isNaN(date.getTime())?'Saved entry':date.toLocaleString(undefined,{year:'numeric',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});const body=document.createElement('p');body.className='past-answer-text';body.textContent=row[3]||'(No written response)';card.append(time,body);list.append(card)}
 }catch(e){list.replaceChildren();notice.textContent='Could not load answers: '+e.message;list.append(notice)}
}
// Read-only "On This Day" uses the same private future-only answer index.
function calendarShift(date,months,days=0){const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());if(months){const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+months);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));}if(days)d.setDate(d.getDate()+days);return d;}
function localDay(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
async function renderMemories(){
 const box=$('memoryEntries');box.replaceChildren();
 if(!accessToken){box.textContent='Connect Google in Settings to view memories.';return;}
 const loading=document.createElement('p');loading.className='note';loading.textContent='Looking through your saved entries…';box.append(loading);
 try{
  const rows=await readIndexRows();if($('memories').classList.contains('hidden'))return;
  const today=new Date();const groups=[['A week ago',calendarShift(today,0,-7)],['Six months ago',calendarShift(today,-6)],['A year ago',calendarShift(today,-12)]];
  box.replaceChildren();
  for(const [label,date] of groups){
   const section=document.createElement('section');section.className='memory-group';
   const heading=document.createElement('h3');heading.textContent=label;section.append(heading);
   const dateLabel=document.createElement('p');dateLabel.className='note';dateLabel.textContent=date.toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});section.append(dateLabel);
   const matches=rows.filter(r=>{const d=new Date(r[1]);return !Number.isNaN(d.getTime())&&localDay(d)===localDay(date)});
   if(!matches.length){const empty=document.createElement('p');empty.className='note';empty.textContent='No indexed entries from this date yet.';section.append(empty);}
   else for(const r of matches){const card=document.createElement('article');card.className='entry';const prompt=document.createElement('strong');prompt.textContent=r[2]||'Untitled prompt';const answer=document.createElement('p');answer.className='past-answer-text';answer.textContent=r[3]||'(No written response)';card.append(prompt,answer);section.append(card);}
   box.append(section);
  }
 }catch(e){box.replaceChildren();const error=document.createElement('p');error.className='note';error.textContent='Could not load memories: '+e.message;box.append(error);}
}
$('pastAnswersClose').addEventListener('click',()=>$('pastAnswersOverlay').classList.add('hidden'));
$('pastAnswersOverlay').addEventListener('click',e=>{if(e.target===$('pastAnswersOverlay'))$('pastAnswersOverlay').classList.add('hidden')});
$('indexRetry').addEventListener('click',async()=>{const ok=await flushAnswerHistory();msg(ok?'Answer history is up to date.':'Answer history is still waiting to sync.')});
updateIndexStatus();

$('deleteAll').addEventListener('click',()=>{if(!confirm('Clear local prompts, drafts, and unconfirmed saves on this device? Saved Google files will not be affected.'))return;if(!confirm('Are you sure? Local drafts and unconfirmed saves cannot be recovered after clearing.'))return;data=fresh();save();promptView();renderSession();tab('session');msg('Local journal data deleted. Google Sheet and Doc were not changed.')});
if(!storageOK)msg('Saved journal data could not be loaded. Avoid writing until browser storage is available.');else save();resetShuffleTrail();resetDeck();promptView();renderSession();renderHistory();if(data.session.length||data.history.length)$('welcomeDraft').classList.remove('hidden');
if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
