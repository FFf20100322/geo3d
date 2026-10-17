# Build the Android APK for Geo3D, install everything it needs.
# Kept ASCII-only on purpose: this file is run by PowerShell, and non-ASCII
# in a .ps1 has burned this project before (encoding assumptions differ).

$ErrorActionPreference = 'Continue'
$sdk = 'F:\android-sdk'
$proj = 'F:\deep seek-harness\geo3d'

Write-Output '=== 1. Android command-line tools ==='
$sdkm = "$sdk\cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkm)) {
    New-Item -ItemType Directory -Force -Path $sdk | Out-Null
    $zip = "$env:TEMP\cmdline-tools.zip"
    Write-Output "downloading command-line tools ..."
    & curl.exe -L --fail -o $zip "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    if (-not (Test-Path $zip)) { Write-Output 'DOWNLOAD FAILED'; exit 1 }
    Write-Output "downloaded: $([math]::Round((Get-Item $zip).Length/1MB,1)) MB"
    $tmp = "$env:TEMP\cmdline-unzip"
    Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
    Expand-Archive $zip -DestinationPath $tmp -Force
    New-Item -ItemType Directory -Force -Path "$sdk\cmdline-tools" | Out-Null
    Move-Item "$tmp\cmdline-tools" "$sdk\cmdline-tools\latest" -Force
}
if (-not (Test-Path $sdkm)) { Write-Output 'SDKMANAGER MISSING'; exit 1 }
Write-Output "sdkmanager ready: $sdkm"

Write-Output '=== 2. JAVA_HOME ==='
$javac = Get-Command javac -ErrorAction SilentlyContinue
if ($javac) {
    $env:JAVA_HOME = Split-Path (Split-Path $javac.Source -Parent) -Parent
    Write-Output "JAVA_HOME = $env:JAVA_HOME"
} else {
    Write-Output 'WARNING: javac not found on PATH; Gradle may refuse to run'
}

Write-Output '=== 3. accept licenses + install packages ==='
$env:ANDROID_HOME = $sdk
$env:ANDROID_SDK_ROOT = $sdk
# 'y' repeated: sdkmanager asks once per license
('y' * 30 -split '' | Where-Object { $_ -eq 'y' }) -join "`n" | Out-Null
$yes = ("y`n" * 40)
$yes | & $sdkm --licenses 2>&1 | Select-Object -Last 3
& $sdkm --install "platform-tools" "platforms;android-34" "build-tools;34.0.0" 2>&1 | Select-Object -Last 6
Write-Output "platforms installed:"
Get-ChildItem "$sdk\platforms" -ErrorAction SilentlyContinue | ForEach-Object { "  $($_.Name)" }

Write-Output '=== 4. Capacitor ==='
Set-Location $proj
pnpm add @capacitor/core @capacitor/cli @capacitor/android 2>&1 | Select-Object -Last 4

Write-Output '=== 5. build web assets ==='
pnpm build 2>&1 | Select-Object -Last 3

Write-Output '=== 6. add android platform ==='
if (-not (Test-Path "$proj\android")) {
    npx cap add android 2>&1 | Select-Object -Last 6
} else {
    Write-Output 'android/ already exists'
}
npx cap sync android 2>&1 | Select-Object -Last 6

Write-Output '=== 7. gradle assembleDebug ==='
Set-Location "$proj\android"
if (Test-Path .\gradlew.bat) {
    .\gradlew.bat assembleDebug --no-daemon 2>&1 | Select-Object -Last 12
} else {
    Write-Output 'gradlew.bat MISSING'
}

Write-Output '=== 8. artifacts ==='
$apks = Get-ChildItem -Path $proj -Recurse -Filter *.apk -ErrorAction SilentlyContinue
if ($apks) {
    foreach ($a in $apks) { Write-Output "APK: $($a.FullName)  $([math]::Round($a.Length/1MB,1)) MB" }
} else {
    Write-Output 'NO APK PRODUCED'
}
