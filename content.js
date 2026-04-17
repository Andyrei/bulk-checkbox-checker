(function() {
'use strict';

let inspectMode = false;
let selectedContainerSelector = null;
let highlightBox = null;
let pollInterval = null;

function injectCSS() {
    if (document.getElementById('cc-vars')) return;
    const style = document.createElement('style');
    style.id = 'cc-vars';
    style.textContent = `:root { --cc-primary: #00ff00; --cc-primary-dim: rgba(0, 255, 0, 0.15); --cc-primary-dimmer: rgba(0, 0, 0, 0.3); --cc-bg-dark: #000000; --cc-overlay-dark: rgba(0, 0, 0, 0.4); --cc-overlay-darker: rgba(0, 0, 0, 0.5); }`;
    document.head.appendChild(style);
}
injectCSS();

function isExtensionValid() {
    try {
        return chrome.runtime?.id != null;
    } catch (e) {
        return false;
    }
}

function safeStorageGet(keys, callback) {
    try {
        chrome.storage?.local?.get(keys, callback);
    } catch (e) {}
}

function safeStorageSet(items, callback) {
    try {
        chrome.storage?.local?.set(items, callback);
    } catch (e) {}
}

function generateSelector(element) {
    if (element.id) {
        return '#' + CSS.escape(element.id);
    }
    
    let selector = element.tagName.toLowerCase();
    
    if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (classes) {
            selector += '.' + classes.split('.').map(c => CSS.escape(c)).join('.');
        }
    }
    
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
        let parentSelector = parent.tagName.toLowerCase();
        if (parent.id) {
            parentSelector = '#' + CSS.escape(parent.id);
            selector = parentSelector + ' ' + selector;
            break;
        }
        if (parent.className && typeof parent.className === 'string') {
            const classes = parent.className.trim().split(/\s+/).slice(0, 1).join('.');
            if (classes) {
                parentSelector += '.' + classes.split('.').map(c => CSS.escape(c)).join('.');
            }
        }
        selector = parentSelector + ' ' + selector;
        parent = parent.parentElement;
    }
    
    return selector;
}

function createHighlightOverlay() {
    const existing = document.getElementById('cc-highlight-container');
    
    if (existing) {
        highlightBox = existing.querySelector('#cc-highlight-box');
        return;
    }
    
    const container = document.createElement('div');
    container.id = 'cc-highlight-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--cc-primary-dimmer);
        box-shadow: 0 0 0 9999px var(--cc-overlay-dark);
        pointer-events: none;
        z-index: 2147483647;
        display: none;
    `;
    
    highlightBox = document.createElement('div');
    highlightBox.id = 'cc-highlight-box';
    highlightBox.style.cssText = `
        position: absolute;
        border: 3px solid var(--cc-primary);
        background-color: var(--cc-primary-dim);
        border-radius: 2px;
        display: none;
    `;
    
    container.appendChild(highlightBox);
    document.body.appendChild(container);
}

function showHighlightOverlay() {
    const container = document.getElementById('cc-highlight-container');
    if (container) {
        container.style.display = 'block';
    }
}

function hideHighlightOverlay() {
    const container = document.getElementById('cc-highlight-container');
    if (container) {
        container.style.display = 'none';
    }
    if (highlightBox) {
        highlightBox.style.display = 'none';
    }
}

function removeHighlightOverlay() {
    hideHighlightOverlay();
}

function updateHighlight(clientX, clientY) {
    if (!highlightBox) return;
    
    const target = document.elementFromPoint(clientX, clientY);
    if (!target || target.id === 'cc-highlight-container' || target.id === 'cc-highlight-box') {
        highlightBox.style.display = 'none';
        return;
    }
    
    const rect = target.getBoundingClientRect();
    if (rect.width > 5 && rect.height > 5) {
        highlightBox.style.display = 'block';
        highlightBox.style.left = rect.left + 'px';
        highlightBox.style.top = rect.top + 'px';
        highlightBox.style.width = rect.width + 'px';
        highlightBox.style.height = rect.height + 'px';
    } else {
        highlightBox.style.display = 'none';
    }
}

function highlightContainerBriefly(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        border: 3px solid var(--cc-primary);
        background-color: transparent;
        box-shadow: 0 0 0 9999px var(--cc-overlay-dark);
        z-index: 2147483647;
        left: ${rect.left}px;
        top: ${rect.top}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 2000);
}

function startInspectMode() {
    if (inspectMode) return;
    inspectMode = true;
    createHighlightOverlay();
    showHighlightOverlay();
    safeStorageSet({ 
        inspectModeActive: true,
        startInspect: false  // Clear the flag immediately
    });
    showNotification('Click on a container to select. Press Esc to exit.');
    
    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('click', handleClick, false);
    document.addEventListener('keydown', handleKey, false);
}

function handleMove(e) {
    if (inspectMode) updateHighlight(e.clientX, e.clientY);
}

function handleClick(e) {
    if (!inspectMode) return;
    e.stopPropagation();
    
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target) {
        selectedContainerSelector = generateSelector(target);
        stopInspectMode();
        
        safeStorageSet({ 
            checkboxClickerSelector: selectedContainerSelector,
            inspectModeActive: false 
        });
        showNotification('Container selected!');
    }
}

function handleKey(e) {
    if (e.key === 'Escape' && inspectMode) {
        stopInspectMode();
        safeStorageSet({ inspectModeActive: false });
        showNotification('Inspect cancelled');
    }
}

function stopInspectMode() {
    inspectMode = false;
    document.removeEventListener('mousemove', handleMove, { passive: true });
    document.removeEventListener('click', handleClick, false);
    document.removeEventListener('keydown', handleKey, false);
    hideHighlightOverlay();
}

function clearSelection() {
    selectedContainerSelector = null;
    safeStorageSet({ checkboxClickerSelector: null });
}

function showNotification(msg) {
    const existing = document.getElementById('cc-notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.id = 'cc-notification';
    notif.textContent = msg;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        color: var(--cc-primary);
        padding: 12px 20px;
        border-radius: 6px;
        border: 3px solid var(--cc-primary);
        background-color: #000000;
        z-index: 2147483647;
        font-family: -apple-system, sans-serif;
        font-size: 1rem;
        box-shadow: 0 0 0 9999px transparent;
        animation: ccIn 0.2s ease-out;
    `;
    
    if (!document.getElementById('cc-styles')) {
        const style = document.createElement('style');
        style.id = 'cc-styles';
        style.textContent = '@keyframes ccIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3500);
}

function checkCheckboxes(containerSelector, action) {
    const container = containerSelector ? document.querySelector(containerSelector) : null;
    const checkboxes = container 
        ? container.querySelectorAll('input[type="checkbox"]')
        : document.querySelectorAll('input[type="checkbox"]');
    
    let count = 0;
    checkboxes.forEach(cb => {
        if (cb.disabled) return;
        if (action === 'check' && !cb.checked) { cb.click(); count++; }
        else if (action === 'uncheck' && cb.checked) { cb.click(); count++; }
        else if (action === 'toggle') { cb.click(); count++; }
        else if (action === 'checkVisible') {
            const style = window.getComputedStyle(cb);
            if (style.display !== 'none' && style.visibility !== 'hidden' && cb.offsetParent !== null && !cb.checked) {
                cb.click(); count++;
            }
        }
    });
    return count;
}

function getCheckboxCount(containerSelector) {
    const container = containerSelector ? document.querySelector(containerSelector) : null;
    const checkboxes = container 
        ? container.querySelectorAll('input[type="checkbox"]')
        : document.querySelectorAll('input[type="checkbox"]');
    const visible = Array.from(checkboxes).filter(cb => {
        const style = window.getComputedStyle(cb);
        return style.display !== 'none' && style.visibility !== 'hidden' && cb.offsetParent !== null;
    });
    return { total: checkboxes.length, visible: visible.length, checked: checkboxes.length ? Array.from(checkboxes).filter(c => c.checked).length : 0 };
}

chrome.runtime.onMessage?.addListener((req, sender, sendResponse) => {
    try {
        if (req.action === 'startInspect') {
            startInspectMode();
            sendResponse({ success: true });
        } else if (req.action === 'cancelInspect') {
            stopInspectMode();
            safeStorageSet({ inspectModeActive: false });
            sendResponse({ success: true });
        } else if (req.action === 'highlightContainer') {
            highlightContainerBriefly(req.selector);
            sendResponse({ success: true });
        } else if (req.action === 'clearSelection') {
            clearSelection();
            sendResponse({ success: true });
        } else if (req.action === 'runAction') {
            const count = checkCheckboxes(req.selector, req.operation);
            sendResponse({ count: count });
        } else if (req.action === 'getCount') {
            sendResponse(getCheckboxCount(req.selector));
        }
    } catch (e) {
        // Ignore errors
    }
    return false;
});

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); const c = checkCheckboxes(selectedContainerSelector, 'check'); showNotification(c + ' checked'); }
    else if (e.ctrlKey && e.shiftKey && e.key === 'U') { e.preventDefault(); const c = checkCheckboxes(selectedContainerSelector, 'uncheck'); showNotification(c + ' unchecked'); }
    else if (e.ctrlKey && e.shiftKey && e.key === 'T') { e.preventDefault(); const c = checkCheckboxes(selectedContainerSelector, 'toggle'); showNotification(c + ' toggled'); }
});

safeStorageGet(['checkboxClickerSelector'], (result) => {
    try {
        if (result?.checkboxClickerSelector) selectedContainerSelector = result.checkboxClickerSelector;
    } catch (e) {}
    // Don't auto-start inspect mode on page load - only trigger via explicit user action
    // Clear any stale flags from previous sessions
    safeStorageSet({ startInspect: false, inspectModeActive: false });
});

// Clear flags when page unloads (user navigates away or closes tab)
window.addEventListener('beforeunload', () => {
    safeStorageSet({ startInspect: false, inspectModeActive: false });
});

pollInterval = setInterval(() => {
    // Check if we need to START inspect mode
    if (!inspectMode && isExtensionValid()) {
        safeStorageGet('startInspect', (result) => {
            if (!isExtensionValid()) {
                stopPolling();
                return;
            }
            if (result?.startInspect) {
                safeStorageSet({ startInspect: false }, () => {
                    if (isExtensionValid()) startInspectMode();
                });
            }
        });
    }
    
    // Check if we need to STOP inspect mode (extension invalidated)
    if (inspectMode && !isExtensionValid()) {
        stopInspectMode();
        stopPolling();
    }
}, 500);

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

})();