https://github.com/gabrielsroka/gabrielsroka.github.io/tree/master/OktaAddPerson

1. Create a folder on your PC or Mac called "OktaAddPerson" and download the files
2. Edit the oktaAPIsettings.js with your URL and API token

Extension for Chrome and Firefox. The extension is oktaAddPerson.html with a few supporting .js files and the manifest.json.
* For Chrome, open Extensions tab (chrome://extensions/ or ... > More Tools > Extensions), enable Developer Mode, then drag the folder to the Extensions tab
* For Firefox, go to about:debugging, click "Load Temporary Add-on", load any file from the "OktaAddPerson" folder

oktaAddPerson.html will run in a browser from file://
* For Chrome, start Chrome with `--disable-web-security --user-data-dir`
* For IE, click Allow Blocked Content.
* For Safari, enable Develop menu (Preferences > Advanced > Show Develop Menu), then Develop > Disable Local File Restrictions.

To run on Mac Dashboard
* For Web Clip, open oktaAddPerson.html using Safari; choose File > Open in Dashboard; highlight the area you want to create a widget out of; click Add at the top of the Safari window.
* For Widget, rename folder to "Okta Add Person.wdgt", then double-click to install. Switch to Dashboard (F12), click + then click on "Okta Add Person" icon.


The .HTA files (essentially, a webpage -- HTML + JavaScript + CSS) will run in Windows in an "embedded IE". It's the same source code as the extension: `mshta "%cd%\oktaAddPerson.html"`

See also:
* [Chrome Extensions](https://developer.chrome.com/extensions)
* [Browser Extensions - Mozilla](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)
