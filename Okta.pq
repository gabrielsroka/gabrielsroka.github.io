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

When calling Okta.Logs, Okta.Users, etc., org should be "EXAMPLE.okta.com" (leave out the "https://" part -- it looks better in the GUI).
The parameters marked as optional should always be provided (they're marked as optional so their signatures match and the credentials can be shared.)
*/

section Okta;

// TODO: is it requesting each page multiple times?
[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Logs = (org as text, optional limit as number, optional since as date, optional until as date) =>
    let
        iso = "s",
        query = [limit = Text.From(limit), since = Date.ToText(since, iso), until = Date.ToText(until, iso)],
        firstUrl = "https://" & org & "/api/v1/logs?" & Uri.BuildQueryString(query),
        Logs = GetPages(firstUrl, "log")
    in
        Logs;

[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Users = (org as text) =>
    let
        firstUrl = "https://" & org & "/api/v1/users",
        Users = GetPages(firstUrl, "user")
    in
        Users;

GetPages = (firstUrl, column) =>
    let
        GeneratedList = List.Generate(
            () => GetPage(firstUrl),
            each List.Count(_) > 0,
            each GetPage(Value.Metadata(_)[nextUrl])),
        Table1 = Table.FromList(GeneratedList, Splitter.SplitByNothing(), {column}),
        Objects = Table.ExpandListColumn(Table1, column)
    in
        Objects;

GetPage = (url as nullable text) =>
    let
        page = if url = null then {} meta [nextUrl = null] else
            let
                headers = [
                    Authorization = "SSWS " & Extension.CurrentCredential()[Key], 
                    Accept = "application/json", 
                    #"Content-Type" = "application/json", 
                    #"User-Agent" = "power-bi-desktop/Nov2018 Windows/10.0"
                ],
                content = Web.Contents(url, [Headers = headers]),
                nextUrl = GetNextLink(content)
            in
                Json.Document(content) meta [nextUrl = nextUrl]
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
    Authentication = [
        Key = [Label = "Okta API", KeyLabel = "Okta API Token"]
    ]
];

Okta.Publish = [];
