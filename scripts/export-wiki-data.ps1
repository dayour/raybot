<#
.SYNOPSIS
  Exports the Raybot / Coral ground-truth audit into the normalized JSON dataset
  consumed by the Docusaurus wiki and the @raybot/object-model package.

.DESCRIPTION
  Reads the audit artifacts from the raybot audit repository (coral-schema/ plus
  the repo-level manifests) and emits one file per dataset into ./data. Every
  emitted file is UTF-8 without BOM and uses stable key ordering so that
  re-running the export produces reviewable diffs.

.PARAMETER Source
  Root of the raybot audit repo (the folder containing coral-schema/).

.PARAMETER Dest
  Target data directory inside this wiki repo.

.EXAMPLE
  ./scripts/export-wiki-data.ps1 -Source C:\0DEV0\raybot
#>
[CmdletBinding()]
param(
    [string]$Source = 'C:\0DEV0\raybot',
    [string]$Dest
)

$ErrorActionPreference = 'Stop'

if (-not $Dest) {
    $repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $Dest = Join-Path (Split-Path -Parent $repoRoot) 'data'
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)]$Value,
        [int]$Depth = 12
    )
    $json = $Value | ConvertTo-Json -Depth $Depth
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($Path, $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host ("  wrote {0} ({1:N0} bytes)" -f (Split-Path -Leaf $Path), (Get-Item $Path).Length)
}

function Read-Json {
    param([Parameter(Mandatory)][string]$Path)
    Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json
}

$schemaDir = Join-Path $Source 'coral-schema'
if (-not (Test-Path $schemaDir)) { throw "coral-schema not found under $Source" }
if (-not (Test-Path $Dest)) { New-Item -ItemType Directory -Path $Dest -Force | Out-Null }

Write-Host 'Exporting Raybot wiki dataset'
Write-Host "  source: $Source"
Write-Host "  dest:   $Dest"

$elements   = Read-Json (Join-Path $schemaDir 'elements-slim.json')
$validation = Read-Json (Join-Path $schemaDir 'schema-validation.json')
$api        = Read-Json (Join-Path $schemaDir 'api-schema-map.json')
$gallery    = Read-Json (Join-Path $schemaDir 'gallery.json')
$tabLog     = Read-Json (Join-Path $schemaDir 'tab-audit-log.json')

# --- elements: expand the compact audit records into self-describing objects ---
$expanded = foreach ($e in $elements) {
    [pscustomobject][ordered]@{
        surface           = $e.s
        testId            = $e.t
        tag               = $e.tag
        role              = $e.r
        label             = $e.l
        labelSource       = $e.ls
        isInteractive     = [bool]$e.i
        interactiveReason = $e.ir
        isDisabled        = [bool]$e.d
    }
}
Write-JsonFile -Path (Join-Path $Dest 'elements.json') -Value @($expanded)

# --- test id index: one row per unique data-testid across the whole audit ---
$testIdGroups = $expanded |
    Where-Object { $_.testId } |
    Group-Object testId |
    Sort-Object Name

$testIds = foreach ($g in $testIdGroups) {
    $surfaces = @($g.Group | Select-Object -ExpandProperty surface -Unique | Sort-Object)
    $labels = @($g.Group | Where-Object { $_.label } | Select-Object -ExpandProperty label -Unique)
    [ordered]@{
        testId         = $g.Name
        occurrences    = $g.Count
        surfaces       = $surfaces
        surfaceCount   = $surfaces.Count
        isShared       = $surfaces.Count -gt 1
        tags           = @($g.Group | Select-Object -ExpandProperty tag -Unique | Sort-Object)
        roles          = @($g.Group | Where-Object { $_.role } | Select-Object -ExpandProperty role -Unique | Sort-Object)
        anyInteractive = [bool](@($g.Group | Where-Object { $_.isInteractive }).Count -gt 0)
        sampleLabel    = if ($labels.Count -gt 0) { $labels[0] } else { $null }
    }
}
Write-JsonFile -Path (Join-Path $Dest 'testids.json') -Value @($testIds)

# --- surfaces: per-surface audit rollup joined against the element catalog ---
$surfaceDir = Join-Path $schemaDir 'surfaces'
$surfaces = foreach ($row in $validation.perSurface) {
    $onSurface = @($expanded | Where-Object { $_.surface -eq $row.surface })
    [ordered]@{
        surface                   = $row.surface
        dumpFile                  = $row.file
        total                     = $row.total
        interactive               = $row.interactive
        hasTestId                 = $row.hasTestId
        testIdOnlyNonInteractive  = $row.testIdOnlyNonInteractive
        missingLabel              = $row.missingLabel
        disabled                  = $row.disabled
        notVisible                = $row.notVisible
        occludedVisibleNotTopmost = $row.occludedVisibleNotTopmost
        dupTestIdsInSurface       = $row.dupTestIdsInSurface
        uniqueTestIds             = @($onSurface | Where-Object { $_.testId } | Select-Object -ExpandProperty testId -Unique).Count
        isModal                   = $row.surface.StartsWith('dialog.')
        dumpFileExists            = Test-Path (Join-Path $surfaceDir $row.file)
    }
}
Write-JsonFile -Path (Join-Path $Dest 'surfaces.json') -Value @($surfaces)

# --- label gaps and shared testids: verbatim passthrough from the audit ---
Write-JsonFile -Path (Join-Path $Dest 'label-gaps.json') -Value @($validation.interactiveLabelGaps)
Write-JsonFile -Path (Join-Path $Dest 'shared-testids.json') -Value @($validation.sharedTestIdsAcrossSurfaces)

# --- api: flatten domains into a single endpoint table ---
$endpoints = foreach ($domain in $api.domains) {
    foreach ($ep in $domain.endpoints) {
        [ordered]@{
            domain      = $domain.domain
            domainTitle = $domain.title
            method      = $ep.method
            host        = $ep.host
            hostName    = $api.hosts.($ep.host).host
            path        = $ep.path
            count       = $ep.count
            purpose     = $ep.purpose
            semanticId  = $ep.semanticId
            confidence  = $ep.confidence
            status      = $ep.status
            note        = $ep.note
        }
    }
}
Write-JsonFile -Path (Join-Path $Dest 'api-endpoints.json') -Value @($endpoints)

$hosts = foreach ($p in $api.hosts.PSObject.Properties) {
    [ordered]@{
        key          = $p.Name
        host         = $p.Value.host
        role         = $p.Value.role
        requestCount = $p.Value.requestCount
    }
}
Write-JsonFile -Path (Join-Path $Dest 'api-hosts.json') -Value @($hosts)

# --- gallery: capture manifest with on-disk existence verification ---
$galleryOut = foreach ($g in $gallery) {
    [pscustomobject][ordered]@{
        order   = $g.order
        file    = $g.file
        phase   = $g.phase
        caption = $g.caption
        exists  = Test-Path (Join-Path $Source $g.file)
    }
}
Write-JsonFile -Path (Join-Path $Dest 'gallery.json') -Value @($galleryOut)

# --- gallery images: mirror every referenced capture into static/img ---
# The gallery component resolves each entry as img/<file>, preserving the
# source-relative path. Copy only what changed so re-runs stay cheap.
$imgRoot = Join-Path (Split-Path $Dest -Parent) 'static/img'
$copied = 0
$absent = @()
foreach ($g in $galleryOut) {
    $src = Join-Path $Source $g.file
    if (-not (Test-Path -LiteralPath $src)) { $absent += $g.file; continue }
    $dst = Join-Path $imgRoot $g.file
    $dstDir = Split-Path $dst -Parent
    if (-not (Test-Path -LiteralPath $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
    if ((Test-Path -LiteralPath $dst) -and
        (Get-Item -LiteralPath $dst).Length -eq (Get-Item -LiteralPath $src).Length) { continue }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    $copied++
}
Write-Host "gallery images: $($galleryOut.Count) referenced, $copied copied, $($absent.Count) absent at source"
foreach ($a in $absent) { Write-Warning "gallery image absent at source: $a" }

# --- evalset: the six-pair Copilot Studio evaluation CSV ---
$evalRows = Import-Csv -LiteralPath (Join-Path $Source 'raybot-evalset.csv')
$evalOut = foreach ($r in $evalRows) {
    [ordered]@{
        conversationNumber = [int]$r.conversationNumber
        question           = $r.question
        response           = $r.response
        questionLength     = $r.question.Length
        responseLength     = $r.response.Length
    }
}
Write-JsonFile -Path (Join-Path $Dest 'evalset.json') -Value @($evalOut)

# --- rollup totals used by the landing page and the metrics pages ---
$totals = [ordered]@{
    generated               = (Get-Date).ToString('yyyy-MM-dd')
    auditDate               = $validation.'$meta'.generated
    surfaces                = $validation.totals.surfaces
    elements                = $validation.totals.elements
    interactive             = $validation.totals.interactiveElements
    withTestId              = $validation.totals.elementsWithTestId
    uniqueTestIds           = $validation.totals.uniqueTestIds
    interactiveMissingLabel = $validation.totals.interactiveLabelGaps
    sharedTestIds           = $validation.totals.sharedTestIdsAcrossSurfaces
    labelSourceDistribution = $validation.labelSourceDistribution
    interactiveReasonDistribution = $validation.interactiveReasonDistribution
    roleDistribution        = $validation.roleDistribution
    api = [ordered]@{
        allRequests           = $api.'$meta'.totals.allRequests
        functionalApiRequests = $api.'$meta'.totals.functionalApiRequests
        excluded              = $api.'$meta'.totals.excludedTelemetryAuthStatic
        statusDistribution    = $api.'$meta'.totals.statusDistribution
        endpointCount         = @($endpoints).Count
        domainCount           = @($api.domains).Count
    }
    gallery = [ordered]@{
        entries = @($galleryOut).Count
        missing = @($galleryOut | Where-Object { -not $_.exists }).Count
    }
}
Write-JsonFile -Path (Join-Path $Dest 'audit-totals.json') -Value $totals

Write-JsonFile -Path (Join-Path $Dest 'tab-audit-log.json') -Value $tabLog

Write-Host 'Export complete.'
