Extension for Chrome and Firefox. The extension is oktaAddPerson.html with a few supporting .JS files and the manifest.json.

https://github.com/gabrielsroka/gabrielsroka.github.io/tree/master/OktaAddPerson

1. Create a folder on your PC or Mac called "OktaAddPerson" and download the files
2. Edit the oktaAPIsettings.js with your URL and API token
3. For Chrome, open Extensions tab (chrome://extensions/ or ... > More Tools > Extensions), then drag the folder to the Extensions tab
4. For Firefox, go to about:debugging, click "Load Temporary Add-on", load any file from the "OktaAddPerson" folder

oktaAddPerson.html will run in a browser from file://
* For Chrome, start Chrome with `--disable-web-security --user-data-dir`
* For IE, click Allow Blocked Content. 
* For Safari, enable Develop menu (Preferences > Advanced > Show Develop Menu), then Develop > Disable Local File Restrictions.
* For Mac Dashboard (F12), open oktaAddPerson.html using Safari; choose File > Open in Dashboard; highlight the area you want to create a widget out of; click Add at the top of the Safari window.
* For Mac Widget, rename folder to "Okta Add Person.wdgt", then double-click to install. Switch to Dashboard (F12), click + then click on Widget


The .HTA files (essentially, a webpage -- HTML + JavaScript + CSS) will run in Windows in an "embedded IE". It's the same source code as the extension.

See also:

https://developer.chrome.com/extensions

https://developer.mozilla.org/en-US/Add-ons/WebExtensions
