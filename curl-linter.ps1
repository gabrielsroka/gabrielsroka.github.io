function Main() {
    cls
    cd "C:\Users\Gabriel Sroka\Documents\GitHub\okta\okta.github.io\_source\_docs\api\resources"
    $files = dir *.md
    Test-Curls $files
    # Find-Prefixes $files
}

function Test-Curls($files) {
    $endBlock = "(~~~|```)"
    foreach ($file in $files) {
        $lines = Get-Content $file
        Write-Host $file.Name
        $inCurl = $false
        $i = 0
        foreach ($line in $lines) {
            if ($line -match "curl ") {
                $inCurl = $true
                $inData = $false
                $data = ""
            }
            if ($inCurl) {
                if ($line -match $endBlock) {
                    $inCurl = $false
                    if ($data -match "'({(.|\n)*})'") {
                        $json = $matches[1]
                        try {
                            $null = ConvertFrom-Json $json
                        } catch {
                            Write-Host ($i + 1) "Invalid JSON"
                            Write-Host $json
                            Write-Host ""
                        }
                    }
                } else {
                    if ($line -match "-d ") {
                        $inData = $true
                    }
                    if ($inData) {
                        $data += $line + "`n"
                    } else {
                        $cont = $line -match " \\$"
                        $nextEndCurl = $lines[$i + 1] -match $endBlock
                        if ($cont -and $nextEndCurl) {
                             Write-Host ($i + 1) "Extra ' \'"
                             Write-Host $line
                        }
                        if (-not $cont -and -not $nextEndCurl) {
                             Write-Host ($i + 1) "Missing or invalid ' \'"
                             Write-Host $line
                        }
                    }
                }
            }
            $i++
        }
        Write-Host ""
    }
}


<# All "curl" commands seem to be in blocks like:
(~~~|```) ?sh
curl ...
(~~~|```)
#>
function Find-Prefixes($files) {
    $startBlock = "(~~~|```) ?sh"
    foreach ($file in $files) {
        $lines = Get-Content $file
        Write-Host $file.Name
        $prev = ""
        foreach ($line in $lines) {
            if ($line -match "curl " -and $prev -notmatch $startBlock) {
                Write-Host $prev
            }
            $prev = $line
        }
        Write-Host ""
    }
}

function Test-Json() {
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

    try {
        $null = ConvertFrom-Json $json
    } catch {
        $json
    }
}


# This must be the last line in the file. All functions need to be defined before running Main.
Main
