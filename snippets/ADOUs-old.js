(function () {
    console.clear();

    // Add OU path to tooltip. Note: both the user and group trees have the same id.
    document.querySelectorAll("#orgunittree input").forEach(el => {
        el.parentNode.title = el.value;
        //el.previousSibling.click();
    });

    showOUs("user");
    console.log("\n");
    showOUs("group");

    function showOUs(type) {
        console.log(type + " OUs");
        document.querySelectorAll("." + type + "outreenode.tree-element-chosen").forEach(el => console.log(el.value));
    }
})();
