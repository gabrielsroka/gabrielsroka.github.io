function Main() {
    cd "C:\Users\Gabriel Sroka\Documents\GitHub\okta\okta.github.io\_source\_docs\api\resources"
    $files = dir *.md
    # Find-Prefixes $files
    Print-Curls $files
}

function Print-Curls($files) {
    cls
    foreach ($file in $files) {
        $lines = Get-Content $file
        Write-Host ""
        Write-Host $file.Name
        $inCurl = $false
        $i = 0
        foreach ($line in $lines) {
            if ($line -match "curl ") {
                $inCurl = $true
                $inData = $false
                $data = ""
            }
            if ($line -match "-d ") {
                $inData = $true
            }
            if ($inCurl) {
                if ($line -match "(~~~|```)") {
                    $inCurl = $false
                    if ($data -match "'({(.|\n)*})'") {
                        $json = $matches[1]
                        try {
                            $o = ConvertFrom-Json $json
                        } catch {
                            Write-Host $i
                            Write-Host $json
                            Write-Host ""
                        }
                    }
                } else {
                    if ($inData) {
                        $data += $line + "`n"
                    } else {
                        $cont = $line -match " \\$"
                        $nextEndCurl = $lines[$i + 1] -match "(~~~|```)"
                        if (($cont -and $nextEndCurl) -or (-not $cont -and -not $nextEndCurl)) {
                             Write-Host ($i + 1) $line
                        }
                    }
                }
            }
            $i++
        }
    }
}


<# All "curl" commands seem to be in blocks like:
/(~~~|```) ?sh/
...
(~~~|```)
#>
function Find-Prefixes($files) {
    cls
    foreach ($file in $files) {
        $lines = Get-Content $file
        $prev = ""
        Write-Host ""
        $file.Name
        foreach ($line in $lines) {
            if ($line -match "curl " -and $prev -notmatch "(~~~|```) ?sh") {
                Write-Host $prev
            }
            $prev = $line
        }
    }
}

function Json-Linter() {
    $json = @'
    {
        "definitions": {
          "base": {
            "id": "#base",
            "type": "object",
            "properties": {
              "firstName": {
              "title": "First name",
              "type": "string",
              "required": false,
              "mutability": "READ_WRITE",
              "scope": "NONE",
              "permissions": [
                {
                  "principal": "SELF",
                  "action": "READ_ONLY"
                }
              ]
            }
          },
          "required": []
        },
          "custom": {
            "id": "#custom",
            "type": "object",
            "properties": {
              "twitterUserName": {
                "title": "Twitter username",
                "description": "User'\''s username for twitter.com",
                "type": "string",
                "required": false,
                "minLength": 1,
                "maxLength": 10,
                "permissions": [
                  {
                    "principal": "SELF",
                    "action": "READ_ONLY"
                  }
                ]
              }
            },
            "required": []
          }
        }
    }
'@

    cls
    try {
        $o = ConvertFrom-Json $json
    } catch {
        $json
    }
}

Main
