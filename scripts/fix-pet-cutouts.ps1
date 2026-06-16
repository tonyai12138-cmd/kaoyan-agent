Add-Type -AssemblyName System.Drawing

$source = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class PetCutoutTool
{
    private static bool IsNearWhite(Color c, int threshold)
    {
        return c.R > threshold && c.G > threshold && c.B > threshold;
    }

    private static bool IsBarrierColor(Color c, int threshold)
    {
        if (c.A == 0) return false;
        return !IsNearWhite(c, threshold);
    }

    public static void Cutout(string inputPath, string outputPath, int cropX, int cropY, int cropW, int cropH, int radius, int padding, int threshold)
    {
        using (var sourceFull = new Bitmap(inputPath))
        using (var source = new Bitmap(cropW, cropH, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(source))
            {
                g.Clear(Color.White);
                g.DrawImage(
                    sourceFull,
                    new Rectangle(0, 0, cropW, cropH),
                    new Rectangle(cropX, cropY, cropW, cropH),
                    GraphicsUnit.Pixel
                );
            }

            int width = source.Width;
            int height = source.Height;
            int count = width * height;
            var colors = new Color[count];
            var sourceMask = new bool[count];
            var barrier = new bool[count];
            var visited = new bool[count];

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int index = y * width + x;
                    Color c = source.GetPixel(x, y);
                    colors[index] = Color.FromArgb(255, c.R, c.G, c.B);
                    if (IsBarrierColor(c, threshold)) sourceMask[index] = true;
                }
            }

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    int index = y * width + x;
                    if (!sourceMask[index]) continue;

                    int minX = Math.Max(0, x - radius);
                    int maxX = Math.Min(width - 1, x + radius);
                    int minY = Math.Max(0, y - radius);
                    int maxY = Math.Min(height - 1, y + radius);

                    for (int yy = minY; yy <= maxY; yy++)
                    {
                        int row = yy * width;
                        for (int xx = minX; xx <= maxX; xx++)
                        {
                            barrier[row + xx] = true;
                        }
                    }
                }
            }

            var queue = new Queue<int>();
            Action<int> enqueueBackground = (index) =>
            {
                if (index < 0 || index >= count) return;
                if (visited[index] || barrier[index]) return;
                if (!IsNearWhite(colors[index], threshold)) return;
                visited[index] = true;
                queue.Enqueue(index);
            };

            for (int x = 0; x < width; x++)
            {
                enqueueBackground(x);
                enqueueBackground((height - 1) * width + x);
            }

            for (int y = 0; y < height; y++)
            {
                enqueueBackground(y * width);
                enqueueBackground(y * width + width - 1);
            }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;

                if (x > 0) enqueueBackground(index - 1);
                if (x < width - 1) enqueueBackground(index + 1);
                if (y > 0) enqueueBackground(index - width);
                if (y < height - 1) enqueueBackground(index + width);
            }

            using (var output = new Bitmap(width, height, PixelFormat.Format32bppArgb))
            {
                int minContentX = width;
                int minContentY = height;
                int maxContentX = -1;
                int maxContentY = -1;

                for (int y = 0; y < height; y++)
                {
                    for (int x = 0; x < width; x++)
                    {
                        int index = y * width + x;
                        Color pixel;
                        if (visited[index])
                        {
                            pixel = Color.FromArgb(0, 255, 255, 255);
                        }
                        else
                        {
                            Color c = colors[index];
                            pixel = Color.FromArgb(255, c.R, c.G, c.B);
                            minContentX = Math.Min(minContentX, x);
                            minContentY = Math.Min(minContentY, y);
                            maxContentX = Math.Max(maxContentX, x);
                            maxContentY = Math.Max(maxContentY, y);
                        }

                        output.SetPixel(x, y, pixel);
                    }
                }

                int x0 = Math.Max(0, minContentX - padding);
                int y0 = Math.Max(0, minContentY - padding);
                int x1 = Math.Min(width - 1, maxContentX + padding);
                int y1 = Math.Min(height - 1, maxContentY + padding);
                int outW = Math.Max(1, x1 - x0 + 1);
                int outH = Math.Max(1, y1 - y0 + 1);

                using (var cropped = new Bitmap(outW, outH, PixelFormat.Format32bppArgb))
                using (var cg = Graphics.FromImage(cropped))
                {
                    cg.Clear(Color.Transparent);
                    cg.DrawImage(
                        output,
                        new Rectangle(0, 0, outW, outH),
                        new Rectangle(x0, y0, outW, outH),
                        GraphicsUnit.Pixel
                    );
                    cropped.Save(outputPath, ImageFormat.Png);
                }
            }
        }
    }
}
"@

Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing

function Invoke-PetCutout {
  param(
    [string]$InputPath,
    [string]$OutputPath,
    [int]$CropX = 0,
    [int]$CropY = 0,
    [int]$CropW = 0,
    [int]$CropH = 0,
    [int]$Radius = 8,
    [int]$Padding = 8,
    [int]$Threshold = 232
  )

  $inputFull = (Resolve-Path $InputPath).Path
  $outputFull = Join-Path (Get-Location) $OutputPath
  $outputDir = Split-Path -Parent $outputFull
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

  if ($CropW -le 0 -or $CropH -le 0) {
    $bitmap = [System.Drawing.Bitmap]::new($inputFull)
    $CropW = $bitmap.Width
    $CropH = $bitmap.Height
    $bitmap.Dispose()
  }

  $temp = [System.IO.Path]::ChangeExtension($outputFull, ".tmp.png")
  [PetCutoutTool]::Cutout($inputFull, $temp, $CropX, $CropY, $CropW, $CropH, $Radius, $Padding, $Threshold)
  Move-Item -LiteralPath $temp -Destination $outputFull -Force
}

Invoke-PetCutout "public/pet/reference/kaoyan-bear-turnaround.jpg" "public/pet/kaoyan-pet-front.png" 60 70 330 500 12 8 180
Invoke-PetCutout "public/pet/reference/kaoyan-bear-turnaround.jpg" "public/pet/kaoyan-pet-back.png" 810 70 330 500 12 8 180
Invoke-PetCutout "public/pet/moods/nose-picking.jpg" "public/pet/moods/nose-picking.png" 0 0 0 0 12 8 232
Invoke-PetCutout "public/pet/moods/satisfied.jpg" "public/pet/moods/satisfied.png" 0 0 0 0 12 8 232
Invoke-PetCutout "E:/xwechat_files/wxid_i39wkgk50lib22_c8f2/temp/RWTemp/2026-06/e51c36452b983936284819138058d7ca.jpg" "public/pet/moods/thinking.png" 0 0 0 0 12 8 232
Invoke-PetCutout "E:/xwechat_files/wxid_i39wkgk50lib22_c8f2/temp/RWTemp/2026-06/9e20f478899dc29eb19741386f9343c8/8570f2ce42bc0080720364dcc62d6d9c.jpg" "public/pet/moods/angry.png" 0 0 0 0 12 8 232
