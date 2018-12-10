/*
I got a basic Data Connector to work. It needs more work, but this should get you started.

This works with Power BI Desktop (as of now). Excel support may be added by Microsoft in the future.

1. In your Documents folder, create a folder called "Power BI Desktop\Custom Connectors" (mine already existed).
2. Download the code below to Okta.pq and save it in the "Custom Connectors" folder.
3. In Power BI Desktop, go to File | Options and settings | Options.
4. Go the Security tab.
5. Under Data Extensions, select Allow any extension to load without validation or warning.
6. Restart Power BI Desktop.

See https://github.com/Microsoft/DataConnectors for more info.

One thing I found by researching and experimenting (that I didn't see in the documentation) is you can use the Okta.pq file, 
you don't have to create a .mez file (which is a Zip file). You can even edit the Okta.pq file while it's loaded in 
Power BI Desktop -- this makes development much easier.

When calling Okta.Logs, Okta.Users, etc., org should be "EXAMPLE.okta.com" (leave out the "https://" part--it looks better in the GUI).
The parameters marked as optional should always be provided (they're marked as optional so their signatures match each other
and the credentials can be shared.)
*/

section Okta;

orgHelp = "org (e.g., ""example.okta.com"", omit ""https://"")";

[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Logs = Value.ReplaceType(Okta.LogsImpl, Okta.LogsType);

[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Users = Value.ReplaceType(Okta.UsersImpl, Okta.UsersType);

Okta.LogsType = type function (
    org as (type text meta [Documentation.FieldCaption = orgHelp]),
    optional limit as (type number meta [Documentation.FieldCaption = "limit (1-1000), this is not optional"]),
    optional since as (type date meta [Documentation.FieldCaption = "since, this is not optional"]),
    optional until as (type date meta [Documentation.FieldCaption = "until, this is not optional"])
) as table;

Okta.UsersType = type function (
    org as (type text meta [Documentation.FieldCaption = orgHelp])
) as table;

Okta.LogsImpl = (org as text, optional limit as number, optional since as date, optional until as date) as table =>
    let
        iso = "s",
        query = [limit = Text.From(limit), since = Date.ToText(since, iso), until = Date.ToText(until, iso)],
        firstUrl = "https://" & org & "/api/v1/logs?" & Uri.BuildQueryString(query),
        Logs = GetPages(firstUrl, "log")
    in
        Logs;

Okta.UsersImpl = (org as text) as table =>
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
        Pages = Table.ExpandListColumn(Table1, column)
    in
        Pages;

GetPage = (url as nullable text) =>
    let
        Page = if url = null then {} meta [nextUrl = null] else
            let
                headers = [
                    Authorization = "SSWS " & Extension.CurrentCredential()[Key], 
                    Accept = "application/json", 
                    #"Content-Type" = "application/json", 
                    #"User-Agent" = "power-bi-desktop/Nov2018 Windows/10.0"
                ],
                content = Web.Contents(url, [Headers = headers]),
                nextUrl = GetNextLink(content),
                objects = Json.Document(content)
            in
                objects meta [nextUrl = nextUrl]
    in
        Page;

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
