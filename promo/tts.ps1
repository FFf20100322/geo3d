$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$root = 'F:\deep seek-harness\geo3d\promo'
$audio = Join-Path $root 'audio'
New-Item -ItemType Directory -Force -Path $audio | Out-Null
$items = Get-Content -Raw -Encoding UTF8 (Join-Path $root 'vo.json') | ConvertFrom-Json
$ff = 'D:\FormatFactory\ffmpeg.exe'

foreach ($it in $items) {
  $out = Join-Path $audio ("vo-{0}.wav" -f $it.id)
  $syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $syn.SelectVoice('Microsoft Huihui Desktop')
  $syn.Rate = -1
  $syn.Volume = 100
  $syn.SetOutputToWaveFile($out)
  $syn.Speak($it.text)
  $syn.Dispose()
  $o = (& $ff -hide_banner -i $out 2>&1 | Out-String)
  $dur = ($o -split "`n" | Where-Object { $_ -match 'Duration' } | Select-Object -First 1)
  "{0}   {1}" -f $it.id, ($dur -replace '.*Duration: ([0-9:.]+).*', '$1')
}
