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
} else {
    Write-Host "Obsidian plugin root found: $ObsidianPluginRoot"
}

Push-Location $repoRoot
Write-Host "Repo root: $repoRoot"

yarn run build:dev

if ($?) {
    Write-Output 'Build successful'

    $filesToLink = @('main.js', 'styles.css', 'manifest.json')

    foreach ($file in $filesToLink ) {
        if ((Get-Item "$ObsidianPluginRoot/$PluginFolderName/$file" ).LinkType -ne 'SymbolicLink') {
            Write-Output "Removing $file from plugin folder and linking"
            Remove-Item "$ObsidianPluginRoot/$PluginFolderName/$file" -Force
            New-Item -ItemType SymbolicLink -Path "$ObsidianPluginRoot/$PluginFolderName/$file" -Target "$repoRoot/$file"
        } else {
            (Get-Item "$ObsidianPluginRoot/$PluginFolderName/$file" ).LinkType
        }
    }

    $hasHotReload = Test-Path "$ObsidianPluginRoot/$PluginFolderName/.hotreload"

    if (!$hasHotReload) {
        Write-Output 'Creating hotreload file'
        '' | Set-Content "$ObsidianPluginRoot/$PluginFolderName/.hotreload"
    }

    yarn run dev

} else {
    Write-Error 'Build failed'
}

Pop-Location
