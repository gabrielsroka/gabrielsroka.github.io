// moved to rockstar

(function () {
    console.clear();
    function addTooltip(el) {
        el.parentNode.title = el.value;
        //el.previousSibling.click();
    }

    // Add OU path to tooltip.
    document.querySelectorAll("#ad-import-ou-user-picker input").forEach(addTooltip);
    document.querySelectorAll("#ad-import-ou-group-picker input").forEach(addTooltip);
    
    showOUs("user");
    console.log("\n");
    showOUs("group");

    function showOUs(type) {
        console.log(type + " OUs");
        document.querySelectorAll("#ad-import-ou-" + type + "-picker input:checked.ou-checkbox-tree-item").forEach(el => console.log(el.value));
    }
})();
