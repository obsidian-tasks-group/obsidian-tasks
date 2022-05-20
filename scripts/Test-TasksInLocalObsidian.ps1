[CmdletBinding()]
param (
    [Parameter(HelpMessage = 'The path to the plugins folder uner the .obsidian directory.')]
    [String]
    $ObsidianPluginRoot = $env:OBSIDIAN_PLUGIN_ROOT,
    [Parameter(HelpMessage = 'The folder name of the plugin to copy the files to.')]
    [String]
    $PluginFolderName = 'obsidian-tasks-plugin'
)

$repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path

if (-not (Test-Path $ObsidianPluginRoot)) {
    Write-Error "Obsidian plugin root not found: $ObsidianPluginRoot"
    return
}

Push-Location $repoRoot

yarn run build:dev

if ($?) {
    Write-Output 'Build successful'

    Write-Output "Copying to $ObsidianPluginRoot/$PluginFolderName"
    Copy-Item ./main.js $ObsidianPluginRoot/$PluginFolderName/main.js -Force
    Copy-Item ./styles.css $ObsidianPluginRoot/$PluginFolderName/styles.css -Force
    Copy-Item ./manifest.json $ObsidianPluginRoot/$PluginFolderName/manifest.json -Force

} else {
    Write-Error 'Build failed'
}

Pop-Location
