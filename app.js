const API_KEY='AIzaSyCtxwTNCPD5AjrEm-hCQZxuXVhiwuIeSCY'
const BASE_URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
const MODELS_URL='https://generativelanguage.googleapis.com/v1beta/models?key='+API_KEY
const STORAGE_KEY='chat_state_v2'
let state={userName:'',aiName:'Rina Amelia',location:'Jakarta',fictionalTime:'',profileImage:'',conversation:[]}
let aiStatus='checking'
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
const settingsModal=new bootstrap.Modal(document.getElementById('settingsModal'))
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
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw);state=Object.assign(state,parsed)}}catch(e){}}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
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
async function callModel(tail){const text=systemPrompt()+'\n\nPercakapan:\n'+convoText()+tail;const r=await fetch(BASE_URL+'?key='+API_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:text}]}],generationConfig:{temperature:0.8,topK:40,topP:0.95,maxOutputTokens:220},safetySettings:[{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_HATE_SPEECH',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_SEXUALLY_EXPLICIT',threshold:'BLOCK_MEDIUM_AND_ABOVE'},{category:'HARM_CATEGORY_DANGEROUS_CONTENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'}]})});if(!r.ok){const err=await r.json().catch(()=>({}));throw new Error('HTTP '+r.status+': '+(err.error?.message||r.statusText))}const data=await r.json();const part=data?.candidates?.[0]?.content?.parts?.[0]?.text||'';return part.trim()}
function cleanAiPrefix(txt){const re=new RegExp('^'+state.aiName+':\s*','i');return txt.replace(re,'')}
function parseTS(text){const m=text.match(/\[\[TIME_SKIP\|([^\]|]+)(?:\|([^\]|]+))?(?:\|([^\]]+))?\]\]/i);if(!m)return null;return{label:(m[1]||'').trim(),datetime:(m[2]||'').trim(),note:(m[3]||'').trim()}}
function setStatusUI(mode,label){aiStatus=mode;statusText.textContent=label||((mode==='online')?'Online':(mode==='offline')?'Offline':'Menghubungkan...');statusDot.classList.remove('online','offline','checking');statusDot.classList.add(mode)}
async function checkAiConnectivity(opts){const silent=(opts&&opts.silent)===true;if(!silent)setStatusUI('checking');if(!navigator.onLine){setStatusUI('offline');return false}try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);const res=await fetch(MODELS_URL,{method:'GET',signal:controller.signal});clearTimeout(timer);if(res.ok){setStatusUI('online');return true}else{setStatusUI('offline');return false}}catch(e){setStatusUI('offline');return false}}
async function performTimeSkip(label,overrideDT){let target=state.fictionalTime||new Date().toISOString();if(overrideDT){const v=overrideDT.replace('WIB','').trim();const parts=v.split(' ');if(parts.length>=2){const [ds,ts]=[parts[0],parts[1]];const [y,m,d]=ds.split('-').map(Number);const [hh,mm]=ts.split(':').map(Number);const t=new Date(Date.UTC(y,(m||1)-1,d||1,hh||0,mm||0,0));target=t.toISOString()}}else{target=mapPhrase(state.fictionalTime,label)}state.fictionalTime=target;saveState();pushTimeSkip(label||'Lompatan waktu',state.fictionalTime);const ok=await checkAiConnectivity({silent:true});if(!ok){pushMessage('AI sedang offline, skenario akan dilanjutkan saat koneksi kembali.','ai');return}const narr='Setelah lompatan "'+(label||'')+'" di '+state.location+' pada '+fmtFiction(state.fictionalTime)+', ceritakan singkat harimu dan tebak ringan kegiatan '+(state.userName||'kamu')+', lalu beri 1 pertanyaan kecil.';try{const raw=await callModel('\nUser: '+narr+'\n'+state.aiName+':');const dir=parseTS(raw);if(dir){await performTimeSkip(dir.label||'Lompatan waktu',dir.datetime||'');return}const txt=cleanAiPrefix(raw);pushMessage(txt,'ai')}catch(e){pushMessage('Ups, gagal membuat skenario setelah time skip.','ai')}}
async function sendMessage(){const v=messageInput.value.trim();if(!v)return;pushMessage(v,'user');messageInput.value='';setLoading(true);showTyping();try{const ok=await checkAiConnectivity({silent:true});if(!ok){hideTyping();pushMessage('AI sedang offline. Coba lagi nanti.','ai');setLoading(false);messageInput.focus();return}if(detectUserTS(v)){await performTimeSkip(v,'');hideTyping();setLoading(false);messageInput.focus();return}const raw=await callModel('\nUser: '+v+'\n'+state.aiName+':');hideTyping();const dir=parseTS(raw);if(dir){await performTimeSkip(dir.label||'Lompatan waktu',dir.datetime||'');setLoading(false);messageInput.focus();return}const txt=cleanAiPrefix(raw);pushMessage(txt,'ai')}catch(e){hideTyping();pushMessage('Terjadi kesalahan: '+e.message,'ai')}finally{hideTyping();setLoading(false);messageInput.focus()}}
function greetIfEmpty(){if(state.conversation.length>0)return;const open='Halo '+(state.userName||'')+'! Aku '+state.aiName+'. Kita mulai di '+state.location+' pada '+fmtFiction(state.fictionalTime)+'. Senang ketemu lagi ✨';pushMessage(open,'ai')}
function toDatetimeLocalValue(iso){if(!iso)return'';const d=new Date(iso);const off=d.getTimezoneOffset();const d2=new Date(d.getTime()-off*60000);return d2.toISOString().slice(0,16)}
function fromDatetimeLocalValue(v){if(!v)return'';const d=new Date(v);return d.toISOString()}
function handleOnboardingOpen(){onbUserName.value='';onbAiName.value=state.aiName||'Rina';onbLocation.value=state.location||'Jakarta';onbDatetime.value='';onbPhoto.value=''}
function applyOnboarding(){const u=onbUserName.value.trim();const a=onbAiName.value.trim()||'Rina';const loc=onbLocation.value.trim()||'Jakarta';let t=onbDatetime.value?fromDatetimeLocalValue(onbDatetime.value):new Date().toISOString();state.userName=u;state.aiName=a;state.location=loc;state.fictionalTime=t;if(onbPhoto.files[0]){const r=new FileReader();r.onload=e=>{state.profileImage=e.target.result;saveState();setHeader();renderAll();greetIfEmpty();onboardingModal.hide()};r.readAsDataURL(onbPhoto.files[0]);saveState()}else{saveState();setHeader();renderAll();greetIfEmpty();onboardingModal.hide()}checkAiConnectivity()}
function openSettingsFill(){setUserName.value=state.userName||'';setAiName.value=state.aiName||'';setLocation.value=state.location||'';setDatetime.value=toDatetimeLocalValue(state.fictionalTime);setPhoto.value=''}
function saveSettings(){state.userName=setUserName.value.trim()||state.userName;state.aiName=setAiName.value.trim()||state.aiName;state.location=setLocation.value.trim()||state.location;state.fictionalTime=setDatetime.value?fromDatetimeLocalValue(setDatetime.value):state.fictionalTime;if(setPhoto.files[0]){const r=new FileReader();r.onload=e=>{state.profileImage=e.target.result;saveState();setHeader();settingsModal.hide()};r.readAsDataURL(setPhoto.files[0])}else{saveState();setHeader();settingsModal.hide()}}
function removePhoto(){state.profileImage='';saveState();setHeader()}
function clearChat(){state.conversation=[];saveState();renderAll()}
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
onbReset.addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);location.reload()})
window.addEventListener('online',()=>checkAiConnectivity())
window.addEventListener('offline',()=>setStatusUI('offline'))
function init(){loadState();setHeader();renderAll();if(!state.userName){handleOnboardingOpen();onboardingModal.show()}else{greetIfEmpty();checkAiConnectivity()}setInterval(()=>checkAiConnectivity({silent:true}),60000)}
init()
