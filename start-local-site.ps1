$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$prefix = "http://localhost:$port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

function Test-AppRuntime {
  $requiredFiles = @(
    "node_modules\react\umd\react.development.js",
    "node_modules\react-dom\umd\react-dom.development.js",
    "node_modules\@babel\standalone\babel.min.js",
    "node_modules\@supabase\supabase-js\dist\umd\supabase.js"
  )
  foreach ($file in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $root $file) -PathType Leaf)) {
      return $false
    }
  }
  return $true
}

function Initialize-AppRuntime {
  if (Test-AppRuntime) { return }
  Write-Host "Local browser runtime packages are missing. Attempting npm install..."
  Push-Location $root
  try {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "npm install did not complete. The browser will try CDN fallbacks; if the app still does not load, run npm.cmd install manually and restart."
      return
    }
  } finally {
    Pop-Location
  }
  if (-not (Test-AppRuntime)) {
    Write-Warning "Local runtime packages are still missing. The browser will try CDN fallbacks; if the app still does not load, run npm.cmd install manually and restart."
  }
}

function Get-ContentType($path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".jsx" { "text/babel; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

try {
  Initialize-AppRuntime
  $listener.Start()
  Write-Host "V Solutions HR OS is running at $prefix"
  Write-Host "Press Ctrl+C to stop."
  Start-Process $prefix

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = "index.html" }

    $fullPath = Join-Path $root $requestPath
    $resolvedRoot = [System.IO.Path]::GetFullPath($root)
    $resolvedPath = [System.IO.Path]::GetFullPath($fullPath)

    if (-not $resolvedPath.StartsWith($resolvedRoot) -or -not (Test-Path -LiteralPath $resolvedPath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
    } else {
      $context.Response.ContentType = Get-ContentType $resolvedPath
      $bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
    }

    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  }
} finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
}
