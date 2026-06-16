Add-Type -AssemblyName System.Drawing

function Repair-TransparentPetInterior {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$Radius = 8
  )

  $src = [System.Drawing.Bitmap]::new((Resolve-Path $InputPath).Path)
  $width = $src.Width
  $height = $src.Height
  $count = $width * $height
  $barrierSource = New-Object 'bool[]' $count
  $barrier = New-Object 'bool[]' $count
  $visited = New-Object 'bool[]' $count
  $colors = New-Object 'System.Drawing.Color[]' $count

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $index = $y * $width + $x
      $color = $src.GetPixel($x, $y)
      $colors[$index] = $color
      if ($color.A -gt 16 -and ($color.R -lt 245 -or $color.G -lt 245 -or $color.B -lt 245)) {
        $barrierSource[$index] = $true
      }
    }
  }

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $index = $y * $width + $x
      if (-not $barrierSource[$index]) {
        continue
      }

      $minX = [Math]::Max(0, $x - $Radius)
      $maxX = [Math]::Min($width - 1, $x + $Radius)
      $minY = [Math]::Max(0, $y - $Radius)
      $maxY = [Math]::Min($height - 1, $y + $Radius)

      for ($yy = $minY; $yy -le $maxY; $yy++) {
        $row = $yy * $width
        for ($xx = $minX; $xx -le $maxX; $xx++) {
          $barrier[$row + $xx] = $true
        }
      }
    }
  }

  $queue = New-Object 'System.Collections.Generic.Queue[int]'

  function Add-OutsidePixel {
    param([int]$Index)

    if ($Index -lt 0 -or $Index -ge $count) {
      return
    }
    if ($visited[$Index] -or $barrier[$Index]) {
      return
    }

    $color = $colors[$Index]
    if ($color.A -gt 16 -and ($color.R -lt 245 -or $color.G -lt 245 -or $color.B -lt 245)) {
      return
    }

    $visited[$Index] = $true
    $queue.Enqueue($Index)
  }

  for ($x = 0; $x -lt $width; $x++) {
    Add-OutsidePixel $x
    Add-OutsidePixel (($height - 1) * $width + $x)
  }

  for ($y = 0; $y -lt $height; $y++) {
    Add-OutsidePixel ($y * $width)
    Add-OutsidePixel ($y * $width + $width - 1)
  }

  while ($queue.Count -gt 0) {
    $index = $queue.Dequeue()
    $x = $index % $width
    $y = [int][Math]::Floor($index / $width)

    if ($x -gt 0) { Add-OutsidePixel ($index - 1) }
    if ($x -lt $width - 1) { Add-OutsidePixel ($index + 1) }
    if ($y -gt 0) { Add-OutsidePixel ($index - $width) }
    if ($y -lt $height - 1) { Add-OutsidePixel ($index + $width) }
  }

  $output = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

  for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      $index = $y * $width + $x
      $color = $colors[$index]
      if ($color.A -le 16 -and -not $visited[$index]) {
        $output.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
      } else {
        $output.SetPixel($x, $y, $color)
      }
    }
  }

  $outputFull = Join-Path (Get-Location) $OutputPath
  $temp = [System.IO.Path]::ChangeExtension($outputFull, ".tmp.png")
  $output.Save($temp, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
  $src.Dispose()

  Move-Item -LiteralPath $temp -Destination $outputFull -Force
}

Repair-TransparentPetInterior "C:/Temp/kaoyan-pet-sprites/kaoyan-pet-front.png" "public/pet/kaoyan-pet-front.png" 8
Repair-TransparentPetInterior "C:/Temp/kaoyan-pet-sprites/kaoyan-pet-back.png" "public/pet/kaoyan-pet-back.png" 14
