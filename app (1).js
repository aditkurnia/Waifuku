const API_KEYS=['AIzaSyCtxwTNCPD5AjrEm-hCQZxuXVhiwuIeSCY','AIzaSyDIaoU_VrdyW7zRfl3mJk0zC8X1juzDgtg']
const STORAGE_KEY='chat_state_v2'
const API_INDEX_KEY='api_key_index'
const OFFLINE_COOLDOWN_MS=3*60*60*1000
let state={userName:'',aiName:'Rina Amelia',location:'Jakarta',fictionalTime:'',profileImage:'',conversation:[],offlineUntil:0}
let aiStatus='checking'
let apiKeyIndex=parseInt(localStorage.getItem(API_INDEX_KEY)||'0',10)%API_KEYS.length
const chatMessages=document.getElementById('chatMessages')
const messageInput=document.getElementById('messageInput')
const sendButton=document.getElementById('sendButton')
const typingIndicator=document.getElementById('typingIndicator')
const aiNameEl=document.getElementById('aiName')
const profileImageEl=document.getElementById('profileImage')
const profileIconEl=document.getElementById('profileIcon')
const profilePic=document.getElementById('profilePic')
const userNameDisplay=document.getElementById('userNameDisplay')
const statusText=document.getElementById('statusText')
const statusDot=document.getElementById('statusDot')
const onboardingModal=new bootstrap.Modal(document.getElementById('onboardingModal'))
const settingsModalEl=document.getElementById('settingsModal')
const settingsModal=new bootstrap.Modal(settingsModalEl)
const timeSkipModal=new bootstrap.Modal(document.getElementById('timeSkipModal'))
const onbUserName=document.getElementById('onbUserName')
const onbAiName=document.getElementById('onbAiName')
const onbLocation=document.getElementById('onbLocation')
const onbDatetime=document.getElementById('onbDatetime')
const onbPhoto=document.getElementById('onbPhoto')
const onbStart=document.getElementById('onbStart')
const onbReset=document.getElementById('onbReset')
const setUserName=document.getElementById('setUserName')
const setAiName=document.getElementById('setAiName')
const setLocation=document.getElementById('setLocation')
const setDatetime=document.getElementById('setDatetime')
const setPhoto=document.getElementById('setPhoto')
const btnRemovePhoto=document.getElementById('btnRemovePhoto')
const btnClearChat=document.getElementById('btnClearChat')
const btnSaveSettings=document.getElementById('btnSaveSettings')
const openSettings=document.getElementById('openSettings')
const openTimeSkip=document.getElementById('openTimeSkip')
const tsLabel=document.getElementById('tsLabel')
const tsDatetime=document.getElementById('tsDatetime')
const applyTimeSkip=document.getElementById('applyTimeSkip')
let apiKeyInfoEl=null
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);state=Object.assign(state,parsed)}}catch(e){}}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
function saveApiIndex(i){apiKeyIndex=i%API_KEYS.length;localStorage.setItem(API_INDEX_KEY,String(apiKeyIndex));updateApiKeyIndicator()}
function baseUrlForKey(i){return'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key='+API_KEYS[i]}
function pingUrlForKey(i){return'https://generativelanguage.googleapis.com/v1beta/models?key='+API_KEYS[i]}
function nowClock(){const d=new Date();return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0')}
function fmtFiction(iso){try{const d=new Date(iso);const f=new Intl.DateTimeFormat('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Jakarta'});return f.format(d)+' WIB'}catch(e){return iso}}
function addBubble(item){if(item.type==='timeskip'){const banner=document.createElement('div');banner.className='timeskip';banner.innerHTML='<span class="dot"></span><span>Time Skip • '+item.label+'</span><span> • '+fmtFiction(item.iso)+' • '+state.location+'</span>';chatMessages.appendChild(banner);chatMessages.scrollTop=chatMessages.scrollHeight;return}const wrap=document.createElement('div');wrap.className='msg '+(item.role==='user'?'user':'ai');const b=document.createElement('div');b.className='bubble';b.innerHTML=item.content;wrap.appendChild(b);const meta=document.createElement('div');meta.className='meta';meta.textContent=nowClock();wrap.appendChild(meta);chatMessages.appendChild(wrap);chatMessages.scrollTop=chatMessages.scrollHeight}
function renderAll(){chatMessages.innerHTML='';state.conversation.forEach(addBubble)}
function setHeader(){aiNameEl.textContent=state.aiName;userNameDisplay.textContent=state.userName||'—';if(state.profileImage){profileImageEl.src=state.profileImage;profileImageEl.style.display='block';profileIconEl.style.display='none'}else{profileImageEl.src='';profileImageEl.style.display='none';profileIconEl.style.display='block'}}
function showTyping(){typingIndicator.style.display='flex'}
function hideTyping(){typingIndicator.style.display='none'}
function setLoading(v){sendButton.disabled=v;messageInput.disabled=v}
function detectUserTS(text){const t=text.toLowerCase();return t.includes('keesokan')||t.includes('sepulang sekolah')||t.includes('seminggu')||t.includes('malam harinya')||t.includes('pagi harinya')||t.includes('siangnya')||t.includes('time skip')}
function mapPhrase(baseIso,label){const d=new Date(baseIso||new Date().toISOString());const l=(label||'').toLowerCase();if(l.includes('keesokan'))d.setUTCDate(d.getUTCDate()+1);if(l.includes('seminggu'))d.setUTCDate(d.getUTCDate()+7);if(l.includes('sebulan'))d.setUTCMonth(d.getUTCMonth()+1);if(l.includes('sepulang sekolah')){d.setUTCHours(9);d.setUTCMinutes(0);d.setUTCSeconds(0);d.setUTCMinutes(d.getUTCMinutes()+420)}if(l.includes('pagi')){d.setUTCHours(0);d.setUTCMinutes(0);d.setUTCSeconds(0);d.setUTCMinutes(d.getUTCMinutes()+420)}if(l.includes('siang')){d.setUTCHours(5);d.setUTCMinutes(0);d.setUTCMinutes(d.getUTCMinutes()+420)}if(l.includes('malam')){d.setUTCHours(10);d.setUTCMinutes(0);d.setUTCMinutes(d.getUTCMinutes()+420)}return d.toISOString()}
function pushMessage(content,role){const item={role,content};state.conversation.push(item);addBubble(item);saveState()}
function pushTimeSkip(label,iso){const item={type:'timeskip',label,iso};state.conversation.push(item);addBubble(item);saveState()}
function systemPrompt(){const intro='Kamu adalah '+state.aiName+', teman masa kecil '+(state.userName||'User')+'. Kamu hidup dalam cerita slice-of-life SMA di '+state.location+'. Jawab singkat, alami, santai, kadang bertanya balik.';const looks='Rambut biru pendek, mata biru, tinggi 164 cm, suka kucing, fisika, permen jelly, komik, warna biru.';const time='Waktu fiksi sekarang: '+fmtFiction(state.fictionalTime)+'.';const skip='Jika ingin melompat, kirim satu baris: [[TIME_SKIP|label|opsional YYYY-MM-DD HH:mm|opsional ringkasan]] lalu kirim satu pesan deskriptif pendek setelah lompatan.';const len='Panjang 1–2 kalimat.';return [intro,looks,time,skip,len].join(' ')}
function convoText(){let s='';state.conversation.forEach(it=>{if(it.type==='timeskip')return;if(it.role==='user'){s+='User: '+it.content+'\n'}else{s+=state.aiName+': '+it.content+'\n'}});return s}
function setStatusUI(mode,label){aiStatus=mode;statusText.textContent=label||((mode==='online')?'Online':(mode==='offline')?'Offline':'Menghubungkan...');statusDot.classList.remove('online','offline','checking');statusDot.classList.add(mode);updateApiKeyIndicator()}
function nowMs(){return Date.now()}
function isOfflineLocked(){return state.offlineUntil&&nowMs()<state.offlineUntil}
function lockOffline(hours){const ms=(hours&&hours>0?hours*60*60*1000:OFFLINE_COOLDOWN_MS);state.offlineUntil=nowMs()+ms;saveState();setStatusUI('offline')}
function clearOfflineLock(){if(state.offlineUntil&&nowMs()>=state.offlineUntil){state.offlineUntil=0;saveState()}}
async function tryFetch(url,options){const controller=new AbortController();const t=setTimeout(()=>controller.abort(),8000);try{const r=await fetch(url,{...options,signal:controller.signal});clearTimeout(t);return r}catch(e){clearTimeout(t);throw e}}
async function pingKey(i){const url=pingUrlForKey(i);const res=await tryFetch(url,{method:'GET'});if(!res.ok)throw new Error('HTTP '+res.status);return true}
async function checkAiConnectivity(opts){const silent=(opts&&opts.silent)===true;if(isOfflineLocked()){setStatusUI('offline');return false}if(!navigator.onLine){setStatusUI('offline');return false}if(!silent)setStatusUI('checking');const order=[apiKeyIndex,(apiKeyIndex+1)%API_KEYS.length];for(let k=0;k<order.length;k++){try{const idx=order[k];const ok=await pingKey(idx);if(ok){if(apiKeyIndex!==idx)saveApiIndex(idx);setStatusUI('online');return true}}catch(e){}}lockOffline();return false}
async function geminiCallWithKey(idx,text){const url=baseUrlForKey(idx);const res=await tryFetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:text}]}],generationConfig:{temperature:0.8,topK:40,topP:0.95,maxOutputTokens:220},safetySettings:[{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'}]})});if(!res.ok)throw new Error('HTTP '+res.status);const data=await res.json();const txt=data?.candidates?.[0]?.content?.parts?.[0]?.text||'';if(!txt)throw new Error('EMPTY');return txt.trim()}
async function callModel(tail){if(isOfflineLocked())throw new Error('OFFLINE_LOCKED');const text=systemPrompt()+'\n\nPercakapan:\n'+convoText()+tail;const order=[apiKeyIndex,(apiKeyIndex+1)%API_KEYS.length];let lastErr=null;for(let k=0;k<order.length;k++){try{const idx=order[k];const out=await geminiCallWithKey(idx,text);if(apiKeyIndex!==idx)saveApiIndex(idx);setStatusUI('online');return out}catch(e){lastErr=e;continue}}lockOffline();throw lastErr||new Error('BOTH_KEYS_FAILED')}
function cleanAiPrefix(txt){const re=new RegExp('^'+state.aiName+':\\s*','i');return txt.replace(re,'')}
function parseTS(text){const m=text.match(/\[\[TIME_SKIP\|([^\]|]+)(?:\|([^\]|]+))?(?:\|([^\]]+))?\]\]/i);if(!m)return null;return{label:(m[1]||'').trim(),datetime:(m[2]||'').trim(),note:(m[3]||'').trim()}}
async function performTimeSkip(label,overrideDT){let target=state.fictionalTime||new Date().toISOString();if(overrideDT){const v=overrideDT.replace('WIB','').trim();const parts=v.split(' ');if(parts.length>=2){const [ds,ts]=[parts[0],parts[1]];const [y,m,d]=ds.split('-').map(Number);const [hh,mm]=ts.split(':').map(Number);const t=new Date(Date.UTC(y,(m||1)-1,d||1,hh||0,mm||0,0));target=t.toISOString()}}else{target=mapPhrase(state.fictionalTime,label)}state.fictionalTime=target;saveState();pushTimeSkip(label||'Lompatan waktu',state.fictionalTime);const ok=await checkAiConnectivity({silent:true});if(!ok)return;const narr='Setelah lompatan "'+(label||'')+'" di '+state.location+' pada '+fmtFiction(state.fictionalTime)+', ceritakan singkat harimu dan tebak ringan kegiatan '+(state.userName||'kamu')+', lalu beri 1 pertanyaan kecil.';try{const raw=await callModel('\nUser: '+narr+'\n'+state.aiName+':');const dir=parseTS(raw);if(dir){await performTimeSkip(dir.label||'Lompatan waktu',dir.datetime||'');return}const txt=cleanAiPrefix(raw);pushMessage(txt,'ai')}catch(e){}}
async function sendMessage(){const v=messageInput.value.trim();if(!v)return;pushMessage(v,'user');messageInput.value='';setLoading(true);showTyping();try{const ok=await checkAiConnectivity({silent:true});if(!ok){hideTyping();setLoading(false);messageInput.focus();return}if(detectUserTS(v)){await performTimeSkip(v,'');hideTyping();setLoading(false);messageInput.focus();return}const raw=await callModel('\nUser: '+v+'\n'+state.aiName+':');hideTyping();const dir=parseTS(raw);if(dir){await performTimeSkip(dir.label||'Lompatan waktu',dir.datetime||'');setLoading(false);messageInput.focus();return}const txt=cleanAiPrefix(raw);pushMessage(txt,'ai')}catch(e){hideTyping()}finally{setLoading(false);messageInput.focus()}}
function greetIfEmpty(){if(state.conversation.length>0)return;const open='Halo '+(state.userName||'')+'! Aku '+state.aiName+'. Kita mulai di '+state.location+' pada '+fmtFiction(state.fictionalTime)+'. Senang ketemu lagi ✨';pushMessage(open,'ai')}
function toDatetimeLocalValue(iso){if(!iso)return'';const d=new Date(iso);const off=d.getTimezoneOffset();const d2=new Date(d.getTime()-off*60000);return d2.toISOString().slice(0,16)}
function fromDatetimeLocalValue(v){if(!v)return'';const d=new Date(v);return d.toISOString()}
function handleOnboardingOpen(){onbUserName.value='';onbAiName.value=state.aiName||'Rina';onbLocation.value=state.location||'Jakarta';onbDatetime.value='';onbPhoto.value=''}
function applyOnboarding(){const u=onbUserName.value.trim();const a=onbAiName.value.trim()||'Rina';const loc=onbLocation.value.trim()||'Jakarta';let t=onbDatetime.value?fromDatetimeLocalValue(onbDatetime.value):new Date().toISOString();state.userName=u;state.aiName=a;state.location=loc;state.fictionalTime=t;if(onbPhoto.files[0]){const r=new FileReader();r.onload=e=>{state.profileImage=e.target.result;saveState();setHeader();renderAll();greetIfEmpty();onboardingModal.hide()};r.readAsDataURL(onbPhoto.files[0]);saveState()}else{saveState();setHeader();renderAll();greetIfEmpty();onboardingModal.hide()}checkAiConnectivity()}
function openSettingsFill(){setUserName.value=state.userName||'';setAiName.value=state.aiName||'';setLocation.value=state.location||'';setDatetime.value=toDatetimeLocalValue(state.fictionalTime);setPhoto.value='';ensureApiKeyIndicator()}
function saveSettings(){state.userName=setUserName.value.trim()||state.userName;state.aiName=setAiName.value.trim()||state.aiName;state.location=setLocation.value.trim()||state.location;state.fictionalTime=setDatetime.value?fromDatetimeLocalValue(setDatetime.value):state.fictionalTime;if(setPhoto.files[0]){const r=new FileReader();r.onload=e=>{state.profileImage=e.target.result;saveState();setHeader();settingsModal.hide()};r.readAsDataURL(setPhoto.files[0])}else{saveState();setHeader();settingsModal.hide()}}
function removePhoto(){state.profileImage='';saveState();setHeader()}
function clearChat(){state.conversation=[];saveState();renderAll()}
function ensureApiKeyIndicator(){if(!apiKeyInfoEl){const body=settingsModalEl.querySelector('.modal-body');apiKeyInfoEl=document.createElement('div');apiKeyInfoEl.id='apiKeyIndicator';apiKeyInfoEl.style.marginTop='-4px';apiKeyInfoEl.style.marginBottom='6px';apiKeyInfoEl.style.fontSize='.9rem';apiKeyInfoEl.style.opacity='0.9';apiKeyInfoEl.style.padding='6px 10px';apiKeyInfoEl.style.border='1px dashed rgba(255,255,255,.35)';apiKeyInfoEl.style.borderRadius='8px';apiKeyInfoEl.style.display='inline-flex';apiKeyInfoEl.style.gap='8px';apiKeyInfoEl.style.alignItems='center';const dot=document.createElement('span');dot.id='apiKeyDot';dot.style.width='8px';dot.style.height='8px';dot.style.borderRadius='50%';dot.style.display='inline-block';apiKeyInfoEl.appendChild(dot);const text=document.createElement('span');text.id='apiKeyText';apiKeyInfoEl.appendChild(text);body.prepend(apiKeyInfoEl)}updateApiKeyIndicator()}
function updateApiKeyIndicator(){if(!settingsModalEl)return;const dot=settingsModalEl.querySelector('#apiKeyDot');const text=settingsModalEl.querySelector('#apiKeyText');if(!dot||!text)return;const active='Key '+(apiKeyIndex+1);const status=(aiStatus==='online'?'Online':aiStatus==='checking'?'Menghubungkan...':'Offline');dot.style.background=(aiStatus==='online')?'#22c55e':(aiStatus==='checking')?'#f59e0b':'#ef4444';let extra='';if(isOfflineLocked()){const until=new Date(state.offlineUntil);extra=' • Offline hingga '+until.toLocaleString('id-ID')}text.textContent='API Key Aktif: '+active+' • Status: '+status+extra}
profilePic.addEventListener('click',()=>{openSettingsFill();settingsModal.show()})
openSettings.addEventListener('click',()=>{openSettingsFill();settingsModal.show()})
openTimeSkip.addEventListener('click',()=>{tsLabel.value='';tsDatetime.value='';timeSkipModal.show()})
document.querySelectorAll('.ts-preset').forEach(b=>b.addEventListener('click',()=>{tsLabel.value=b.getAttribute('data-label')}))
applyTimeSkip.addEventListener('click',async()=>{const label=(tsLabel.value||'Keesokan harinya').trim();const dt=tsDatetime.value?toISOFromLocal(tsDatetime.value):'';timeSkipModal.hide();await performTimeSkip(label,dt?fmtFromLocal(dt):'')})
function toISOFromLocal(v){const d=new Date(v);return d.toISOString()}
function fmtFromLocal(iso){const d=new Date(iso);const y=d.getUTCFullYear();const m=(d.getUTCMonth()+1).toString().padStart(2,'0');const da=d.getUTCDate().toString().padStart(2,'0');const hh=d.getUTCHours().toString().padStart(2,'0');const mm=d.getUTCMinutes().toString().padStart(2,'0');return y+'-'+m+'-'+da+' '+hh+':'+mm}
btnSaveSettings.addEventListener('click',saveSettings)
btnRemovePhoto.addEventListener('click',removePhoto)
btnClearChat.addEventListener('click',clearChat)
sendButton.addEventListener('click',sendMessage)
messageInput.addEventListener('keypress',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}})
onbStart.addEventListener('click',()=>{if(!onbUserName.value.trim()){onbUserName.focus();return}applyOnboarding()})
onbReset.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(API_INDEX_KEY);location.reload()})
window.addEventListener('online',()=>{clearOfflineLock();checkAiConnectivity()})
window.addEventListener('offline',()=>setStatusUI('offline'))
function init(){loadState();setHeader();renderAll();clearOfflineLock();if(!state.userName){onbUserName.value='';onboardingModal.show()}else{greetIfEmpty();checkAiConnectivity()}setInterval(()=>{clearOfflineLock();checkAiConnectivity({silent:true})},60000)}
init()