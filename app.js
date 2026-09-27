const defaultData = {
    tc: `
Blank/Fake Images.,
\nHDD Graph not attached., 
\nLocator Approval not attached.,

\nGap between stick & tape.,
\nDepth not measured/captured.,  
\nLow depth -Protection required., 

\nMeasuring tape is not straight.,
\nMeasurement tape reading not visible., 
\nAW Mentioned Protection type images not capture.,   
\nLow/Protection depth deviation Approval not attach.,  
\nDepth not Capture From NGL, Stick placed on Dump soil.,

\nLoop bracket not used.,  
\nAnchoring Clamp not captured/visible.,
\nOverhead accessories not captured/visible.,

\nPO copy/planning approval required.,
\nCABLE_BLOWING Approval not attached.,  
\nNode/Job ID not mentioned in attached approval., 
\nExisting Bridge utility corridor used approval required as per DOA., 

\nStart/End location Image should be MH/Tower/RM/FDMS.,  
\nStart/End PCC not capture Height*width of PCC+ Clamping., 
\nSafety Noncompliance -Failure to follow safety rules or regulations.,
    `,
    mh: `
Blank/Fake Images.,

\nSand filling not done., 
\nSand filling done over top lid., 
\nSand filling image JC clamp not visible., 

 
\nTop Lid Depth Low.,
\nMH Install at NGL.,  
\nTop Lid PCC not done.,
\nBase CC not done/visible.,

\nWPT Not Done.,
\nSplicing details not filled., 
\nExcess loop mentioned in AW.,
\nAirtel embossing not done/Visible.,
\nCable ID mismatch with Cable ID image.,

\nTop lid damaged., 
\nTop Lid Depth not measured/captured.,
\nTop lid full view with Airtel embossing not captured.,
\nTop lid depth image fake --Not match with other images.,

 
\nmtr loop not found inside the MH.,  
\n5 rings need to capture in conical chamber., 
\nEarthing resistance required with meager test., 


\nMH/Chamber type mismatch -Need to correct in AW.,
\nExisting --Duct entry with simple plug need to capture., 
\nExisting -- Why other old ducts not visible inside MH., 
\nSafety Noncompliance -Failure to follow safety rules or regulations.,
    `,
    fdms: `
Either laminate the labeling paper or replace it with glossy paper.,
\nLabeling mismatch/blank., 
\nm6/locator code mismatch., 
\nOFC/Mount earthing not done., 
\nSite id mismatch with Node/Cygnet id., 
 
\nEdited OTDR --job/cable/Site id details mismatch., 
\nOTDR trace length mismatch., Update optical losses in AW., 
\nNeed to fill & Capture/attach all FDMS attributes as per guidelines ., 
\nEdited OTDR trace attached., Incomplete IBD work captured., Images not captured properly as per specs., 
\nOTDR trace not attached., Fake Docs attached., Incomplete docs -need to fill & Capture/attach all FDMS attributes as per guidelines., 

\nNo variation found -
\nGraph/Trace length same in Multiple fibers., 
\nGraph length mismatch with OTDR trace length., 
\nHigh total event losses found in multiple fibers traces ., Update optical losses in AW.,
\nAttached OTDR traces does not match the installed FDMS ports count - approval need to attach.,

\nShelter entry sealing need to capture.,
\nZMH to GI base PCC depth images need to capture.,
\nmtr IBD SLD need to attach with step-by-step IBD images of ZMH to shelter entry.,

\nClamping not properly done in IBD work., 
\nGI base PCC need to capture in IBD image.,
\n3mtr GI not installed as per construction specification., 
\nFake IBD work -IBD GI base PCC not match with IBD Doc GI base PCC image., 
\nShelter entry done without protection- Necked wired used in shelter entry.,

\nIP-1 - Civil length should be zero.,
\nIP-1 --Optical length mismatch with FTR & OTDR Trace., 
\nIP-1 --FTR copy need to attach with stamp and signature.,

\nFDMS VC against this card is pending. Please submit the card after completion of the Online VC.,    
`
};

let appState = null;
let selectedLines = [];
let clearTimer = null;

function generateId() { return 'id_' + Math.random().toString(36).substr(2, 9); }
function escapeHTML(str) { 
    if(!str || typeof str !== 'string') return '';
    const div = document.createElement('div'); div.textContent = str; return div.innerHTML; 
}
function splitFirstWord(text){ 
    if(!text) return {first:'', rest:''};
    const str = String(text); const idx = str.indexOf(' '); 
    return idx === -1 ? {first:str, rest:''} : {first:str.slice(0,idx), rest:str.slice(idx)}; 
}

function getDefaultState() {
    return {
        version: 3, activeTabId: 'tc',
        settings: { theme: 'light', themeColor: '#1a73e8', fontSize: '11px', fontFamily: "'Segoe UI', sans-serif", height: '45px', width: '100%', padding: '12px' },
        tabs: [
            { id: 'tc', title: 'TC', sentences: parseDefaultToSentences(defaultData.tc) },
            { id: 'mh', title: 'MH', sentences: parseDefaultToSentences(defaultData.mh) },
            { id: 'fdms', title: 'FDMS', sentences: parseDefaultToSentences(defaultData.fdms) }
        ]
    };
}

function parseDefaultToSentences(text) {
    if(!text) return [];
    return text.trim().split('\n').filter(l => l.trim()).map(line => ({ id: generateId(), text: line.trim(), color: '#1a73e8' }));
}

function loadAppState() {
    let loaded = false;
    try {
        const saved = localStorage.getItem('smartNotesAppState');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.version && parsed.tabs && Array.isArray(parsed.tabs)) { appState = parsed; loaded = true; }
        }
        if (!loaded) {
            const scriptData = document.getElementById('app-data');
            if (scriptData && scriptData.textContent.trim()) {
                const parsed = JSON.parse(scriptData.textContent.trim());
                if (parsed && parsed.version && parsed.tabs && Array.isArray(parsed.tabs)) { appState = parsed; loaded = true; }
            }
        }
    } catch(e) { console.warn("Parse Error:", e); }
    
    if (!loaded || !appState || !appState.tabs || appState.tabs.length === 0) appState = getDefaultState();
    if (!appState.settings) appState.settings = getDefaultState().settings;
    if (!appState.tabs.find(t => t.id === appState.activeTabId) && appState.tabs.length > 0) appState.activeTabId = appState.tabs[0].id;
    
    applySettingsToDOM();
}

function saveAppState() {
    try {
        localStorage.setItem('smartNotesAppState', JSON.stringify(appState));
        document.getElementById('app-data').textContent = JSON.stringify(appState);
    } catch(e) { console.error("Save Error:", e); }
}

function applySettingsToDOM() {
    if(!appState || !appState.settings) return;
    const s = appState.settings;
    if(s.theme === 'dark') document.body.classList.add('dark'); else document.body.classList.remove('dark');
    document.documentElement.style.setProperty('--theme-color', s.themeColor || '#1a73e8'); document.getElementById('themeColorPicker').value = s.themeColor || '#1a73e8';
    document.documentElement.style.setProperty('--global-font-size', s.fontSize || '11px'); document.getElementById('fontSize').value = s.fontSize || '11px';
    document.documentElement.style.setProperty('--global-font-family', s.fontFamily || "'Segoe UI', sans-serif"); document.getElementById('fontFamily').value = s.fontFamily || "'Segoe UI', sans-serif";
    document.documentElement.style.setProperty('--global-height', s.height || '45px'); document.getElementById('rangeHeight').value = parseInt(s.height || '45');
    document.documentElement.style.setProperty('--global-width', s.width || '100%'); document.getElementById('rangeWidth').value = parseInt(s.width || '100');
    document.documentElement.style.setProperty('--global-padding', s.padding || '12px'); document.getElementById('rangePadding').value = parseInt(s.padding || '12');
}

function renderAll() { renderMainView(); if(document.body.classList.contains('edit-mode')) renderManagerView(); }

function renderMainView() {
    const tabsNav = document.getElementById('tabsNav');
    const mainContainer = document.getElementById('mainContainer');
    tabsNav.innerHTML = ''; mainContainer.innerHTML = '';
    
    if(!appState || !appState.tabs) return;

    appState.tabs.forEach(tab => {
        const btn = document.createElement('button');
        btn.id = `btn-${tab.id}`;
        btn.textContent = tab.title || 'Tab';
        if (tab.id === appState.activeTabId) btn.classList.add('active');
        btn.addEventListener('click', () => { appState.activeTabId = tab.id; saveAppState(); renderAll(); });
        tabsNav.appendChild(btn);
        
        const col = document.createElement('div');
        col.id = `col-${tab.id}`;
        col.className = `row ${tab.id === appState.activeTabId ? 'active' : ''}`;
        
        if(tab.sentences && Array.isArray(tab.sentences)) {
            tab.sentences.forEach(sent => {
                const wrapper = document.createElement('div');
                wrapper.className = 'line-wrapper';
                const parts = splitFirstWord(sent.text);
                wrapper.innerHTML = `<div class="line-item" data-id="${sent.id}"><span class="drag-handle">☰</span><span class="text-wrapper"><strong style="color:${sent.color || '#1a73e8'}">${escapeHTML(parts.first)}</strong> ${escapeHTML(parts.rest)}</span></div>`;
                
                const item = wrapper.querySelector('.line-item');
                if(selectedLines.find(l => l.id === sent.id)) item.classList.add('selected');
                
                item.addEventListener('click', () => {
                    if(document.body.classList.contains('edit-mode')) return;
                    const existingIdx = selectedLines.findIndex(l => l.id === sent.id);
                    if(existingIdx > -1) { selectedLines.splice(existingIdx, 1); item.classList.remove('selected'); } 
                    else { selectedLines.push(sent); item.classList.add('selected'); }
                    updateClipboard();
                });
                col.appendChild(wrapper);
            });
        }
        mainContainer.appendChild(col);
        
        // Safety Check for Drag-Drop Offline scenario
        if (typeof Sortable !== 'undefined') {
            new Sortable(col, {
                handle: '.drag-handle', animation: 150,
                onEnd: function(evt) {
                    const moved = tab.sentences.splice(evt.oldIndex, 1)[0];
                    tab.sentences.splice(evt.newIndex, 0, moved); saveAppState();
                }
            });
        }
    });
}

function renderManagerView() {
    const mgr = document.getElementById('managerContainer');
    mgr.innerHTML = `<div class="mgr-header"><h2>TAB & SENTENCE MANAGER</h2><button id="mgrAddTabBtn" class="btn-add-tab">+ Add Tab</button></div><div id="mgrTabsList"></div>`;
    
    document.getElementById('mgrAddTabBtn').addEventListener('click', () => {
        const name = prompt("Enter new tab name:");
        if(name && name.trim()) {
            const newTab = { id: generateId(), title: name.trim(), sentences: [] };
            appState.tabs.push(newTab); appState.activeTabId = newTab.id; saveAppState(); renderAll();
        }
    });

    const tabsList = document.getElementById('mgrTabsList');
    if(!appState || !appState.tabs) return;

    appState.tabs.forEach(tab => {
        const tabBox = document.createElement('div');
        tabBox.className = 'mgr-tab-box';
        tabBox.innerHTML = `
            <div class="mgr-tab-header">
                <h3><span class="drag-handle" style="margin:0;">☰</span> Tab: ${escapeHTML(tab.title)}</h3>
                <div class="mgr-tab-actions">
                    <button class="mgr-btn rename-tab-btn">Rename</button>
                    <button class="mgr-btn mgr-btn-danger delete-tab-btn">Delete</button>
                </div>
            </div>
            <div class="mgr-sentences-list"></div>
            <div class="mgr-tab-footer" style="margin-top:10px;">
                <button class="mgr-btn add-sent-btn" style="color:var(--theme-color); border-color:var(--theme-color);">+ Add Sentence</button>
                <div class="add-sent-form-container"></div>
            </div>
        `;
        
        tabBox.querySelector('.rename-tab-btn').addEventListener('click', () => {
            const newName = prompt("Rename Tab:", tab.title);
            if(newName && newName.trim()) { tab.title = newName.trim(); saveAppState(); renderAll(); }
        });
        
        tabBox.querySelector('.delete-tab-btn').addEventListener('click', () => {
            if(appState.tabs.length <= 1) { alert("Cannot delete the last remaining tab!"); return; }
            if(confirm(`Delete tab '${tab.title}' and all its sentences?`)) {
                appState.tabs = appState.tabs.filter(t => t.id !== tab.id);
                if(appState.activeTabId === tab.id) appState.activeTabId = appState.tabs[0].id;
                saveAppState(); renderAll();
            }
        });

        const sList = tabBox.querySelector('.mgr-sentences-list');
        if(tab.sentences && Array.isArray(tab.sentences)){
            tab.sentences.forEach(sent => {
                const sItem = document.createElement('div');
                sItem.className = 'mgr-sentence-item';
                const parts = splitFirstWord(sent.text);
                sItem.innerHTML = `<span class="drag-handle">☰</span><span class="mgr-sent-text" style="color:${sent.color}"><strong>${escapeHTML(parts.first)}</strong> ${escapeHTML(parts.rest)}</span><div class="mgr-sent-actions"><button class="mgr-btn edit-sent-btn">✎ Edit</button><button class="mgr-btn mgr-btn-danger del-sent-btn">🗑</button></div>`;
                
                sItem.querySelector('.del-sent-btn').addEventListener('click', () => {
                    if(confirm("Delete this sentence?")) { tab.sentences = tab.sentences.filter(s => s.id !== sent.id); saveAppState(); renderAll(); }
                });

                sItem.querySelector('.edit-sent-btn').addEventListener('click', () => {
                    sItem.innerHTML = `
                        <div class="inline-form">
                            <input type="text" class="inline-edit-input" value="${escapeHTML(sent.text)}">
                            <input type="color" class="inline-edit-color" value="${sent.color || '#1a73e8'}" title="Sentence Color">
                            <button class="mgr-btn btn-save-inline save-edit-btn">Save</button>
                            <button class="mgr-btn cancel-edit-btn">Cancel</button>
                        </div>`;
                    sItem.querySelector('.save-edit-btn').addEventListener('click', () => {
                        const val = sItem.querySelector('.inline-edit-input').value.trim();
                        if(val) { sent.text = val; sent.color = sItem.querySelector('.inline-edit-color').value; saveAppState(); renderAll(); }
                    });
                    sItem.querySelector('.cancel-edit-btn').addEventListener('click', renderAll);
                });
                sList.appendChild(sItem);
            });
        }

        tabBox.querySelector('.add-sent-btn').addEventListener('click', (e) => {
            e.target.style.display = 'none';
            const container = tabBox.querySelector('.add-sent-form-container');
            container.innerHTML = `
                <div class="inline-form" style="margin-top:10px; padding:10px; background:var(--background); border-radius:8px; border:1px solid var(--theme-color);">
                    <input type="text" class="inline-add-input" placeholder="Enter sentence here...">
                    <input type="color" class="inline-add-color" value="${appState.settings.themeColor}" title="Sentence Color">
                    <button class="mgr-btn btn-save-inline save-add-btn">ADD</button>
                    <button class="mgr-btn cancel-add-btn">Cancel</button>
                </div>`;
            container.querySelector('.save-add-btn').addEventListener('click', () => {
                const val = container.querySelector('.inline-add-input').value.trim();
                if(val) {
                    if(!tab.sentences) tab.sentences = [];
                    tab.sentences.push({ id: generateId(), text: val, color: container.querySelector('.inline-add-color').value });
                    saveAppState(); renderAll();
                }
            });
            container.querySelector('.cancel-add-btn').addEventListener('click', renderAll);
        });

        tabsList.appendChild(tabBox);
        
        if (typeof Sortable !== 'undefined') {
            new Sortable(sList, {
                handle: '.drag-handle', animation: 150,
                onEnd: function(evt) {
                    const moved = tab.sentences.splice(evt.oldIndex, 1)[0];
                    tab.sentences.splice(evt.newIndex, 0, moved); saveAppState(); renderMainView();
                }
            });
        }
    });

    if (typeof Sortable !== 'undefined') {
        new Sortable(tabsList, {
            handle: '.mgr-tab-header .drag-handle', animation: 150,
            onEnd: function(evt) {
                const moved = appState.tabs.splice(evt.oldIndex, 1)[0];
                appState.tabs.splice(evt.newIndex, 0, moved); saveAppState(); renderMainView();
            }
        });
    }
}

async function copyToClipboard(text) {
    if (!text) return;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(text); } 
        else {
            const temp = document.createElement('textarea'); temp.value = text;
            temp.style.position = 'fixed'; temp.style.opacity = '0';
            document.body.appendChild(temp); temp.select(); document.execCommand('copy'); document.body.removeChild(temp);
        }
    } catch (err) { console.warn('Copy failed'); }
}

function updateClipboard(){
    const box = document.getElementById('clipboardBox');
    const textDiv = document.getElementById('clipboardText');
    const container = document.getElementById('mainContainer');
    if(clearTimer) { clearTimeout(clearTimer); clearTimer = null; }
    if(selectedLines.length === 0) { box.classList.remove('show'); container.style.paddingBottom = "100px"; return; }
    if(selectedLines.length === 1) { clearTimer = setTimeout(clearSelections, 5000); }
    
    textDiv.innerHTML = selectedLines.map(lineObj => {
        const parts = splitFirstWord(lineObj.text);
        return `<div><strong style="color:${lineObj.color || '#1a73e8'}">${escapeHTML(parts.first)}</strong> ${escapeHTML(parts.rest)}</div>`;
    }).join('');
    
    box.classList.add('show');
    copyToClipboard(selectedLines.map(l => l.text).join('\n'));
    setTimeout(() => { container.style.paddingBottom = (box.offsetHeight + 20) + "px"; }, 50);
}

function clearSelections() {
    selectedLines = [];
    document.querySelectorAll('.line-item.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('clipboardBox').classList.remove('show');
    document.getElementById('mainContainer').style.paddingBottom = "100px";
}

document.getElementById('editBtn').addEventListener('click', function() {
    const isEdit = document.body.classList.toggle('edit-mode');
    this.innerText = isEdit ? "DONE" : "EDIT";
    if(isEdit) { clearSelections(); renderAll(); }
});

document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    if(appState && appState.settings) { appState.settings.theme = isDark ? 'dark' : 'light'; saveAppState(); }
});
document.getElementById('themeColorPicker').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--theme-color', e.target.value);
    if(appState && appState.settings) { appState.settings.themeColor = e.target.value; saveAppState(); }
});
document.getElementById('fontSize').addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--global-font-size', e.target.value);
    if(appState && appState.settings) { appState.settings.fontSize = e.target.value; saveAppState(); }
});
document.getElementById('fontFamily').addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--global-font-family', e.target.value);
    if(appState && appState.settings) { appState.settings.fontFamily = e.target.value; saveAppState(); }
});
document.getElementById('rangeHeight').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--global-height', e.target.value + 'px');
    if(appState && appState.settings) { appState.settings.height = e.target.value + 'px'; saveAppState(); }
});
document.getElementById('rangeWidth').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--global-width', e.target.value + '%');
    if(appState && appState.settings) { appState.settings.width = e.target.value + '%'; saveAppState(); }
});
document.getElementById('rangePadding').addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--global-padding', e.target.value + 'px');
    if(appState && appState.settings) { appState.settings.padding = e.target.value + 'px'; saveAppState(); }
});

document.getElementById('clearBtn').addEventListener('click', clearSelections);
document.getElementById('copyBtn').addEventListener('click', () => copyToClipboard(selectedLines.map(l => l.text).join('\n')));

document.getElementById('resetBtn').addEventListener('click', () => {
    if(confirm("Reset everything? This will remove all custom tabs, sentences and settings and restore the original defaults.")) {
        localStorage.removeItem('smartNotesAppState');
        appState = getDefaultState();
        saveAppState();
        applySettingsToDOM();
        renderAll();
    }
});

document.getElementById('saveBtn').addEventListener('click', async () => {
    document.body.classList.remove('edit-mode');
    document.getElementById('editBtn').innerText = "EDIT";
    clearSelections();
    
    // Inputs aur Selects ki current value ko HTML attributes mein sync karna
    const syncInputs = ['rangeHeight', 'rangeWidth', 'rangePadding', 'themeColorPicker'];
    syncInputs.forEach(id => { let el = document.getElementById(id); el.setAttribute('value', el.value); });
    const syncSelects = ['fontSize', 'fontFamily'];
    syncSelects.forEach(id => {
        let select = document.getElementById(id);
        Array.from(select.options).forEach(opt => { 
            if (opt.value === select.value) opt.setAttribute('selected', 'selected'); 
            else opt.removeAttribute('selected'); 
        });
    });
    
    saveAppState();
    
    try {
        // Document ka ek copy (clone) create karna taaki live page disturb na ho
        let htmlClone = document.documentElement.cloneNode(true);
        
        // CSS file ko fetch karke inline <style> tag mein convert karna
        let linkNode = htmlClone.querySelector('link[href="styles/styles.css"]');
        if (linkNode) {
            let cssResponse = await fetch('styles/styles.css');
            let cssText = await cssResponse.text();
            let styleNode = document.createElement('style');
            styleNode.textContent = cssText;
            linkNode.replaceWith(styleNode);
        }

        // JS file ko fetch karke inline <script> tag mein convert karna
        let extScriptNode = htmlClone.querySelector('script[src="app.js"]');
        if (extScriptNode) {
            let jsResponse = await fetch('app.js');
            let jsText = await jsResponse.text();
            let scriptNode = document.createElement('script');
            scriptNode.textContent = jsText;
            extScriptNode.replaceWith(scriptNode);
        }

        // Final standalone HTML generate karna
        let finalHTML = "<!DOCTYPE html>\n" + htmlClone.outerHTML;
        
        // Blob banakar download trigger karna
        const blob = new Blob([finalHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SmartNotes_Dynamic.html';
        a.click();
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Save error:", error);
        // Agar fetch fail ho jaye (jaise agar offline chal raha ho), to fallback normal save
        let currentHTML = document.documentElement.outerHTML;
        const blob = new Blob(["<!DOCTYPE html>\n" + currentHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SmartNotes_Dynamic.html';
        a.click();
    }
});

loadAppState();
renderAll();