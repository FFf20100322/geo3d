$ErrorActionPreference = 'Stop'
$ff = 'D:\FormatFactory\ffmpeg.exe'
$root = 'F:\deep seek-harness\geo3d\promo'
$cards = Join-Path $root 'cards'
$segs = Join-Path $root 'segs'
$out = Join-Path $root 'out'
New-Item -ItemType Directory -Force -Path $segs, $out | Out-Null
Get-ChildItem $segs -Filter '*.mp4' -ErrorAction SilentlyContinue | Remove-Item -Force

$seq = @(
  @('01-title.png', 3.0),
  @('02-hook.png', 4.0),
  @('03-core.png', 5.0),
  @('04-pipeline.png', 6.0),
  @('08-ch1.png', 4.0),
  @('09-ch2.png', 5.0),
  @('10-ch3.png', 4.0),
  @('11-ch4.png', 4.0),
  @('12-ch5.png', 4.0),
  @('13-ch6.png', 4.0),
  @('14-ch7.png', 4.0),
  @('15-ch8.png', 4.0),
  @('05-compare.png', 6.0),
  @('06-limits.png', 5.0),
  @('07-end.png', 3.0)
)

$i = 0
$list = New-Object System.Collections.Generic.List[string]
foreach ($s in $seq) {
  $i++
  $name = ('{0:d2}.mp4' -f $i)
  $d = [double]$s[1]
  $fadeOut = [math]::Round($d - 0.7, 2)
  $vf = "fps=30,fade=t=in:st=0:d=0.5,fade=t=out:st=${fadeOut}:d=0.7,format=yuv420p"
  & $ff -y -hide_banner -loglevel error -loop 1 -i (Join-Path $cards $s[0]) -t $d -vf $vf -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 (Join-Path $segs $name)
  if (-not (Test-Path (Join-Path $segs $name))) { throw "segment failed: $name" }
  $list.Add("file '$name'")
}

$concatFile = Join-Path $segs 'concat.txt'
Set-Content -Path $concatFile -Value ($list -join "`n") -Encoding utf8
$target = Join-Path $out 'geo3d-promo-60s.mp4'
Push-Location $segs
& $ff -y -hide_banner -loglevel error -f concat -safe 0 -i $concatFile -c copy $target
Pop-Location

& $ff -hide_banner -i $target 2>&1 | Select-String 'Duration|Stream #0:0' | ForEach-Object { $_.Line.Trim() }
"OUT: $target  $((Get-Item $target).Length) bytes"
