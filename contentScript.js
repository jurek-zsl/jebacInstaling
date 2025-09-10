// Injected content script: fetch next word, auto-fill answer input, and show floating UI.

(async function() {
  const DEBUG = true;
  function log(...a){ if(DEBUG) console.log('[InstalingHelper]', ...a); }

  // Avoid double-injection
  if (window.__instalingHelperLoaded) { return; }
  window.__instalingHelperLoaded = true;

  // Small helper to wait for element
  function waitFor(selector, timeout = 10000){
    return new Promise((res, rej) => {
      const start = Date.now();
      const int = setInterval(() => {
        const el = document.querySelector(selector);
        if(el){ clearInterval(int); res(el); }
        else if(Date.now() - start > timeout){ clearInterval(int); rej(new Error('Timeout waiting for '+selector)); }
      }, 100);
    });
  }

  function getChildId(){
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.has('child_id')) return urlParams.get('child_id');
      if(window.child_id) return window.child_id;
    } catch(e){ log('child id error', e); }
    return null;
  }

  async function getNextWordId(child_id){
    const response = await fetch('https://instaling.pl/ling2/server/actions/generate_next_word.php', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      method: 'POST',
      body: `child_id=${child_id}&date=${Date.now()}`
    });
    const data = await response.json();
    return data.id;
  }

  async function getWordFromId(id){
    const res = await fetch(`https://instaling.pl/ling2/server/actions/getAudioUrl.php?id=${id}`, { credentials: 'include' });
    const data = await res.json();
    const parts = data.url.split('/');
    return decodeURIComponent(parts[parts.length-1].replace('.mp3',''));
  }

  function createUI(){
    const box = document.createElement('div');
    box.id = 'instaling-helper-box';
    box.style.cssText = `
      position: fixed; z-index: 999999; top: 10px; right: 10px; background: #111; color: #fff;
      font: 12px/1.4 Arial, sans-serif; padding: 8px 10px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,.4);
      display: flex; flex-direction: column; gap: 6px; min-width: 160px; cursor: default; opacity: 0.9;
    `;
    box.innerHTML = `
      <div style="font-weight:600;font-size:13px;">Instaling Helper</div>
      <div id="ih-status" style="color:#8bc34a;">Loading...</div>
      <div style="display:flex; gap:4px;">
        <button id="ih-refetch" style="flex:1; background:#1976d2;color:#fff;border:none;padding:4px 6px;border-radius:4px;cursor:pointer;">Refetch</button>
        <button id="ih-hide" style="background:#444;color:#fff;border:none;padding:4px 6px;border-radius:4px;cursor:pointer;">×</button>
      </div>
      <label style="display:flex;align-items:center;gap:4px;font-size:11px;">
        <input type="checkbox" id="ih-auto" checked /> auto paste
      </label>
    `;
    document.documentElement.appendChild(box);
    box.querySelector('#ih-hide').onclick = () => box.remove();
    return box;
  }

  function setStatus(text, color){
    const el = document.getElementById('ih-status');
    if(el){ el.textContent = text; if(color) el.style.color = color; }
  }

  // Concurrency + state
  let fetchSeq = 0;
  let isFetching = false;
  let lastFillTime = 0;
  let lastWord = '';
  let lastInputWasEmpty = false;

  async function runFetchAndFill({manual=false, reason='manual'}={}){
    if(isFetching){ log('Skip fetch, already in progress'); return; }
    const mySeq = ++fetchSeq;
    isFetching = true;
    const refetchBtn = document.getElementById('ih-refetch');
    if(refetchBtn) refetchBtn.disabled = true;
    let attempt = 0;
    const maxAttempts = 2;
    while(attempt < maxAttempts){
      attempt++;
      try {
        setStatus(`Fetching${attempt>1?' (retry '+attempt+')':''}...`, '#ffc107');
        const childId = getChildId();
        if(!childId){ setStatus('child_id not found', '#f44336'); break; }
        const wordId = await getNextWordId(childId);
        const word = await getWordFromId(wordId);
        if(mySeq !== fetchSeq){ log('Outdated fetch result discarded'); return; }
        lastWord = word;
        setStatus(word, '#8bc34a');
        const auto = document.getElementById('ih-auto');
        if(auto && auto.checked){
          try {
            const input = await waitFor('#answer', 3000).catch(()=>null);
            if(input){
              input.value = word;
              input.dispatchEvent(new Event('input', {bubbles:true}));
              lastFillTime = Date.now();
              lastInputWasEmpty = false;
            }
          } catch(e){ log('Fill error', e); }
        }
        break; // success
      } catch(e){
        log('Fetch attempt error', attempt, e);
        if(attempt >= maxAttempts){
          setStatus('Error (failed)', '#f44336');
        }
      }
    }
    if(refetchBtn) refetchBtn.disabled = false;
    isFetching = false;
  }

  // Init
  const ui = createUI();
  ui.querySelector('#ih-refetch').onclick = () => runFetchAndFill({manual:true, reason:'button'});

  // Auto-run once DOM idle
  runFetchAndFill({reason:'initial'});

  // Observe URL changes (SPA navigation)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(()=>{
    if(location.href !== lastUrl){
      lastUrl = location.href;
      log('URL changed, auto-refetch');
      runFetchAndFill({reason:'url-change'});
    }
  });
  urlObserver.observe(document, {subtree:true, childList:true});

  // Interval watchdog to detect when answer input becomes empty after submission (word likely advanced)
  setInterval(() => {
    const input = document.querySelector('#answer');
    if(!input) return;
    const isEmpty = input.value.trim() === '';
    if(isEmpty && !lastInputWasEmpty){
      // Transition from filled -> empty (site cleared it)
      if(Date.now() - lastFillTime > 600){ // avoid immediate loop right after we set it
        log('Detected answer cleared, refetching');
        runFetchAndFill({reason:'answer-cleared'});
      }
    }
    lastInputWasEmpty = isEmpty;
  }, 1000);

  // Listen for Enter key submission by user to queue next fetch
  document.addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      const input = document.querySelector('#answer');
      if(input && input === document.activeElement){
        // Delay a bit to let site process submission
        setTimeout(()=> runFetchAndFill({reason:'enter-submit'}), 1200);
      }
    }
  }, true);

  // Expose manual refetch for console debugging
  window.__InstalingHelperRefetch = () => runFetchAndFill({manual:true, reason:'console'});
})();
