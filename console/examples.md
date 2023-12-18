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
}
```

# Remove Group Members
```js
// Remove group members using https://gabrielsroka.github.io/console

// Get groupId from browser's address bar.
groupId = location.pathname.split('/').pop()
url = '/api/v1/groups/' + groupId + '/users/'
for await (user of getObjects(url)) {
  await remove(url + user.id)
  log('removing group member', user.profile.login)
}
```

# Search Groups
```js
// Search groups with regex using https://gabrielsroka.github.io/console

// Set this:
regex = /germ/i  // You can use JavaScript regular expressions. The 'i' at the end means case-Insensitive.

if (typeof groups == 'undefined') {
  results.innerHTML = 'Loading...'
  groups = []
  for await (g of getObjects('/api/v1/groups')) groups.push(g)
}
found = groups
  .filter(g => g.profile.name.match(regex)) 
  .sort((g1, g2) => g1.profile.name.localeCompare(g2.profile.name))
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

if (typeof users == 'undefined') {
  results.innerHTML = 'Loading...'
  users = []
  for await (u of getObjects(url)) users.push(u)
}
found = users
  .filter(u => u.profile.email.match(regex)) 
  .sort((u1, u2) => u1.profile.firstName.localeCompare(u2.profile.firstName))
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
}

// in parallel, 10-20 times faster than in series:
limit = 15 // try 15, 35, or 75 for the limit, depending on the org.
// see https://developer.okta.com/docs/reference/rl-additional-limits/#concurrent-rate-limits
url = '/api/v1/users?limit=' + limit
for await (user of getObjects(url)) {
  getFactors(user)
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
    log(device.id, user.managementStatus) // add more attrs...
  }
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
  for ([id, name] of Object.entries(rule._embedded.groupIdToGroupNameMap)) {
    log(' ', `'${id}', //`, name)
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
users = []
for await (user of getObjects(url)) {
  users.push(user)
}

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
apps = []
results.innerHTML = 'Loading...'
for await (app of getObjects(url)) {
  apps.push({id: app.id, label: app.label, name: app.name, selfService: app.accessibility.selfService}) // Add more attributes here
  results.innerHTML = apps.length + ' apps'
  if (cancel) break
}
table(apps)
downloadCSV(csv(apps), 'apps')
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
report(url, cols, 'groups')
```

# Miscellaneous

## Apps

```js
// List SAML 2.0 apps using https://gabrielsroka.github.io/console

apps = (await getAll('/api/v1/apps', 'apps')).filter(app => app.signOnMode == 'SAML_2_0')
apps.forEach(a => a.attributes = a.settings.signOn?.attributeStatements?.filter(s => s.type == 'EXPRESSION').map(s => s.values) || [])
tableApps = apps.sort((a1, a2) => a1.label.localeCompare(a2.label)).map(app => ({
  Name: link('/admin/app/' + app.name + '/instance/' + app.id, app.label),
  Attributes: app.attributes.join('<br>')
}))
results.innerHTML += '<br><button id=exportCSV>Export CSV</button>'
table(tableApps)
apps = apps.map(app => ({id: app.id, name: app.name, label: app.label, attributes: app.attributes.join('\n')}))
exportCSV.onclick = () => downloadCSV(csv(apps), 'apps')
```

```js
// Export apps and appUsers using https://gabrielsroka.github.io/console

appUsers = []
for await (app of getObjects('/api/v1/apps?q=salesforce')) {
    count = 0
    log('Fetching', app.label)
    for await (appUser of getObjects(`/api/v1/apps/${app.id}/users?limit=20`, '&expand=user')) {
        addAppUser(appUser)
        count++
        if (cancel) break
    }
    if (count == 0) addUser('(no users)')
    if (cancel) break
}
log('Done')
table(appUsers)
downloadCSV(csv(appUsers), 'apps and users')
function addAppUser(appUser) {
    appUsers.push({  // Add more attributes here
        appId: app.id,
        appLabel: app.label,
        appUserName: appUser._embedded.user.profile.login,
        license: appUser.profile.featureLicenses
    })
}
```

## Groups

```js
// List groups and their apps using https://gabrielsroka.github.io/console

url = '/api/v1/groups?filter=type eq "APP_GROUP"&expand=app'
groups = (await getAll(url, 'groups'))
.map(group => ({
  'Group Name': '<img src=' + group._links.logo.find(l => l.name == 'medium').href + '> ' + link('/admin/group/' + group.id, group.profile.name),
  Description: group.profile.description || 'No description',
  App: link('/admin/app/' + group._embedded.app.name + '/instance/' + group.source.id, group._embedded.app.label)
}))
table(groups)
```
