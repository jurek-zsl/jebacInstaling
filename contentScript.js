(function(){
  if(window.__jebacInstalingRemade) return;
  window.__jebacInstalingRemade = true;

  const DEBUG = true;
  const log = (...a)=> DEBUG && console.log('[JebacInstaling]', ...a);

  const sleep = ms => new Promise(r=>setTimeout(r, ms));

  function getChildId(){
    try {
      const qp = new URLSearchParams(location.search);
      if(qp.has('child_id')) return qp.get('child_id');
      if(window.child_id) return window.child_id;
    } catch(e){ log('child_id err', e); }
    return null;
  }

  function normalize(w){
    return (w||'').toString().trim().toLowerCase().normalize('NFC');
  }

  function waitFor(selector, timeout=10000){
    return new Promise((resolve, reject)=>{
      const start = Date.now();
      const tick = ()=>{
        const el = document.querySelector(selector);
        if(el) return resolve(el);
        if(Date.now()-start>timeout) return reject(new Error('Timeout waiting for '+selector));
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  function createUI(){
    const box = document.createElement('div');
    box.id = 'jebac-instaling-box';
    box.style.cssText = `
      position:fixed;top:12px;right:12px;z-index:2147483647;background:#111;border:1px solid #444;
      color:#fff;font:12px/1.4 Arial, sans-serif;padding:10px 12px;max-width:240px;border-radius:8px;
      box-shadow:0 4px 14px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:6px;opacity:.95;
    `;
    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <strong style="font-size:13px;">JebacInstaling</strong>
        <button id="ji-close" style="background:#333;color:#fff;border:none;padding:2px 6px;font-size:12px;border-radius:4px;cursor:pointer;">×</button>
      </div>
      <div id="ji-status" style="font-size:11px;color:#ffa726;">Init...</div>
      <div id="ji-progress" style="font-size:11px;color:#ccc;">0 / 0</div>
      <label style="font-size:11px;display:flex;align-items:center;gap:6px;cursor:pointer;">
        <input id="ji-auto" type="checkbox" checked style="margin:0;" /> auto paste
      </label>
      <div style="display:flex;gap:6px;">
        <button id="ji-refetch" style="flex:1;background:#1976d2;color:#fff;border:none;padding:4px 6px;font-size:11px;border-radius:4px;cursor:pointer;">Refetch list</button>
        <button id="ji-fill" style="background:#455a64;color:#fff;border:none;padding:4px 6px;font-size:11px;border-radius:4px;cursor:pointer;">Fill now</button>
      </div>
      <div id="ji-last" style="font-size:11px;color:#8bc34a;min-height:14px;"></div>
    `;
    document.documentElement.appendChild(box);
    box.querySelector('#ji-close').onclick = ()=> box.remove();
    box.querySelector('#ji-refetch').onclick = ()=> fetchAllWords({manual:true});
    box.querySelector('#ji-fill').onclick = ()=> fillAnswerForCurrentWord({manual:true});
    return box;
  }

  function setStatus(msg, color){
    const s = document.getElementById('ji-status');
    if(s){ s.textContent = msg; if(color) s.style.color = color; }
  }
  function setProgress(done,total){
    const p = document.getElementById('ji-progress');
    if(p) p.textContent = `${done} / ${total}`;
  }
  function setLast(msg, color){
    const l = document.getElementById('ji-last');
    if(l){ l.textContent = msg||''; if(color) l.style.color = color; }
  }

  const ui = createUI();

  const wordMap = new Map();
  let lastListFetchTs = 0;
  let fetchingList = false;

  async function fetchAllWords({manual=false}={}){
    if(fetchingList){ log('Already fetching list'); return; }
    const childId = getChildId();
    if(!childId){ setStatus('child_id missing', '#ef5350'); return; }
    fetchingList = true;
    setStatus('Fetching word list...', '#ffa726');
    setProgress(0,0);
    try {
      const url = `https://instaling.pl/learning/repeat_words_new.php?student_id=${encodeURIComponent(childId)}&menu=4&_=${Date.now()}`;
      const html = await fetch(url, {credentials:'include'}).then(r=>r.text());
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const rows = Array.from(doc.querySelectorAll('.table_tests tbody tr'));
      wordMap.clear();
      let added = 0;
      for(const r of rows){
        const tds = r.querySelectorAll('td');
        if(tds.length >= 2){
          const word = tds[0].textContent.trim();
          const translation = tds[1].textContent.trim();
          const nWord = normalize(word);
          const nTrans = normalize(translation);
          if(nWord) wordMap.set(nWord, translation);
          if(nTrans && !wordMap.has(nTrans)) wordMap.set(nTrans, word);
          added++;
          if(added % 50 === 0) setProgress(added, rows.length);
        }
      }
      setProgress(added, rows.length);
      lastListFetchTs = Date.now();
      setStatus(`List ready (${added})`, '#8bc34a');
      fillAnswerForCurrentWord();
    } catch(e){
      log('List fetch error', e);
      setStatus('Fetch failed', '#ef5350');
    } finally {
      fetchingList = false;
    }
  }

  let lastFilledFor = '';

  function detectCurrentWord(){
    const candidates = [];
    const transEls = document.querySelectorAll('.translation');
    if(transEls.length) candidates.push(...transEls);
    const idWord = document.getElementById('word');
    if(idWord) candidates.push(idWord);
    const idLike = document.querySelector('[id*="word"]');
    if(idLike && !candidates.includes(idLike)) candidates.push(idLike);
    function isVisible(node){
      if(!(node instanceof HTMLElement)) return false;
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && node.offsetParent !== null;
    }
    for(const el of candidates){
      if(!el) continue;
      const txt = (el.textContent||'').trim();
      if(txt && isVisible(el)) return txt;
    }
    return null;
  }

  async function fillAnswerForCurrentWord({manual=false}={}){
    const auto = document.getElementById('ji-auto');
    if(!manual && auto && !auto.checked) return;
    const current = detectCurrentWord();
    if(!current){ setLast('No word element', '#ffb74d'); return; }
    const norm = normalize(current);
    if(!norm){ return; }
    if(norm === lastFilledFor && !manual){ return; }
    let translation = wordMap.get(norm);
    if(!translation && wordMap.size===0){
      if(Date.now() - lastListFetchTs > 10000) fetchAllWords();
      return;
    }
    if(!translation){
      for(const [k,v] of wordMap.entries()){
        if(k.startsWith(norm)){ translation = v; break; }
      }
    }
    if(!translation){
      setLast(`? ${current}`, '#ef5350');
      return;
    }
    try {
      const input = document.querySelector('#answer');
      if(!input){ setLast('Answer input not found', '#ef5350'); return; }
      input.value = translation;
      input.dispatchEvent(new Event('input', {bubbles:true}));
      lastFilledFor = norm;
      setLast(`${current} → ${translation}`, '#8bc34a');
    } catch(e){
      log('Fill error', e);
      setLast('Fill error', '#ef5350');
    }
  }

  const wordObserver = new MutationObserver(()=>{
    fillAnswerForCurrentWord();
  });
  (async()=>{
    try {
      const wordEl = await waitFor('#word', 15000).catch(()=>null);
      if(wordEl){
        wordObserver.observe(wordEl, {characterData:true, subtree:true, childList:true});
      }
    } catch(_){}
  })();

  setInterval(()=>{
    const current = detectCurrentWord();
    if(current){ fillAnswerForCurrentWord(); }
  }, 1000);

  document.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      const a = document.querySelector('#answer');
      if(a && a === document.activeElement){
        setTimeout(()=>fillAnswerForCurrentWord(), 900);
      }
    }
  }, true);

  let lastUrl = location.href;
  const urlObs = new MutationObserver(()=>{
    if(location.href !== lastUrl){
      lastUrl = location.href;
      log('URL changed, refreshing list soon');
      setTimeout(()=>fetchAllWords(), 800);
    }
  });
  urlObs.observe(document, {subtree:true, childList:true});

  fetchAllWords();

  window.__JI = { fetchAllWords, fillAnswerForCurrentWord, wordMap };
})();
 