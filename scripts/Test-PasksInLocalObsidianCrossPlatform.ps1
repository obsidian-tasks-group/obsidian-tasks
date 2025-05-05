# This script is used to build the Obsidian Tasks plugin and link the files to an Obsidian plugins folder.

# It is intended to be run from inside the repository.
# Environment variables to be set:
# - Required: OBSIDIAN_PLUGIN_ROOT: The full path to the plugins folder located at .obsidian/{OBSIDIAN_PLUGIN_ROOT}.
# - Optional: OBSIDIAN_PLUGIN_NAME: The name of the plugin folder located at .obsidian/plugins/{OBSIDIAN_PLUGIN_NAME}.
#   - If not provided, it defaults to manifest.json id.
# - The script will create symbolic links to the main.js, styles.css, and manifest.json files in the plugin folder.
# - It is intended to be used with Obsidian plugin hot-reload located at: https://github.com/pjeby/hot-reload

# How to temporarily set environment variables:
# In PowerShell, you can set environment variables using the following command:
# $env:OBSIDIAN_PLUGIN_ROOT = "C:\path\to\your\obsidian\plugins"
# $env:OBSIDIAN_PLUGIN_NAME = "your-plugin-name"

# How to persist environment variables:
# You can set environment variables in your PowerShell profile script to persist them across sessions.
# The profile script is located at:
# $PROFILE
# You can open it in Notepad using the following command:
# notepad $PROFILE
# You can add the following lines to your profile script to set the environment variables:
# $env:OBSIDIAN_PLUGIN_ROOT = "C:\path\to\your\obsidian\plugins"
# $env:OBSIDIAN_PLUGIN_NAME = "your-plugin-name"

# Files created at the target OBSIDIAN_PLUGIN_ROOT/OBSIDIAN_PLUGIN_NAME include:
# - main.js
# - styles.css
# - manifest.json
# - .hotreload

# TODO: Add a check to see if the script is running in a Git repository. If not, throw an error and exit.
# TODO: Make cross-platform compatible. Currently, it is only compatible with Windows.
# TODO: Is it testable?
[CmdletBinding()]
param (
    # OBSIDIAN_PLUGIN_ROOT: The full path to the plugins folder.
    # C:/Users/alex/Documents/ObsidianVault/.obsidian/plugins
    [Parameter(HelpMessage = 'The path to the plugins folder under the .obsidian directory.')]
    [ValidateScript({
            if (-not ($_ -match '[\\/]plugins$')) {
                throw "Invalid path: Path must end with '/plugins' or '\plugins'. Provided: $_=end of string"
            }
            if (-not (Test-Path $_)) {
                if ($_ -match '\s') {
                    throw "Invalid path: The specified path contains spaces, maybe at the end. Provided: $_"
                    return $false
                }
                throw "Invalid path: The specified path does not exist. Provided: $_"
                return $false
            }
            $true
        })]
    [String]
    $ObsidianPluginRoot = $env:OBSIDIAN_PLUGIN_ROOT,
    
    # OBSIDIAN_PLUGIN_NAME: The folder name of a specific plugin inside the plugins directory.
    # Example: For a plugin located at:
    # /Users/alex/Documents/ObsidianVault/.obsidian/plugins/daily-tasks
    # the OBSIDIAN_PLUGIN_NAME would be:
    # daily-tasks   
    [Parameter(HelpMessage = 'The folder name of the plugin to copy the files to.')]
    [String]
    $PluginFolderName = $(if ($env:OBSIDIAN_PLUGIN_NAME) { $env:OBSIDIAN_PLUGIN_NAME } else { "obsidian-tasks-plugin" })
)

function Write-ErrorWithNoExit {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$Message,
        [switch]$NoExit
    )
    process {
        Write-Error $Message
        if (!$NoExit) {
            Write-Host "Press any key to exit..." -ForegroundColor DarkYellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
}

try {
    # Ensure script is running as Administrator
    if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        $scriptPath = $MyInvocation.MyCommand.Path
        Start-Process pwsh -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-File", "`"$scriptPath`"",
            "-ObsidianPluginRoot", "`"$env:OBSIDIAN_PLUGIN_ROOT`""
            "-PluginFolderName", "`"$env:OBSIDIAN_PLUGIN_NAME`""
        ) -Verb RunAs
        exit
    }

    # Check if Yarn is installed
    if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
        Write-ErrorWithNoExit "Yarn is not installed or not in PATH. Please install Yarn before running this script."
    }

    # Get Git repo root
    try {
        $repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path
    }
    catch {
        Write-ErrorWithNoExit "Failed to determine Git repo root. Ensure this script is run inside a Git repository."
    }

    # Check to see if $ObsidianPluginRoot is same as id in mainfest.json, if not warn
    $manifestPath = Join-Path $repoRoot 'manifest.json'
    if (Test-Path $manifestPath) {
        $manifest = Get-Content -Path $manifestPath | ConvertFrom-Json
        if ($manifest.id -ne $PluginFolderName) {
            Write-Warning "Plugin ID in manifest.json does not match the provided plugin folder name."
            Write-Warning "Manifest ID: $($manifest.id)"
            Write-Warning "Provided Plugin Folder Name: $PluginFolderName"
        } 
        else {
            Write-Host "Plugin ID in manifest.json matches the provided plugin folder name."
        }
    }
    else {
        Write-ErrorWithNoExit "Manifest file not found at: $manifestPath"
    }

    # Check plugin root
    if (-not (Test-Path $ObsidianPluginRoot)) {
        Write-ErrorWithNoExit "Obsidian plugin root not found at: $ObsidianPluginRoot"
    }
    else {
        Write-Host "Obsidian plugin root found at: $ObsidianPluginRoot"
    }

    Push-Location $repoRoot
    Write-Host "Repo root: $repoRoot"

    # Build the plugin

    
    yarn run build:dev
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorWithNoExit 'Build failed'
        Pop-Location
    }

    Write-Output 'Build successful'

    # Link files
    $filesToLink = @('main.js', 'styles.css', 'manifest.json')
    $targetPath = Join-Path $ObsidianPluginRoot $PluginFolderName

    foreach ($file in $filesToLink) {
        $linkPath = Join-Path $targetPath $file
        $sourcePath = Join-Path $repoRoot $file

        if (Test-Path $linkPath) {
            if ((Get-Item $linkPath).LinkType -ne 'SymbolicLink') {
                Remove-Item $linkPath -Force
                New-Item -ItemType SymbolicLink -Path $linkPath -Target $sourcePath
            }
        }
        else {
            New-Item -ItemType SymbolicLink -Path $linkPath -Target $sourcePath
        }
    }

    # Ensure hotreload
    $hotreloadPath = Join-Path $targetPath ".hotreload"
    if (-not (Test-Path $hotreloadPath)) {
        Write-Output 'Creating hotreload file'
        '' | Set-Content $hotreloadPath
    }

    # Start dev mode
    yarn run dev

    Pop-Location
}
catch {
    Write-ErrorWithNoExit "Error: $_"
}

function Write-ErrorWithNoExit {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$Message,
        [switch]$NoExit
    )
    process {
        Write-Error $Message
        if (!$NoExit) {
            Write-Host "Press any key to exit..." -ForegroundColor DarkYellow
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
    }
}

