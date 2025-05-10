# TODO: add input for relative sample vault path?
# TODO: Make cross-platform compatible. Currently, it is only compatible with Windows.

### FOR OBSIDIAN TASKS PLUGIN ###
# $env:OBSIDIAN_TASKS_PLUGIN_PLUGIN_ROOTS = ".....\obsidian-tasks\resources\sample_vaults\Tasks-Demo" 
# $env:OBSIDIAN_TASKS_PLUGIN_PLUGIN_NAME = "obsidian-tasks-plugin"

### DOCUMENTATION ###

# This script is used to hot-reload one Obsidian plugin repo to one or more vaults.
# Administrator privileges are required to run this script because of symbolic links.
# The script will prompt for Administrator permissions if not already running as Administrator.

# Purpose:
# - This script creates symbolic links for the plugin files (main.js, styles.css, manifest.json) 
#   in the specified plugin folder(s) under the .obsidian/plugins directory.
# - It is intended to be used with the Obsidian plugin hot-reload tool: https://github.com/pjeby/hot-reload.

# Prerequisites:
# - The script must be run from inside a Git repository.
# - Environment variables to be set:
#   - Required: OBSIDIAN_PLUGIN_ROOTS
#     - Paths to the root of the plugin folders located at .obsidian/plugins. Separated by spaces.
#     - Example (Windows): "C:\path\to\vault1\.obsidian\plugins" "C:\path\to\vault2\.obsidian\plugins"
#   - Optional: OBSIDIAN_PLUGIN_NAME
#     - The name of the plugin folder located at .obsidian/plugins/{OBSIDIAN_PLUGIN_NAME}.
#     - Defaults to the `id` field in the repository's manifest.json if not provided.

# Temporary Environment Variable Setup:
# - Windows:
#   $env:OBSIDIAN_PLUGIN_ROOTS = "C:\path\to\vault1\.obsidian\plugins" "C:\path\to\vault2\.obsidian\plugins"
#   $env:OBSIDIAN_PLUGIN_NAME = "your-plugin-name"

# Persistent Environment Variable Setup:
# - Windows:
#   Use your PowerShell profile script ($PROFILE) to persist variables across sessions:
#   notepad $PROFILE
#   Add the following lines:
#   $env:OBSIDIAN_PLUGIN_ROOTS = "C:\path\to\vault1\.obsidian\plugins" "C:\path\to\vault2\.obsidian\plugins"
#   $env:OBSIDIAN_PLUGIN_NAME = "your-plugin-name"

# Steps for Repository Integration:

# 1. Provide example environment variable that includes a path to the repo test vault.
# 2. Add a comment to the top of the script with the example environment variables.
# 3. Assign settings at: ### REPOSITORY SETTINGS
#   - rename environment variable under $relay_OBSIDIAN_PLUGIN_ROOTS
#   - rename environment variable under $relay_OBSIDIAN_PLUGIN_NAME
#   - $buildCommand: The command to run to build the plugin to ensure the files are up to date.
#   - $devCommand: The command to run at the end of the script. 
#   - Add custom test commands.

# Files created at the target path (.obsidian/plugins/{OBSIDIAN_PLUGIN_NAME}):
# - main.js
# - styles.css
# - manifest.json
# - .hotreload

[CmdletBinding()]
param (
    # OBSIDIAN_PLUGIN_ROOTS
    [Parameter(HelpMessage = 'The paths to the plugins folders under the .obsidian directory.')]
    [ValidateScript({
            Write-Host "Validating paths: $obsidianPluginRoots"
            foreach ($path in $obsidianPluginRoots) {
                Write-Host "Validating path: $path"
                Write-Host "obsidianPluginRoots: $obsidianPluginRoots"
                if (-not ($path -match '[\\/]plugins$')) {
                    
                    throw "Invalid path: Each path must end with '/plugins' or '\plugins'. Provided: $path"
                }
                if (-not (Test-Path $path)) {
                    if ($path -match '\s') {
                        throw "Invalid path: The specified path contains spaces, maybe at the end. Provided: $path"
                        return $false
                    }
                    throw "Invalid path: The specified path does not exist. Provided: $path"
                    return $false
                }
            }
            $true
        })]
    [String[]]
    # Split by space
    $obsidianPluginRoots = $OBSIDIAN_PLUGIN_ROOTS -split '\s+',
    
    # OBSIDIAN_PLUGIN_NAME: The folder name of a specific plugin inside the plugins directory.
    # Example: For a plugin located at:
    # /Users/alex/Documents/ObsidianVault/.obsidian/plugins/daily-tasks
    # the OBSIDIAN_PLUGIN_NAME would be:
    # daily-tasks   
    [Parameter(HelpMessage = 'The folder name of the plugin to copy the files to.')]
    [String]
    $pluginFolderName = $(if ($OBSIDIAN_PLUGIN_NAME) { $OBSIDIAN_PLUGIN_NAME } else { "obsidian-tasks-plugin" })
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
    ### REPOSITORY SETTINGS
    # Grab environment variables so they are passed if new window opens
    # ON REPOSITOY INTEGRATION rename $env:OBSIDIAN_PLUGIN_ROOTS to $env:yourpluginname_PLUGIN_ROOTS
    # ON REPOSITOY INTEGRATION rename $env:OBSIDIAN_PLUGIN_NAME to $env:yourpluginname_PLUGIN_NAME
    $relay_OBSIDIAN_PLUGIN_ROOTS = $env:OBSIDIAN_TASKS_PLUGIN_PLUGIN_ROOTS
    $relay_OBSIDIAN_PLUGIN_NAME = $env:OBSIDIAN_TASKS_PLUGIN_PLUGIN_NAME

    # Set the command to run to build the plugin to enrure the files are up to date.
    $buildCommand = "yarn run build:dev"
    $devCommand = "yarn run dev"

    # Check if Yarn is installed
    if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
        Write-ErrorWithNoExit "Yarn is not installed or not in PATH. Please install Yarn before running this script."
    }
    ### END of REPOSITORY SETTINGS

    # Ensure script is running as Administrator
    if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        $scriptPath = $MyInvocation.MyCommand.Path
        Start-Process pwsh -ArgumentList @(
            "-NoExit",
            "-ExecutionPolicy", "Bypass",
            "-File", "`"$scriptPath`"",
            "-obsidianPluginRoots", $relay_OBSIDIAN_PLUGIN_ROOTS,
            "-pluginFolderName", $relay_OBSIDIAN_PLUGIN_NAME
        ) -Verb RunAs
        exit
    }

    # Get Git repo root
    try {
        $repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path
    }
    catch {
        Write-ErrorWithNoExit "Failed to determine Git repo root. Ensure this script is run inside a Git repository."
    }
    
    # Check to see if $pluginFolderName is the same as the id in repo mainfest.json, if not warn
    $repoManifestPath = Join-Path $repoRoot 'manifest.json'
    if (Test-Path $repoManifestPath) {
        $manifest = Get-Content -Path $repoManifestPath | ConvertFrom-Json
        if ($manifest.id -ne $pluginFolderName) {
            Write-Warning "Plugin ID in manifest.json does not match the provided plugin folder name."
            Write-Warning "Manifest ID: $($manifest.id)"
            Write-Warning "Provided Plugin Folder Name: $pluginFolderName"
        } 
        else {
            Write-Host "Plugin ID in manifest.json matches the provided plugin folder name."
        }
    }
    else {
        # If the manifest file is not found, warn the user where?
        Write-ErrorWithNoExit "Manifest file not found at: $repoManifestPath"
    }

    # Check all plugin roots
    foreach ($obsidianPluginRoot in $obsidianPluginRoots) {
        
        if (-not (Test-Path $obsidianPluginRoot)) {
            Write-ErrorWithNoExit "Obsidian plugin root not found at: $obsidianPluginRoot. obsidianPluginRoots: $obsidianPluginRoots"
        }
        else {
            Write-Host "Obsidian plugin root found at: $obsidianPluginRoot"
        }
    }

    Push-Location $repoRoot
    Write-Host "Repo root: $repoRoot"

    # Build the plugin to ensure $filesToLink are up to date
    Invoke-Expression $buildCommand
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorWithNoExit 'Build failed'
        Pop-Location
    }
    Write-Output 'Build successful'

    # Link files
    $filesToLink = @('main.js', 'styles.css', 'manifest.json')

    # Link files to all $obsidianPluginRoot
    foreach ($obsidianPluginRoot in $obsidianPluginRoots) {
        $targetPath = Join-Path $obsidianPluginRoot $pluginFolderName

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
    }

    # Start dev mode
    Invoke-Expression $devCommand
    Pop-Location
}
catch {
    Write-ErrorWithNoExit "Error: $_"
}
