chrome.contextMenus.create({
    title: 'Search OrgWiki for "%s"', 
    contexts: ["selection"], 
    onclick(info) {
        chrome.tabs.create({  
            url: "https://okta.theorgwiki.com/search/?q=" + info.selectionText
        });
    }
});
