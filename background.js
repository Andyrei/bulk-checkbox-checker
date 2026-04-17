chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.storage?.local.set({ inspectModeActive: false, startInspect: false });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        chrome.storage?.local.set({ inspectModeActive: false, startInspect: false });
    }
});