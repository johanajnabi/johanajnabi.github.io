Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root 'assets\profile.webp'
$outputDir = Join-Path $root 'assets\social'

if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

function New-BitmapImage {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  $uri = [System.Uri]::new($Path)
  $bitmap = [System.Windows.Media.Imaging.BitmapImage]::new()
  $bitmap.BeginInit()
  $bitmap.UriSource = $uri
  $bitmap.CacheOption = [System.Windows.Media.Imaging.BitmapCacheOption]::OnLoad
  $bitmap.EndInit()
  $bitmap.Freeze()
  return $bitmap
}

function Save-JpegBitmap {
  param(
    [Parameter(Mandatory = $true)]
    [System.Windows.Media.Imaging.BitmapSource]$Bitmap,

    [Parameter(Mandatory = $true)]
    [string]$Path,

    [int]$Quality = 92
  )

  $encoder = [System.Windows.Media.Imaging.JpegBitmapEncoder]::new()
  $encoder.QualityLevel = $Quality
  $encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($Bitmap))

  $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create)
  try {
    $encoder.Save($stream)
  } finally {
    $stream.Dispose()
  }
}

function New-BackgroundBrush {
  $brush = [System.Windows.Media.LinearGradientBrush]::new()
  $brush.StartPoint = [System.Windows.Point]::new(0, 0)
  $brush.EndPoint = [System.Windows.Point]::new(1, 1)
  $brush.GradientStops.Add([System.Windows.Media.GradientStop]::new([System.Windows.Media.ColorConverter]::ConvertFromString('#f4f8ff'), 0.0))
  $brush.GradientStops.Add([System.Windows.Media.GradientStop]::new([System.Windows.Media.ColorConverter]::ConvertFromString('#ffffff'), 0.55))
  $brush.GradientStops.Add([System.Windows.Media.GradientStop]::new([System.Windows.Media.ColorConverter]::ConvertFromString('#f7faff'), 1.0))
  return $brush
}

function New-ProfileVariant {
  param(
    [Parameter(Mandatory = $true)]
    [System.Windows.Media.Imaging.BitmapSource]$Source,

    [Parameter(Mandatory = $true)]
    [int]$Width,

    [Parameter(Mandatory = $true)]
    [int]$Height,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [double]$PhotoScale = 0.78
  )

  $drawing = [System.Windows.Media.DrawingVisual]::new()
  $context = $drawing.RenderOpen()

  $canvasRect = [System.Windows.Rect]::new(0, 0, $Width, $Height)
  $context.DrawRectangle((New-BackgroundBrush), $null, $canvasRect)

  $backdropBrush = [System.Windows.Media.ImageBrush]::new($Source)
  $backdropBrush.Stretch = [System.Windows.Media.Stretch]::UniformToFill
  $backdropBrush.AlignmentX = [System.Windows.Media.AlignmentX]::Center
  $backdropBrush.AlignmentY = [System.Windows.Media.AlignmentY]::Center
  $backdropBrush.Opacity = 0.14
  $backdropBrush.Freeze()
  $context.DrawRectangle($backdropBrush, $null, $canvasRect)

  $veilBrush = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromArgb(196, 255, 255, 255))
  $veilBrush.Freeze()
  $context.DrawRectangle($veilBrush, $null, $canvasRect)

  $photoSize = [math]::Round([math]::Min($Width, $Height) * $PhotoScale)
  $photoX = [math]::Round(($Width - $photoSize) / 2)
  $photoY = [math]::Round(($Height - $photoSize) / 2)

  $shadowBrush = [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromArgb(36, 16, 23, 38))
  $shadowBrush.Freeze()
  $shadowRect = [System.Windows.Rect]::new($photoX, $photoY + 12, $photoSize, $photoSize)
  $context.DrawRoundedRectangle($shadowBrush, $null, $shadowRect, 32, 32)

  $photoRect = [System.Windows.Rect]::new($photoX, $photoY, $photoSize, $photoSize)
  $photoBrush = [System.Windows.Media.ImageBrush]::new($Source)
  $photoBrush.Stretch = [System.Windows.Media.Stretch]::UniformToFill
  $photoBrush.AlignmentX = [System.Windows.Media.AlignmentX]::Center
  $photoBrush.AlignmentY = [System.Windows.Media.AlignmentY]::Top
  $photoBrush.Freeze()
  $context.DrawRoundedRectangle($photoBrush, $null, $photoRect, 32, 32)

  $borderPen = [System.Windows.Media.Pen]::new(
    [System.Windows.Media.SolidColorBrush]::new([System.Windows.Media.Color]::FromArgb(212, 255, 255, 255)),
    4
  )
  $borderPen.Freeze()
  $context.DrawRoundedRectangle($null, $borderPen, $photoRect, 32, 32)
  $context.Close()

  $target = [System.Windows.Media.Imaging.RenderTargetBitmap]::new(
    $Width,
    $Height,
    96,
    96,
    [System.Windows.Media.PixelFormats]::Pbgra32
  )
  $target.Render($drawing)
  $target.Freeze()

  Save-JpegBitmap -Bitmap $target -Path $OutputPath
}

$source = New-BitmapImage -Path $sourcePath

New-ProfileVariant -Source $source -Width 1200 -Height 1200 -OutputPath (Join-Path $outputDir 'profile-1x1.jpg') -PhotoScale 1.0
New-ProfileVariant -Source $source -Width 1200 -Height 900 -OutputPath (Join-Path $outputDir 'profile-4x3.jpg') -PhotoScale 0.79
New-ProfileVariant -Source $source -Width 1200 -Height 675 -OutputPath (Join-Path $outputDir 'profile-16x9.jpg') -PhotoScale 0.74

Write-Output 'Generated profile image variants in assets/social'
