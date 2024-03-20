var timeoutID = 0;
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id, {group: text}, function (response) { // Send message to rockstar.js.
                suggest(response.groups);
            });
        }, 400);
    });
});

chrome.omnibox.onInputEntered.addListener(function (text, disposition) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (disposition == 'currentTab') {
            chrome.tabs.update(tabs[0].id, {url: text});
        } else {
            chrome.tabs.create({url: text}); // Press Alt+Enter for this.
        }
    });
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostContains: 'okta.com' },
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostContains: 'okta-emea.com' },
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostContains: 'okta-gov.com' },
                    }),
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { hostContains: 'oktapreview.com' },
                    })
                ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});
  
