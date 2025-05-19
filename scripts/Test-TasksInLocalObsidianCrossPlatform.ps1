# WINDOWS ONLY CURRENTLY
# TODO: Make cross-platform compatible. Currently, it is only compatible with Windows.

### TLDR FOR OBSIDIAN TASKS PLUGIN ###
# Add persistent environment variable to your PowerShell profile for sample vaults and optionally your personal vault:
# run `notepad $PROFILE`
#   Add ONE string with one path or multiple paths separated by semicolon(s).:
#   When you make a change reload your profile by starting a new terminal or running `& $PROFILE`
#   $env:OBSIDIAN_DOT_PLUGINS_PATHS = "C:\....\{vault}\.obsidian\plugins"
# run this script from inside the Git repository for the plugin.

### DOCUMENTATION ###
# This script is used to hot-reload one Obsidian plugin repo to one or more vaults.
# Administrator privileges are required to run this script because of symbolic links.
# The script will prompt for Administrator permissions if not already running as Administrator.

# Purpose:
# - This script creates symbolic links for the plugin files (main.js, styles.css, manifest.json) 
#   in the specified plugin folder(s) under the .obsidian/plugins directory.
# - It is intended to be used with the Obsidian plugin hot-reload tool: https://github.com/pjeby/hot-reload.

# Requirements:
# - The script must be run from inside a Git repository.
# - OPTIONAL: Provide absolute path(s) to .obsidian/plugins folders. Separated by semi-colons. 

## Temporary Environment Variable Setup:
# - Windows:
#   $env:OBSIDIAN_DOT_PLUGINS_PATHS = "C:\path\to\vault1\.obsidian\plugins;C:\path\to\vault2\.obsidian\plugins"

## Persistent Environment Variable Setup:
# - NOTE: Changes to $PROFILE may need to be ran in a new terminal to take effect.
# - Windows:
#   Use your PowerShell profile script ($PROFILE) to persist variables across sessions:
#   notepad $PROFILE
#   Add the following lines:
#   $env:OBSIDIAN_DOT_PLUGINS_PATHS = "C:\path\to\vault1\.obsidian\plugins;C:\path\to\vault2\.obsidian\plugins"

# Steps for Repository Integration:

# 1. Provide path to obsidian sample vault .obsidian/plugins folder $repoVaultObsidianDotPluginsPath
# 2. Add a comment to the top of the script with the example environment variables.
# 3. Assign settings in the section below named: ### REPOSITORY SETTINGS
#   - set $repoVaultObsidianDotPluginsPath
#   - rename environment variable accepted by $userVaultRootsAbsolute, $env:OBSIDIAN_DOT_PLUGINS_PATHS
#   - assign plugin folder name $obsidianPluginName ="plugin name"
#   - $buildCommand: The command to run to build the plugin to ensure the files are up to date.
#   - $devCommand: The command to run at the end of the script. 
#   - Add custom test commands.

# Files created at the target path (.obsidian/plugins/{obsidianPluginName}):
# - main.js
# - styles.css
# - manifest.json
# - .hotreload

[CmdletBinding()]
param (
    # pobsidianDotPluginsPaths
    [Parameter(HelpMessage = 'The paths to the plugins folders under the .obsidian directory.')]
    [ValidateScript({
            $paths = $_ -split ';'
            # Validate that the paths end with '/plugins' or '\plugins' and that they exist."
            foreach ($path in $paths) {
                if (-not ($path -match '[\\/]plugins$')) {
                    throw "Invalid path: Each path must end with '/plugins' or '\plugins'. Provided: $path"
                }
                if (-not (Test-Path $path)) {
                    if ($path -match '\s') {
                        throw "Invalid path: The specified path contains spaces, maybe at the end. Provided: $path"
                    }
                    throw "Invalid path: The specified path does not exist. Provided: $path"
                }
            }
            return $true
        })
    ]
    [String[]] $pObsidianDotPluginsPaths,

    # pPluginFolderName: The folder name of a specific plugin inside the plugins directory.
    # Example: For a plugin located at:
    # /Users/alex/Documents/ObsidianVault/.obsidian/plugins/daily-tasks
    # the pPluginFolderName would be:
    # daily-tasks   
    [Parameter(HelpMessage = 'The folder name of the plugin to copy the files to.')]
    [String] $pPluginFolderName
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

    # ON REPOSITOY INTEGRATION provide $sample_vault(s) path
    $repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path
    $repoVaultObsidianDotPluginsPath = Join-Path $repoRoot "\resources\sample_vaults\Tasks-Demo\.obsidian\plugins"
    
    # ON REPOSITOY INTEGRATION rename $env:OBSIDIAN_DOT_PLUGINS_PATHS to $env:yourpluginname_PLUGIN_ROOTS_ABSOLUTE
    $userVaultRootsAbsolute = $env:OBSIDIAN_DOT_PLUGINS_PATHS

    # ON REPOSITOY INTEGRATION rename obsidianPluginName to your plugin name. 
    $obsidianPluginName = "obsidian-tasks-plugin" 

    # ON REPOSITOY INTEGRATION Set the command to run and build the plugin to ensure the files are up to date.
    $buildCommand = "yarn run build:dev"

    # ON REPOSITOY INTEGRATION Set the command to start dev environment.
    $devCommand = "yarn run dev"

    # ON REPOSITOY INTEGRATION Provide additional checks.
    # Check if Yarn is installed
    if (-not (Get-Command yarn -ErrorAction SilentlyContinue)) {
        Write-ErrorWithNoExit "Yarn is not installed or not in PATH. Please install Yarn before running this script."
    }

    ### END of REPOSITORY SETTINGS

    # Aggregate .obsidian/plugins paths depending on what is provided
    $relayObsidianDotPluginsPaths = if ([string]::IsNullOrEmpty($repoVaultObsidianDotPluginsPath)) {
        if (![string]::IsNullOrEmpty($userVaultRootsAbsolute)) {
            "$($userVaultRootsAbsolute)"
        }
        else {
            $null
        }
    }
    else {
        if (![string]::IsNullOrEmpty($userVaultRootsAbsolute)) {
            "$($repoVaultObsidianDotPluginsPath);$($userVaultRootsAbsolute)"
        }
        else {
            "$($repoVaultObsidianDotPluginsPath)"
        }
    }

    Write-Host "Commencing with .obsidian/plugins paths: $relayObsidianDotPluginsPaths"
    Write-Host "..plugins/ folder name: $obsidianPluginName"

    # Proper platform detection without assignment
    $isPlatformWindows = $PSVersionTable.PSVersion.Major -ge 6 ? $IsWindows : $true
    $isPlatformLinux = $PSVersionTable.PSVersion.Major -ge 6 -and $IsLinux
    $isPlatformMacOS = $PSVersionTable.PSVersion.Major -ge 6 -and $IsMacOS

    # Now use the platform variables for conditional logic
    if ($isPlatformLinux) {
        # Linux-specific code would go here
        # Similar to macOS but with Linux-specific considerations 

    } 
    elseif ($isPlatformMacOS) {
        # macOS admin check and symlink handling
    
        # Check if running with sudo
        $isAdmin = (id -u) -eq 0
    
        if (-not $isAdmin) {
            Write-Host "Creating symbolic links requires administrative privileges." -ForegroundColor Yellow
            Write-Host "Re-launching with sudo..." -ForegroundColor Yellow
        
            # Prepare arguments for sudo command
            $scriptPath = $MyInvocation.MyCommand.Path
            $arguments = @(
                "-File", 
                "`"$scriptPath`"", 
                "-pObsidianPluginRoots", 
                "`"$relayObsidianPluginRoots`"", 
                "-pPluginFolderName", 
                "`"$obsidianPluginName`""
            )
        
            # Use AppleScript to request password via GUI dialog if in GUI environment
            $useAppleScript = $Host.UI.SupportsGUI
        
            if ($useAppleScript) {
                $appleScript = @"
do shell script "pwsh $scriptPath -pObsidianPluginRoots '$relayObsidianPluginRoots' -pPluginFolderName '$obsidianPluginName'" with administrator privileges
"@
                osascript -e $appleScript
            }
            else {
                # Command line sudo
                sudo pwsh $arguments
            }
            exit
        }
        # macOS specific path handling
        $repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path
    
        # On macOS, use system command for creating symlinks for better compatibility
        function New-MacSymlink {
            param (
                [string]$linkPath,
                [string]$targetPath
            )
        
            # Remove existing link or file if it exists
            if (Test-Path $linkPath) {
                Remove-Item $linkPath -Force
            }
        
            # Create symlink using ln -s
            $linkDir = Split-Path -Parent $linkPath
            if (-not (Test-Path $linkDir)) {
                New-Item -ItemType Directory -Path $linkDir -Force | Out-Null
            }
        
            # Use relative paths if possible for more portable symlinks
            Push-Location (Split-Path -Parent $linkPath)
            $relativeTarget = Resolve-Path -Relative $targetPath
            ln -s $relativeTarget $linkPath
            Pop-Location
        }
       
    }
    elseif ($isPlatformWindows) {
        # Check for admin privlages
        ## Windows
        # Rerun command if no admin privlages.
        if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
            $scriptPath = $MyInvocation.MyCommand.Path
            Start-Process pwsh -ArgumentList @(
                "-NoExit",
                "-ExecutionPolicy", "Bypass",
                "-File", "`"$scriptPath`"",
                "-pObsidianDotPluginsPaths", $relayObsidianDotPluginsPaths,
                "-pPluginFolderName", $obsidianPluginName
            ) -Verb RunAs
            exit
        }
        # Note for future reference: don't assign split to a parameter, it fails silenty.
        # $pObsidianDotPluginsPaths = $pObsidianDotPluginsPaths -split ';' does not work 
        # as expected because powershell parameters are read only.
    }
    else {
        Write-ErrorWithNoExit("Are you running a potato?")
    } 

    # Split the .obsidian/plugins paths
    # TODO is the robustness good?
    $obsidianDotPluginsPathsSplit = $pObsidianDotPluginsPaths -split ';' | Where-Object { $_ -ne '' }

    # Check all .obsidian/plugins paths
    foreach ($obsidianDotPluginsPath in $obsidianDotPluginsPathsSplit) {
        
        if (-not (Test-Path $obsidianDotPluginsPath)) {
            Write-ErrorWithNoExit "A .obsidian/plugins path was not found at: $obsidianDotPluginsPath. `nobsidianDotPluginsPaths: $obsidianDotPluginsPathsSplit"
        }
        else {
            Write-Host "A .obsidian/plugins path was found at: $obsidianDotPluginsPath"
        }
    }

    # Get Git repo root
    try {
        $repoRoot = (Resolve-Path -Path $(git rev-parse --show-toplevel)).Path
    }
    catch {
        Write-ErrorWithNoExit "Failed to determine Git repo root. Ensure this script is run inside a Git repository."
    }
    
    # Check to see if $pPluginFolderName is the same as the id in repo mainfest.json, if not warn
    $repoManifestPath = Join-Path $repoRoot 'manifest.json'
    if (Test-Path $repoManifestPath) {
        $manifest = Get-Content -Path $repoManifestPath | ConvertFrom-Json
        if ($manifest.id -ne $pPluginFolderName) {
            Write-Warning "Plugin ID in manifest.json does not match the provided plugin folder name."
            Write-Warning "Manifest ID: $($manifest.id)"
            Write-Warning "Provided Plugin Folder Name: $pPluginFolderName"
        } 
        else {
            Write-Host "Plugin ID in manifest.json matches the provided plugin folder name."
        }
    }
    else {
        # If the manifest file is not found, warn the user where?
        Write-ErrorWithNoExit "Manifest file not found at: $repoManifestPath"
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

    # Link files to all $obsidianDotPluginsPath
    foreach ($obsidianDotPluginsPath in $obsidianDotPluginsPathsSplit) {
        $targetPath = Join-Path $obsidianDotPluginsPath $pPluginFolderName

        foreach ($file in $filesToLink) {
            $linkPath = Join-Path $targetPath $file
            $sourcePath = Join-Path $repoRoot $file

            if ($isPlatformLinux) {
                # Linux symlink creation (similar to macOS)
                # Linux implementation would go here
            }
            elseif ($isPlatformMacOS) {
                # Use the macOS specific function
                New-MacSymlink -linkPath $linkPath -targetPath $sourcePath
            }
            elseif ($isPlatformWindows) {
                # Windows symlink creation
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
        }

        # Ensure hotreload
        $hotreloadPath = Join-Path $targetPath ".hotreload"
        if (-not (Test-Path $hotreloadPath)) {
            Write-Output 'Creating hotreload file'
            '' | Set-Content $hotreloadPath
        }
    }

    # Start dev mode
    Write-Host "Starting dev mode..."
    Write-Host "Running command: $devCommand"
    Invoke-Expression $devCommand
    Pop-Location
}
catch {
    Write-ErrorWithNoExit "Error: $_"
}
