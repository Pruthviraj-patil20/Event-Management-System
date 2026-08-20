using namespace System.Net
$port = 8080
$listener = [HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"
try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $path = $context.Request.Url.LocalPath.TrimStart('/')
        if ($path -eq '') { $path = 'index.html' }
        $fullPath = Join-Path $PWD.Path "frontend\$path"
        $response = $context.Response
        if (Test-Path $fullPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $mime = "text/plain"
            switch ($ext) {
                ".html" { $mime = "text/html" }
                ".css"  { $mime = "text/css" }
                ".js"   { $mime = "application/javascript" }
                ".json" { $mime = "application/json" }
                ".png"  { $mime = "image/png" }
                ".jpg"  { $mime = "image/jpeg" }
            }
            $response.ContentType = $mime
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
