param([ValidateSet('dev','preview','build','test')][string]$Modo='preview')
$ErrorActionPreference='Stop'
$projectPath=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectPath
$nodeCommand=Get-Command node -ErrorAction SilentlyContinue
$runtimeNode=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$nodePath=if($nodeCommand){$nodeCommand.Source}elseif(Test-Path -LiteralPath $runtimeNode){$runtimeNode}else{throw 'Se necesita Node.js 22.12 o posterior.'}
if(!(Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')){throw 'Faltan las dependencias del proyecto. Revisa README.md.'}
$env:PATH="$(Split-Path -Parent $nodePath);$env:PATH"
if($Modo -eq 'test'){& $nodePath --test 'tests/*.test.js';exit $LASTEXITCODE}
if($Modo -eq 'build' -or ($Modo -eq 'preview' -and !(Test-Path -LiteralPath 'dist\index.html'))){
  & $nodePath scripts/copy-runtime.mjs
  if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
  & $nodePath node_modules/vite/bin/vite.js build
  if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
}
if($Modo -eq 'build'){exit 0}
if($Modo -eq 'preview'){& $nodePath node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort}
else{& $nodePath node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort}
