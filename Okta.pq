/*
I got a basic Data Connector to work. It needs more work, but this should get you started.

This works with Power BI Desktop (as of now). Excel support may be added by Microsoft in the future.

In your Documents folder, create a folder called "Power BI Desktop\Custom Connectors" (mine already existed).
Download the code below to Okta.pq and save it in the "Custom Connectors" folder.
In Power BI Desktop, go to File | Options and settings | Options
Go the Security tab
Under Data Extensions, select Allow any extension to load without validation or warning
Restart Power BI Desktop

see https://github.com/Microsoft/DataConnectors for more info

One thing I found by researching and experimenting (that I didn't see in the documentation) is you can use the Okta.pq file, 
you don't have to create a .mez file (which is a Zip file). You can even edit the Okta.pq file while it's loaded in 
Power BI Desktop -- this makes development much easier.
*/

section Okta;

[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Logs = (url as text, limit as text, since as text, until as text) =>
    let
        query = [limit = limit, since = since, until = until],
        firstUrl = url & "/api/v1/logs?" & Uri.BuildQueryString(query),
        GeneratedList = List.Generate(
            () => [page = GetPage(firstUrl)],
            each [page][nextUrl] <> null,
            each [page = GetPage([page][nextUrl])],
            each [page][content]),

        Table1 = Table.FromList(GeneratedList, Splitter.SplitByNothing(), {"log"}),
        Logs = Table.ExpandListColumn(Table1, "log")
    in
        Logs;

GetPage = (url as text) =>
    let
        headers = [
            Authorization = "SSWS " & Extension.CurrentCredential()[Key], 
            Accept = "application/json", 
            #"Content-Type" = "application/json", 
            #"User-Agent" = "power-bi-desktop/Nov2018 Windows/10.0"
        ],
        content = Web.Contents(url, [Headers = headers]),
        nextUrl = GetNextLink(content),
        page = [content = Json.Document(content), nextUrl = nextUrl]
    in
        page;

// Adapted from https://github.com/Microsoft/DataConnectors/blob/master/samples/Github/github.pq
GetNextLink = (response) =>
    let
        // The "Link" header is not accessible in Power Query, hence this Data Connector.
        link = Value.Metadata(response)[Headers][Link]?,
        links = Text.Split(link, ","),
        splitLinks = List.Transform(links, each Text.Split(Text.Trim(_), ";")),
        next = List.Select(splitLinks, each Text.Trim(_{1}) = "rel=""next"""),
        first = List.First(next),
        removedBrackets = Text.Range(first{0}, 1, Text.Length(first{0}) - 2)
    in
        try removedBrackets otherwise null;

Okta = [
    TestConnection = (dataSourcePath) => {"Okta.Logs"},
    Authentication = [
        Key = [KeyLabel = "Okta API Token", Label = "Okta API Token"]
    ],
    Label = "Okta"
];

Okta.Publish = [
    Beta = true
];

/*
// BUG: It's not fetching the last page.
shared Okta.Users = (url as text) =>
    let
        firstUrl = url & "/api/v1/users?limit=3",
        GeneratedList = List.Generate(
            () => [page = GetPage(firstUrl)],
            each [page][nextUrl] <> null,
            each [page = GetPage([page][nextUrl])],
            each [page][content]),

        Table1 = Table.FromList(GeneratedList, Splitter.SplitByNothing(), {"user"}),
        Users = Table.ExpandListColumn(Table1, "user")
    in
        Users;
*/
