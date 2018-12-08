/*
I got a basic Custom Connector to work. It needs more work, but this should get you started.

This works with Power BI Desktop (as of now). Excel support may be added by Microsoft in the future.

In your Documents folder, create a folder called "Power BI Desktop\Custom Connectors" (mine already existed).
Download the code below to Okta.pq and save it in the "Custom Connectors" folder.
In Power BI Desktop, go to File | Options and settings | Options
Go the Security tab
Under Data Extensions, select Allow any extension to load without warning or validation
Restart Power BI Desktop

see https://github.com/Microsoft/DataConnectors for more info

One thing I found by researching and experimenting (that I didn't see in the documentation) is you don't have to 
create a .mez file (which is a Zip file). You can even edit the Okta.pq file while it's loaded in Power BI Desktop -- 
this makes development much easier.
*/

section Okta;

[DataSource.Kind = "Okta", Publish = "Okta.Publish"]
shared Okta.Logs = (url as text, token as text, limit as text, since as text) =>
    let
        headers = [
            Authorization = "SSWS " & token, 
            Accept = "application/json", 
            #"Content-Type" = "application/json", 
            #"User-Agent" = "power-bi-desktop/Nov2018 Windows/10.0"
        ],
        query = [limit = limit, since = since],
        content = Web.Contents(url & "/api/v1/logs", [Headers = headers, Query = query]),
        nextUrl = GetNextLink(content),
        content2 = Web.Contents(nextUrl, [Headers = headers]),
        Logs = Json.Document(content) & Json.Document(content2)
    in
        Logs;

// Adapted from https://github.com/Microsoft/DataConnectors/blob/master/samples/Github/github.pq
GetNextLink = (response) =>
    let
        // extract the "Link" header if it exists
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
        Anonymous = []
    ]
];

Okta.Publish = [
    Beta = true
];

// TODO: merge this code with the above.
/*
let
    GeneratedList = List.Generate(
        () => [i = 0, res = GetByDateRange(i)],
        each [i] < iterations,
        each [i = [i] + 1, res = GetByDateRange(i)],
        each [res]),

    table1 = Table.FromList(GeneratedList, Splitter.SplitByNothing(), {"log"}),
    table2 = Table.ExpandListColumn(table1, "log"),
    fieldNames = {"displayMessage", "eventType", "published", "severity"},
    Logs = Table.ExpandRecordColumn(table2, "log", fieldNames)
in
    Logs
*/
