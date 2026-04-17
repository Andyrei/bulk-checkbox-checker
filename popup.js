document.addEventListener("DOMContentLoaded", function () {
    const statusDiv = document.getElementById("status");
    const checkboxCountDiv = document.getElementById("checkboxCount");
    const selectedContainerDiv = document.getElementById("selectedContainer");
    const inspectBtn = document.getElementById("inspectContainer");
    const clearBtn = document.getElementById("clearSelection");

    let currentContainerSelector = null;

    function getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

    function executeScript(func, args = []) {
        return new Promise(async (resolve, reject) => {
            try {
                const tab = await getCurrentTab();
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        function: func,
                        args: args,
                    },
                    (results) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        } else {
                            resolve(results[0]?.result);
                        }
                    },
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    async function updateCheckboxCount() {
        try {
            const count = await executeScript(
                (selector) => {
                    const container = selector
                        ? document.querySelector(selector)
                        : null;
                    const checkboxes = container
                        ? container.querySelectorAll('input[type="checkbox"]')
                        : document.querySelectorAll('input[type="checkbox"]');
                    const visible = Array.from(checkboxes).filter((cb) => {
                        const style = window.getComputedStyle(cb);
                        return (
                            style.display !== "none" &&
                            style.visibility !== "hidden" &&
                            cb.offsetParent !== null
                        );
                    });
                    return {
                        total: checkboxes.length,
                        visible: visible.length,
                        checked: Array.from(checkboxes).filter((c) => c.checked)
                            .length,
                    };
                },
                [currentContainerSelector],
            );
            if (count) {
                checkboxCountDiv.innerHTML = `<span>${count.total}</span> total · <span>${count.visible}</span> visible · <span>${count.checked}</span> checked`;
            }
        } catch (error) {
            checkboxCountDiv.textContent = "Searching for checkboxes...";
        }
    }

    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = "status " + (isError ? "error" : "success");
        setTimeout(() => {
            statusDiv.textContent = "";
            statusDiv.className = "status";
        }, 3000);
    }

    function updateContainerUI(selector) {
        if (selector) {
            selectedContainerDiv.style.display = "flex";
            currentContainerSelector = selector;
        } else {
            selectedContainerDiv.style.display = "none";
            currentContainerSelector = null;
        }
    }

    function setButtonLoading(btn, htmlWhenDone) {
        btn.classList.add("loading");
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span>';
        return {
            done: () => {
                btn.classList.remove("loading");
                btn.innerHTML = htmlWhenDone;
            },
        };
    }

    document
        .getElementById("clickAllCheckboxes")
        .addEventListener("click", async () => {
            const btn = document.getElementById("clickAllCheckboxes");
            const loading = setButtonLoading(
                btn,
                `<span class="icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></span> Check All`,
            );
            try {
                const result = await executeScript(
                    (selector) => {
                        const container = selector
                            ? document.querySelector(selector)
                            : null;
                        const checkboxes = container
                            ? container.querySelectorAll(
                                  'input[type="checkbox"]',
                              )
                            : document.querySelectorAll(
                                  'input[type="checkbox"]',
                              );
                        let count = 0;
                        checkboxes.forEach((cb) => {
                            if (!cb.checked && !cb.disabled) {
                                cb.click();
                                count++;
                            }
                        });
                        return count;
                    },
                    [currentContainerSelector],
                );
                showStatus(`Checked ${result} checkboxes`);
                updateCheckboxCount();
            } catch (error) {
                showStatus("Error", true);
            }
            loading.done();
        });

    document
        .getElementById("uncheckAllCheckboxes")
        .addEventListener("click", async () => {
            const btn = document.getElementById("uncheckAllCheckboxes");
            const loading = setButtonLoading(
                btn,
                `<span class="icon"><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></span> Uncheck All`,
            );
            try {
                const result = await executeScript(
                    (selector) => {
                        const container = selector
                            ? document.querySelector(selector)
                            : null;
                        const checkboxes = container
                            ? container.querySelectorAll(
                                  'input[type="checkbox"]',
                              )
                            : document.querySelectorAll(
                                  'input[type="checkbox"]',
                              );
                        let count = 0;
                        checkboxes.forEach((cb) => {
                            if (cb.checked && !cb.disabled) {
                                cb.click();
                                count++;
                            }
                        });
                        return count;
                    },
                    [currentContainerSelector],
                );
                showStatus(`Unchecked ${result} checkboxes`);
                updateCheckboxCount();
            } catch (error) {
                showStatus("Error", true);
            }
            loading.done();
        });

    document
        .getElementById("toggleAllCheckboxes")
        .addEventListener("click", async () => {
            const btn = document.getElementById("toggleAllCheckboxes");
            const loading = setButtonLoading(
                btn,
                `<span class="icon"><svg viewBox="0 0 24 24"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg></span> Toggle All`,
            );
            try {
                const result = await executeScript(
                    (selector) => {
                        const container = selector
                            ? document.querySelector(selector)
                            : null;
                        const checkboxes = container
                            ? container.querySelectorAll(
                                  'input[type="checkbox"]',
                              )
                            : document.querySelectorAll(
                                  'input[type="checkbox"]',
                              );
                        let count = 0;
                        checkboxes.forEach((cb) => {
                            if (!cb.disabled) {
                                cb.click();
                                count++;
                            }
                        });
                        return count;
                    },
                    [currentContainerSelector],
                );
                showStatus(`Toggled ${result} checkboxes`);
                updateCheckboxCount();
            } catch (error) {
                showStatus("Error", true);
            }
            loading.done();
        });

    document
        .getElementById("clickVisibleCheckboxes")
        .addEventListener("click", async () => {
            const btn = document.getElementById("clickVisibleCheckboxes");
            const loading = setButtonLoading(
                btn,
                `<span class="icon"><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></span> Check Visible`,
            );
            try {
                const result = await executeScript(
                    (selector) => {
                        const container = selector
                            ? document.querySelector(selector)
                            : null;
                        const checkboxes = container
                            ? container.querySelectorAll(
                                  'input[type="checkbox"]',
                              )
                            : document.querySelectorAll(
                                  'input[type="checkbox"]',
                              );
                        let count = 0;
                        checkboxes.forEach((cb) => {
                            const style = window.getComputedStyle(cb);
                            if (
                                style.display !== "none" &&
                                style.visibility !== "hidden" &&
                                cb.offsetParent !== null &&
                                !cb.checked &&
                                !cb.disabled
                            ) {
                                cb.click();
                                count++;
                            }
                        });
                        return count;
                    },
                    [currentContainerSelector],
                );
                showStatus(`Checked ${result} visible checkboxes`);
                updateCheckboxCount();
            } catch (error) {
                showStatus("Error", true);
            }
            loading.done();
        });

    function enterInspectMode() {
        document.body.classList.add("inspecting");
        inspectBtn.classList.add("active");
        showStatus("Click on page to select container");
    }

    function exitInspectMode(selector = null) {
        document.body.classList.remove("inspecting");
        inspectBtn.classList.remove("active");
        inspectBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Inspect Container`;
        getCurrentTab().then((tab) => {
            chrome.action.setBadgeText({ text: "", tabId: tab.id });
        });
        if (selector) {
            updateContainerUI(selector);
            showStatus("Container selected");
            updateCheckboxCount();
        }
        statusDiv.textContent = "";
    }

    inspectBtn.addEventListener("click", async () => {
        enterInspectMode();
        try {
            await chrome.storage.local.set({ startInspect: true });
            const tab = await getCurrentTab();
            chrome.action.setBadgeText({ text: "ON", tabId: tab.id });
            chrome.action.setBadgeBackgroundColor({
                color: "#00ff00",
                tabId: tab.id,
            });
            window.close();
        } catch (e) {
            inspectBtn.innerHTML = `<span class="icon"><svg viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span> Inspect Container`;
            showStatus("Error starting inspect", true);
        }
    });

    document.getElementById("exitInspect").addEventListener("click", async () => {
            await chrome.storage.local.set({ startInspect: false });
            exitInspectMode();
        });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "inspectComplete") {
            exitInspectMode(message.selector);
        }
    });

    clearBtn.addEventListener("click", async () => {
        updateContainerUI(null);
        await chrome.storage.local.set({
            checkboxClickerSelector: null,
            startInspect: false,
        });
        showStatus("Selection cleared");
        updateCheckboxCount();
    });

    document.getElementById("highlightContainer").addEventListener("click", async () => {
            if (currentContainerSelector) {
                await executeScript(
                    (selector) => {
                        const container = document.querySelector(selector);
                        if (!container) return;
                        const rect = container.getBoundingClientRect();
                        const overlay = document.createElement("div");
                        overlay.style.cssText = `
                        position:fixed;
                        pointer-events:none;
                        border:3px solid #00ff00;
                        background:transparent;
                        z-index:2147483647;
                        left:${rect.left}px;
                        top:${rect.top}px;
                        width:${rect.width}px;
                        height:${rect.height}px;`;
                        document.body.appendChild(overlay);
                        setTimeout(() => overlay.remove(), 2000);
                    },
                    [currentContainerSelector],
                );
            }
        });

    async function loadCurrentSelection() {
        try {
            const result = await chrome.storage.local.get("checkboxClickerSelector",);
            if (result.checkboxClickerSelector) {
                updateContainerUI(result.checkboxClickerSelector);
            }
        } catch (e) {}
    }

    updateCheckboxCount();
    loadCurrentSelection();
    setInterval(updateCheckboxCount, 2000);
});
