See https://gabrielsroka.github.io/console

```js
// Search groups with regex using https://gabrielsroka.github.io/console

// Set this:
regex = /germ/i  // 'i' is case-Insensitive

if (typeof groups == 'undefined') {
  results.innerHTML = 'Loading...'
  groups = []
  for await (g of getObjects('/api/v1/groups')) groups.push(g)
}
rows = groups
  .filter(g => g.profile.name.match(regex)) 
  .sort((g1, g2) => g1.profile.name.localeCompare(g2.profile.name))
  .map(g => '<tr><td>' + link('/admin/group/' + g.id, g.profile.name) + '<td>' + g.profile.description)
  .join('')
results.innerHTML = rows.length ?  '<table><tr><th>Name<th>Description' + rows + '</table>': 'not found'
```

```js
// Search users with regex using https://gabrielsroka.github.io/console

// Set these:
regex = /@gsroka.local/i   // 'i' is case-Insensitive
url = '/api/v1/users?filter=status eq "ACTIVE"'

if (typeof users == 'undefined') {
  results.innerHTML = 'Loading...'
  users = []
  for await (u of getObjects(url)) users.push(u)
}
rows = users
  .filter(u => u.profile.email.match(regex)) 
  .sort((u1, u2) => u1.profile.firstName.localeCompare(u2.profile.firstName))
  .map(u => '<tr><td>' + link('/admin/user/profile/view/' + u.id, u.profile.firstName + ' ' + u.profile.lastName) + 
    '<td>' + u.profile.login + '<td>' + u.profile.email)
  .join('')
results.innerHTML = rows.length ? '<table><tr><th>Name<th>Username<th>Email' + rows + '</table>' : 'not found'
```

```js
// Eval group rule expression using https://gabrielsroka.github.io/console

// Set these:
value = "user.login != 'gabrielsroka@gmail.com'"
logins = ['me', 'gabrielsroka', 'jane.doe@gsroka.local']

// Cache users
if (typeof users == 'undefined' || (typeof saveLogins != 'undefined' && JSON.stringify(saveLogins) != JSON.stringify(logins))) {
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
  post(`/api/v1/groups/rules/${rule.id}/lifecycle/activate`)
  log('created ' + name)
} else {
  log(rule.errorSummary + '\n' + rule.errorCauses.map(c => c.errorSummary).join('\n'))
}
```
