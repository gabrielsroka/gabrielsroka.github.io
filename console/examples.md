# Example scripts for [API Console](https://gabrielsroka.github.io/console)

- [Send activation email to pending users](#send-activation-email)
- [Copy members from one group to another](#copy-group-members)
- [Remove group members](#remove-group-members)
- [Search groups with regex](#search-groups)
- [Search users with regex](#search-users)
- [Eval group rule expression](#eval-group-rule)
- [Create and activate group rule](#create-group-rule)
- [Export users and their factors 3 different ways](#export-users-and-factors)
- [List unmanaged devices and user info](#list-devices)
- [Clone group rule](#clone-group-rule)
- [Add managers to group](#add-managers-to-group)
- [Export apps to CSV](#export-apps-to-csv)
- [Export apps and groups to CSV](#export-apps-and-groups-to-csv)
- [Export groups and counts to CSV](#export-groups-and-counts-to-csv)
- [Miscellaneous](#miscellaneous)

# Send Activation Email
```js
// Send activation email to pending users using https://gabrielsroka.github.io/console

url = '/api/v1/users?filter=status eq "PROVISIONED"'
for await (user of getObjects(url)) {
  log(user.id, user.profile.login, user.profile.email)
  url = '/api/v1/users/' + user.id + '/lifecycle/reactivate?sendEmail=true'
  await post(url)
  if (cancel) break
}
```

# Copy Group Members
```js
// Copy members from one group to another using https://gabrielsroka.github.io/console

// Set these:
srcGroupId = '00g...'
dstGroupId = '00g...'

url = '/api/v1/groups/' + srcGroupId + '/users'
for await (user of getObjects(url)) {
  log('adding member', user.id)
  await put('/api/v1/groups/' + dstGroupId + '/users/' + user.id)
  if (cancel) break
}
```

# Remove Group Members
```js
// Remove group members using https://gabrielsroka.github.io/console

url = '/api/v1/groups/' + id + '/users/'
for await (user of getObjects(url)) {
  log('removing group member', user.profile.login)
  await remove(url + user.id)
  if (cancel) break
}
```

# Search Groups
```js
// Search groups with regex using https://gabrielsroka.github.io/console

// Set this:
regex = /germ/i  // You can use JavaScript regular expressions. The 'i' at the end means case-Insensitive.

url = '/api/v1/groups'
if (typeof groups == 'undefined') groups = await getAll(url)
found = groups
  .filter(g => g.profile.name.match(regex)) 
  .sort(key('profile.name'))
  .map(g => ({
    Name: link('/admin/group/' + g.id, g.profile.name),
    Description: g.profile.description || ''
  }))
results.innerHTML = found.length + ' found'
table(found)
```

# Search Users
```js
// Search users with regex using https://gabrielsroka.github.io/console

// Set these:
regex = /@gsroka.local/i   // You can use JavaScript regular expressions. The 'i' at the end means case-Insensitive.
url = '/api/v1/users?filter=status eq "ACTIVE"'

if (typeof users == 'undefined') users = await getAll(url)
found = users
  .filter(u => u.profile.email.match(regex))
  .sort((u1, u2) => (u1.profile.firstName + u1.profile.lastName).localeCompare(u2.profile.firstName + u2.profile.lastName))
  .map(u => ({
    Name: link('/admin/user/profile/view/' + u.id, u.profile.firstName + ' ' + u.profile.lastName),
    Username: u.profile.login,
    Email: u.profile.email
  }))
results.innerHTML = found.length + ' found'
table(found)
```

# Eval Group Rule
```js
// Eval group rule expression using https://gabrielsroka.github.io/console

// Set these:
value = "user.login != 'gabrielsroka@gmail.com'"
logins = ['me', 'gabrielsroka', 'jane.doe@gsroka.local']

// Cache users
if (typeof users == 'undefined' ||
    (typeof saveLogins != 'undefined' && JSON.stringify(saveLogins) != JSON.stringify(logins))) {
  saveLogins = [...logins]
  users = await Promise.all(logins.map(async login => getJson('/api/v1/users/' + login)))
  for (u of users) {
    if (u.errorSummary) {
      log(u.errorSummary)
      return
    }
  }
}

exps = users.map(user => ({value, targets: {user: user.id}, type: 'urn:okta:expression:1.0', operation: 'CONDITION'}))
es = await postJson('/api/v1/internal/expression/eval', exps)
for (u in users) {
  log(users[u].profile.login, es[u].error?.errorCauses.map(c => c.errorSummary).join('\n') || es[u].result)
}
```

# Create Group Rule
```js
// Create and activate group rule using https://gabrielsroka.github.io/console

// Set these:
name = 'a rule'
value = `user.login == 'aa'`
group = 'aa finance'
// groupIds = ['00gp7pntp8SLlzD1L0h7']

groups = await getJson(`/api/v1/groups?search=profile.name eq "${group}"`)
groupIds = groups.map(g => g.id)
body = {
  name,
  type: 'group_rule',
  conditions: {
    expression: {
      value,
      type: 'urn:okta:expression:1.0'
    }
  },
  actions: {
    assignUserToGroups: {groupIds}
  }
}
rule = await postJson('/api/v1/groups/rules', body)
if (rule.id) {
  await post(`/api/v1/groups/rules/${rule.id}/lifecycle/activate`)
  log('created', name)
} else {
  log(rule.errorSummary + '\n' + rule.errorCauses.map(c => c.errorSummary).join('\n'))
}
```

# Export Users and Factors
```js
// Export users and their factors 3 different ways using https://gabrielsroka.github.io/console

// in series, slow:
for await (user of getObjects('/api/v1/users')) {
  factors = await getJson(`/api/v1/users/${user.id}/factors`)
  waFactors = factors.filter(f => f.factorType == 'webauthn' && f.profile).map(f => f.profile.authenticatorName)
  log(user.id, user.profile.login, waFactors.join('; '))
  if (cancel) break
}

// in parallel, 10-20 times faster than in series:
limit = 15 // try 15, 35, or 75 for the limit, depending on the org.
// see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits
url = '/api/v1/users?limit=' + limit
for await (user of getObjects(url)) {
  getFactors(user)
  if (cancel) break
}

async function getFactors(user) {
  factors = await getJson(`/api/v1/users/${user.id}/factors`)
  waFactors = factors.filter(f => f.factorType == 'webauthn' && f.profile).map(f => f.profile.authenticatorName)
  log(user.id, user.profile.login, waFactors.join('; '))
}

// export to CSV in parallel:
limit = 15 // Try 15, 35, or 75 for the limit, depending on the org.
// see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits

url = '/api/v1/users?limit=' + limit
log('id,login,factors')
promises = []
for await (user of getObjects(url)) {
  promises.push(getFactors(user))
  if (cancel) break
}
await Promise.all(promises) // Wait until all calls are finished before downloading CSV.
downloadCSV(debug.value, 'factors')

async function getFactors(user) {
  factors = await getJson(`/api/v1/users/${user.id}/factors`)
  waFactors = factors.filter(f => f.factorType == 'webauthn' && f.profile).map(f => f.profile.authenticatorName)
  log(toCSV(user.id, user.profile.login, waFactors.join('; ')))
}
```

# List Devices
```js
// List unmanaged devices and user info using https://gabrielsroka.github.io/console

url = '/api/v1/devices?search=managementStatus eq "UNMAN"&expand=user&limit=20'
for await (device of getObjects(url)) {
  for (user of device._embedded.users) {
    log(device.id, user.managementStatus, user.user.id, user.user.profile.login) // add more attrs...
  }
  if (cancel) break
}
```

# Clone Group Rule
```js
// Clone group rule using https://gabrielsroka.github.io/console

// Set these:
groupRuleName = '...' // not case-sensitive
showGroupIdsAndQuit = true // true or false - set to true the first time, then false
groupIds = [
  '...',
  '...'
]
deleteOldRule = false // true or false - false will rename old rule
activateNewRule = true // true or false

log('Searching rule(s)...')
baseUrl = '/api/v1/groups/rules/'
url = baseUrl + '?expand=groupIdToGroupNameMap&search=' + groupRuleName
count = 0
for await (rule of getObjects(url)) {
  log(rule.id, rule.name, '-', rule.conditions.expression.value)
  log('groupIds = [')
  for ([groupId, name] of Object.entries(rule._embedded.groupIdToGroupNameMap)) {
    log(' ', `'${groupId}', //`, name)
  }
  log(']')
  count++
}

if (count != 1) {
  log('Error: found', count, 'rules')
  return
}

if (showGroupIdsAndQuit) {
  log('Copy the groupIds to the code, update it, set showGroupIdsAndQuit = false, then Run again.')
  log('Done.')
  return
}

// Deactivate and rename/delete old rule.
url = baseUrl + rule.id
await post(url + '/lifecycle/deactivate')
if (deleteOldRule) {
  await remove(url)
  log('Deleted old rule.')
} else {
  ruleName = rule.name
  rule.name += ' - old'
  r = await put(url, rule)
  if (!r.ok) {
     e = await r.json()
     log('Error.', e.errorCauses.map(e => e.errorSummary))
     return
  }
  log('Renamed old rule to:', rule.name)
  rule.name = ruleName
}

// Create new rule and activate it.
rule.actions.assignUserToGroups.groupIds = groupIds
newRule = await postJson(baseUrl, rule)
if (activateNewRule) await post(baseUrl + newRule.id + '/lifecycle/activate')
log()
log('New rule:')
log(newRule.id, newRule.name)
```

# Add Managers to Group
```js
// Add managers to a group using https://gabrielsroka.github.io/console

// Set this:
groupId = '...'

url = '/api/v1/users' // maybe this should use: ?filter=status eq "ACTIVE"
users = await getAll(url)

added = []
for (user of users) {
  if (user.profile.manager && !added.find(m => m == user.profile.manager)) {
    mgr = users.find(m => m.profile.login == user.profile.manager)
    if (mgr) {
      await put('/api/v1/groups/' + groupId + '/users/' + mgr.id)
      added.push(user.profile.manager)
      log('Added to group:', user.profile.manager)
    } else {
      log('Mgr not found:', user.profile.manager, ', on:', user.profile.login)
    }
  }
}
log('Done.')
```

# Export Apps to CSV
```js
// Export apps to CSV using https://gabrielsroka.github.io/console

url = '/api/v1/apps'
cols = 'id,label,name,accessibility.selfService' // Add more attributes here
await report(url, cols)
```

# Export Apps and Groups to CSV
```js
// Export apps and groups using https://gabrielsroka.github.io/console

appGroups = []
for await (app of getObjects('/api/v1/apps')) {
    count = 0
    log('Fetching', app.label)
    for await (appGroup of getObjects(`/api/v1/apps/${app.id}/groups?limit=20`, '&expand=group')) {
        addGroup(appGroup._embedded.group.profile.name)
        count++
        if (cancel) break
    }
    if (count == 0) addGroup('(no groups)')
    if (cancel) break
}
log('Done')
table(appGroups)
downloadCSV(csv(appGroups), 'apps and groups')
function addGroup(appGroupName) {
    appGroups.push({  // Add more attributes here
        appId: app.id,
        appLabel: app.label,
        appGroupName
    })
}
```

# Export Groups and Counts to CSV
```js
// Export groups and counts to CSV using https://gabrielsroka.github.io/console

// Set this:
limit = 1000 // The default is 10000, but that's sometimes too large and causes errors.

url = '/api/v1/groups?expand=stats&limit=' + limit
cols = 'id,profile.name,_embedded.stats.usersCount,_embedded.stats.appsCount,_embedded.stats.groupPushMappingsCount'
report(url, cols)
```

# Miscellaneous

## Apps

```js
// List SAML 2.0 apps using https://gabrielsroka.github.io/console

allApps = await getAll('/api/v1/apps')
apps = allApps.filter(app => app.signOnMode == 'SAML_2_0').sort(key('label'))
apps.forEach(a => a.attributes = a.settings.signOn?.attributeStatements?.filter(s => s.type == 'EXPRESSION').map(s => s.name + ' = ' + s.values) || [])
results.innerHTML = apps.length + ' apps found<br><button id=exportCSV>Export CSV</button>'
tableApps = apps.map(app => ({
  App: link('/admin/app/' + app.name + '/instance/' + app.id, app.label),
  Attributes: app.attributes.join('<br>')
}))
table(tableApps)
csvApps = csv(apps.map(app => ({id: app.id, name: app.name, label: app.label, attributes: app.attributes.join('\n')})))
exportCSV.onclick = () => downloadCSV(csvApps, 'apps')
```

```js
// Export apps and appUsers using https://gabrielsroka.github.io/console

appUsers = []
for await (app of getObjects('/api/v1/apps')) {
    count = 0
    log('Fetching', app.label)
    for await (appUser of getObjects(`/api/v1/apps/${app.id}/users?limit=20`, '&expand=user')) {
        addAppUser(appUser._embedded.user.profile.login, appUser.profile.featureLicenses, appUser.scope)
        count++
        if (cancel) break
    }
    if (count == 0) addAppUser('(no users)')
    if (cancel) break
}
log('Done')
table(appUsers)
downloadCSV(csv(appUsers), 'apps and users')
function addAppUser(appUserName, licenses, scope) {
    appUsers.push({  // Add more attributes here
        appId: app.id,
        appLabel: app.label,
        appUserName,
        licenses,
        scope
    })
}
```

```js
// Switch apps to a different policy using https://gabrielsroka.github.io/console

policies = await getAll('/api/v1/policies?type=ACCESS_POLICY')
policyOpts = policies.sort(key('name')).map(policy => `<option id=${policy.id}>${policy.name}</option>`).join('')
apps = await getAll('/api/v1/apps')
appChks = apps.sort(key('label')).map(app => `<label><input id=${app.id} title='${app.label}' type=checkbox checked>${app.label}</label><br>`).join('')
results.innerHTML = 
  'Policy <select id=toPolicy>' + policyOpts + '</select><br>' + 
  'Apps<br>' + appChks + 
  '<br><button id=switchPolicies class="button button-primary">Switch</button> ' + 
  '<button id=checkAll class=button>Check All</button> <button id=uncheckAll class=button>Uncheck All</button>'

switchPolicies.onclick = async () => {
  policy = toPolicy.selectedOptions[0]
  checkedApps = results.querySelectorAll('input[type=checkbox]:checked')
  for (app of checkedApps) { // one at a time -- don't use forEach
    r = await put(`/api/v1/apps/${app.id}/policies/${policy.id}`)
    b = await r.json()
    if (r.ok) log('Switched', app.id, app.title)
    else log('Error:', b.errorCauses.map(e => e.errorSummary))
    if (cancel) break
  }
  log('Done')
}
checkAll.onclick = () => results.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = true)
uncheckAll.onclick = () => results.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false)
```

## Groups

```js
// List groups and their apps using https://gabrielsroka.github.io/console

url = '/api/v1/groups?filter=type eq "APP_GROUP"&expand=app'
groups = (await getAll(url))
.map(group => ({
  'Group Name': '<img src=' + group._links.logo.find(l => l.name == 'medium').href + '> ' + link('/admin/group/' + group.id, group.profile.name),
  Description: group.profile.description || 'No description',
  App: link('/admin/app/' + group._embedded.app.name + '/instance/' + group.source.id, group._embedded.app.label)
}))
table(groups)
```

## Group Rules

```js
// Add and activate a Group Rule using https://gabrielsroka.github.io/console

results.innerHTML = '<style>.rockstarTable td {padding: 8px;} .group {border: solid 1px gray; padding: 10px; margin: 4px; text-wrap: nowrap;} .removeGroup {margin: 8px 0;}</style>' +
  '<table class=rockstarTable style="width: 100%">' +
  '<tr><td colspan=2><h2>Add Rule</h2>' +
  '<tr><td>Name<td><input id=ruleName>' +
  `<tr><td>Expression<td style='width: 100%' colspan=2><textarea id=expression style='width: 100%; height: 100px; font-family: monospace;'></textarea>` +
    'Press Ctrl+Enter to Preview - ' + link('https://developer.okta.com/reference/okta_expression_language', 'Expression Language Reference') +
  '<tr><td>Assign to<td><input id=groupName placeholder=Group><td style="width: 100%"><span id=groupInfo></span>' +
  '<tr><td>Preview<td colspan=2><input id=userName placeholder=User> <span id=userInfo></span>' +
  '<tr><td colspan=3><div id=infobox>&nbsp;</div>' +
  '<tr><td colspan=2><button id=save class="button button-primary">Save and Activate</button>' +
  '</table>'
ruleName.focus()

ENTER = 13
user = {}
groups = []
expression.onkeydown = event => {
  if (event.ctrlKey && event.keyCode == ENTER) evalExpression()
}
async function evalExpression() {
  err = '<span style="color: white; background-color: red">&nbsp;! </span>&nbsp;'
  if (!user?.id) {
    infobox.innerHTML = err + 'Select a user to preview'
    return
  }
  infobox.innerHTML = '&nbsp;'
  body = [{targets: {user: user.id}, value: expression.value, type: 'urn:okta:expression:1.0', operation: 'CONDITION'}]
  exp = (await postJson('/api/v1/internal/expression/eval', body))[0]
  if (exp.error) {
    h = err + 'We found some errors.<br>' + exp.error.errorCauses.map(c => c.errorSummary).join('<br>')
    if (expression.value.match(/[‘’“”]/)) h += '<br>Change smart (curly) quotes to straight quotes.'
  } else if (exp.result == 'TRUE') h = '<span style="color: white; background-color: green">&nbsp;✓ </span>&nbsp; User matches rule'
  else h = err + "User doesn't match rule"
  infobox.innerHTML = h
}
userName.onkeyup = async event => {
  infobox.innerHTML = '&nbsp;'
  if (event.keyCode == ENTER) {
    evalExpression()
    return
  }
  if (await debounce(userName)) return
  users = await getJson('/api/v1/users?' + new URLSearchParams({limit: 1, q: userName.value}))
  user = users[0]
  if (!user) {
    userInfo.innerHTML = 'No results found'
    return
  }
  userInfo.innerHTML = link('/admin/user/profile/view/' + user.id, user.profile.firstName + ' ' + user.profile.lastName) + ', login: ' + user.profile.login + ', email: ' + user.profile.email
}
groupName.onkeyup = async () => {
  if (await debounce(groupName)) return
  foundGroups = await getJson('/api/v1/groups?' + new URLSearchParams({limit: 1, filter: 'type eq "OKTA_GROUP"', q: groupName.value}))
  group = foundGroups[0]
  if (group) {
    if (!groups.find(g => g.id == group.id)) groups.push(group)
    msg = ''
  } else msg = 'No results found. '
  groupInfo.innerHTML = msg + groups.map(g => '<span class=group>' + link('/admin/group/' + g.id, g.profile.name) + ` &nbsp;<button id=${g.id}>x</button></span>`).join(' ')
  groupInfo.querySelectorAll('button').forEach(button => button.onclick = () => {
    groups = groups.filter(g => g.id != button.id)
    button.parentNode.remove()
  })
}
save.onclick = async () => {
  body = {name: ruleName.value, conditions: {expression: {value: expression.value, type: 'urn:okta:expression:1.0'}}, actions: {assignUserToGroups: {groupIds: groups.map(g => g.id)}}, type: 'group_rule'}
  rule = await postJson('/api/v1/groups/rules', body)
  if (rule.id) {
    await post(`/api/v1/groups/rules/${rule.id}/lifecycle/activate`)
    infobox.innerHTML = 'Added ' + ruleName.value
  } else {
    infobox.innerHTML = 'Error: ' + rule.errorSummary + '<br>' + rule.errorCauses.map(c => c.errorSummary).join('<br>')
  }
}
```
