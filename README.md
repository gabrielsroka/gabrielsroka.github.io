# Warning

This is an experimental fork of the rockstar Chrome extension for enhancing Okta. 
The original/main repository can be found here (thanks [@gabrielsroka](https://github.com/gabrielsroka)): https://github.com/gabrielsroka/gabrielsroka.github.io

# rockstar is a Chrome extension that adds these features to Okta
- Export Objects to CSV: eg, Users, Groups, Group Members, Directory Users, App Users, App Groups, Apps, App Notes.
- Administrators page: Export Admins
- User home page: Show SSO (SAML assertion, etc)
- People page: enhanced search
- Person page: show login/email and AD info, show user detail, enhance menus/title, manage user's admin roles
- Events: Expand All and Expand Each Row
- API: API Explorer, Pretty Print JSON
- Many: enhanced menus

...and more to come

see also https://gabrielsroka.github.io/rockstar

# Install as extension
1. Create a folder on your hard drive called "rockstar". Download the files to the "rockstar" folder.
2. Open Chrome.
3. Go to the Extensions tab.
4. Click to enable Developer Mode.
5. Drag the "rockstar" folder to the Chrome Extensions tab.

To test:
1. Temporarily turn off the Chrome store version while you test/debug.
2. After each change to your dev version of rockstar, click the reload button on the Extensions tab, then reload the okta.com page, then test, and repeat.
3. When you're done testing, you can turn the Chrome store version back on, and turn off the dev version.

# Greasemonkey script
https://gabrielsroka.github.io/rockstar/rockstar.user.js
