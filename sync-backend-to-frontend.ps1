# Script PowerShell para sincronizar Backend → Frontend
# Uso: .\sync-backend-to-frontend.ps1

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Rutas de los repositorios
$backendPath = "C:\Users\amoles\Desktop\listaCompra_Project\listaCompra"
$frontendPath = "C:\Users\amoles\Desktop\listaCompra_Project\listaCompra_frontend_web"

# Colores para output
$successColor = 'Green'
$warningColor = 'Yellow'
$errorColor = 'Red'
$infoColor = 'Cyan'

# Arreglo para rastrear cambios
$changesLog = @()

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

function Log-Success {
    param([string]$message)
    Write-Host "[OK] $message" -ForegroundColor $successColor
    $script:changesLog += "[OK] $message"
}

function Log-Warning {
    param([string]$message)
    Write-Host "[WARNING] $message" -ForegroundColor $warningColor
    $script:changesLog += "[WARNING] $message"
}

function Log-Error {
    param([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor $errorColor
    $script:changesLog += "[ERROR] $message"
}

function Log-Info {
    param([string]$message)
    Write-Host "[INFO] $message" -ForegroundColor $infoColor
}

function Ensure-Directory {
    param([string]$path)
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Log-Success "Directorio creado: $path"
        return $true
    }
    return $false
}

function Copy-FileWithValidation {
    param(
        [string]$source,
        [string]$destination,
        [string]$description
    )
    
    if (-not (Test-Path $source)) {
        Log-Warning "Archivo no encontrado: $source ($description)"
        return $false
    }
    
    try {
        Copy-Item -Path $source -Destination $destination -Force
        Log-Success "Copiado: $description"
        return $true
    }
    catch {
        Log-Error "Error al copiar ${description}: $_"
        return $false
    }
}

function Copy-DirectoryWithFilter {
    param(
        [string]$source,
        [string]$destination,
        [string[]]$extensions,
        [string]$description
    )
    
    if (-not (Test-Path $source)) {
        Log-Warning "Directorio no encontrado: $source"
        return 0
    }
    
    Ensure-Directory $destination | Out-Null
    $count = 0
    
    try {
        Get-ChildItem -Path $source -Recurse -Include $extensions | ForEach-Object {
            $sourceWithTrailingSlash = $source.TrimEnd('\') + '\'
            $relativePath = $_.FullName.Substring($sourceWithTrailingSlash.Length)
            $destFile = Join-Path $destination $relativePath
            $destDir = Split-Path $destFile -Parent
            
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            
            Copy-Item -Path $_.FullName -Destination $destFile -Force
            $count++
        }
        
        if ($count -gt 0) {
            Log-Success "${description}: $count archivos copiados"
        } else {
            Log-Warning "${description}: No se encontraron archivos"
        }
    }
    catch {
        Log-Error "Error al copiar directorio ${description}: $_"
    }
    
    return $count
}

# ============================================================================
# VALIDACIONES INICIALES
# ============================================================================

Write-Host ("`n" + "="*70) -ForegroundColor $infoColor
Write-Host "SINCRONIZACION BACKEND -> FRONTEND" -ForegroundColor $infoColor
Write-Host ("="*70 + "`n") -ForegroundColor $infoColor

# Validar que los repositorios existan
if (-not (Test-Path $backendPath)) {
    Log-Error "Ruta del backend no encontrada: $backendPath"
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Log-Error "Ruta del frontend no encontrada: $frontendPath"
    exit 1
}

Log-Success "Rutas validadas correctamente"
Log-Info "Backend: $backendPath"
Log-Info "Frontend: $frontendPath`n"

# ============================================================================
# CREAR ESTRUCTURA DE DIRECTORIOS EN FRONTEND
# ============================================================================

Log-Info "Creando estructura de directorios..."
Write-Host ""

$directories = @(
    "$frontendPath\src\types",
    "$frontendPath\src\lib\validators",
    "$frontendPath\src\lib\constants",
    "$frontendPath\src\lib\errors",
    "$frontendPath\src\lib\utils",
    "$frontendPath\src\lib\auth"
)

$directoriesCreated = 0
foreach ($dir in $directories) {
    if (Ensure-Directory $dir) {
        $directoriesCreated++
    }
}

if ($directoriesCreated -gt 0) {
    Log-Info "$directoriesCreated nuevos directorios creados`n"
} else {
    Log-Info "Todos los directorios ya existen`n"
}

# ============================================================================
# 1. COPIAR ENTIDADES (Domain Entities)
# ============================================================================

Write-Host "`n--- [1] COPIANDO ENTIDADES DEL DOMINIO ---`n" -ForegroundColor $infoColor

$backendEntitiesPath = "$backendPath\src\domain\entities"
$frontendTypesPath = "$frontendPath\src\types"

if (Test-Path $backendEntitiesPath) {
    Get-ChildItem -Path $backendEntitiesPath -Filter "*.ts" | ForEach-Object {
        $filename = $_.Name
        $source = $_.FullName
        $destination = "$frontendTypesPath\$($_.BaseName).types.ts"
        Copy-FileWithValidation -source $source -destination $destination -description "Entidad: $filename"
    }
} else {
    Log-Warning "Ruta de entidades no encontrada: $backendEntitiesPath"
}

# ============================================================================
# 2. COPIAR VALUE OBJECTS
# ============================================================================

Write-Host "`n--- [2] COPIANDO VALUE OBJECTS ---`n" -ForegroundColor $infoColor

$backendValueObjectsPath = "$backendPath\src\domain\value-objects"

if (Test-Path $backendValueObjectsPath) {
    $count = Copy-DirectoryWithFilter -source $backendValueObjectsPath `
        -destination "$frontendTypesPath\value-objects" `
        -extensions @("*.ts") `
        -description "Value Objects"
} else {
    Log-Warning "Ruta de value-objects no encontrada: $backendValueObjectsPath"
}

# ============================================================================
# 3. COPIAR DTOs
# ============================================================================

Write-Host "`n--- [3] COPIANDO DTOs (Data Transfer Objects) ---`n" -ForegroundColor $infoColor

$backendDtosPath = "$backendPath\src\application\dto"

if (Test-Path $backendDtosPath) {
    $count = Copy-DirectoryWithFilter -source $backendDtosPath `
        -destination "$frontendTypesPath\dtos" `
        -extensions @("*.ts") `
        -description "DTOs"
} else {
    Log-Warning "Ruta de DTOs no encontrada: $backendDtosPath"
}

# ============================================================================
# 4. COPIAR VALIDADORES
# ============================================================================

Write-Host "`n--- [4] COPIANDO VALIDADORES Y ESQUEMAS ---`n" -ForegroundColor $infoColor

$backendValidatorsPath = "$backendPath\src\shared\validators"
$frontendValidatorsPath = "$frontendPath\src\lib\validators"

if (Test-Path $backendValidatorsPath) {
    $count = Copy-DirectoryWithFilter -source $backendValidatorsPath `
        -destination $frontendValidatorsPath `
        -extensions @("*.ts") `
        -description "Validadores"
} else {
    Log-Warning "Ruta de validadores no encontrada: $backendValidatorsPath"
}

# También copiar validadores de features
$backendApplicationDtosPath = "$backendPath\src\application\dtos\validators"
if (Test-Path $backendApplicationDtosPath) {
    $count = Copy-DirectoryWithFilter -source $backendApplicationDtosPath `
        -destination "$frontendValidatorsPath\features" `
        -extensions @("*.ts") `
        -description "Validadores de Features"
}

# ============================================================================
# 5. COPIAR CONSTANTES
# ============================================================================

Write-Host "`n--- [5] COPIANDO CONSTANTES ---`n" -ForegroundColor $infoColor

$backendConstantsPath = "$backendPath\src\shared\constants"
$frontendConstantsPath = "$frontendPath\src\lib\constants"

if (Test-Path $backendConstantsPath) {
    $count = Copy-DirectoryWithFilter -source $backendConstantsPath `
        -destination $frontendConstantsPath `
        -extensions @("*.ts") `
        -description "Constantes"
} else {
    Log-Warning "Ruta de constantes no encontrada: $backendConstantsPath"
}

# ============================================================================
# 6. COPIAR ENUMERACIONES
# ============================================================================

Write-Host "`n--- [6] COPIANDO ENUMERACIONES ---`n" -ForegroundColor $infoColor

$backendEnumsPath = "$backendPath\src\shared\enums"

if (Test-Path $backendEnumsPath) {
    Get-ChildItem -Path $backendEnumsPath -Filter "*.ts" | ForEach-Object {
        $filename = $_.Name
        $source = $_.FullName
        $destination = "$frontendTypesPath\$filename"
        Copy-FileWithValidation -source $source -destination $destination -description "Enum: $filename"
    }
} else {
    Log-Warning "Ruta de enumeraciones no encontrada: $backendEnumsPath"
}

# ============================================================================
# 7. COPIAR ERRORES
# ============================================================================

Write-Host "`n--- [7] COPIANDO ERRORES Y EXCEPCIONES ---`n" -ForegroundColor $infoColor

$backendErrorsPath = "$backendPath\src\shared\errors"
$backendDomainErrorsPath = "$backendPath\src\domain\exceptions"
$frontendErrorsPath = "$frontendPath\src\lib\errors"

if (Test-Path $backendErrorsPath) {
    $count = Copy-DirectoryWithFilter -source $backendErrorsPath `
        -destination $frontendErrorsPath `
        -extensions @("*.ts") `
        -description "Errores compartidos"
}

if (Test-Path $backendDomainErrorsPath) {
    $count = Copy-DirectoryWithFilter -source $backendDomainErrorsPath `
        -destination "$frontendErrorsPath\domain" `
        -extensions @("*.ts") `
        -description "Excepciones del dominio"
}

# ============================================================================
# 8. COPIAR UTILIDADES
# ============================================================================

Write-Host "`n--- [8] COPIANDO UTILIDADES ---`n" -ForegroundColor $infoColor

$backendUtilsPath = "$backendPath\src\shared\utils"
$frontendUtilsPath = "$frontendPath\src\lib\utils"

if (Test-Path $backendUtilsPath) {
    $count = Copy-DirectoryWithFilter -source $backendUtilsPath `
        -destination $frontendUtilsPath `
        -extensions @("*.ts") `
        -description "Funciones de utilidad"
} else {
    Log-Warning "Ruta de utilidades no encontrada: $backendUtilsPath"
}

# ============================================================================
# 9. COPIAR CONFIGURACIÓN DE AUTENTICACIÓN
# ============================================================================

Write-Host "`n--- [9] COPIANDO CONFIGURACION DE AUTENTICACION ---`n" -ForegroundColor $infoColor

$backendAuthPath = "$backendPath\src\shared\auth"
$frontendAuthPath = "$frontendPath\src\lib\auth"

if (Test-Path $backendAuthPath) {
    $count = Copy-DirectoryWithFilter -source $backendAuthPath `
        -destination $frontendAuthPath `
        -extensions @("*.ts") `
        -description "Configuración de autenticación"
} else {
    Log-Info "Ruta de autenticación no encontrada (puede ser opcional)"
}

# ============================================================================
# 10. COPIAR TIPOS COMUNES
# ============================================================================

Write-Host "`n--- [10] COPIANDO TIPOS COMUNES ---`n" -ForegroundColor $infoColor

$backendTypesPath = "$backendPath\src\shared\types"

if (Test-Path $backendTypesPath) {
    $count = Copy-DirectoryWithFilter -source $backendTypesPath `
        -destination "$frontendTypesPath\common" `
        -extensions @("*.ts") `
        -description "Tipos comunes"
}

# ============================================================================
# REPORTE FINAL
# ============================================================================

Write-Host ("`n" + "="*70) -ForegroundColor $successColor
Write-Host "[COMPLETADO] SINCRONIZACION COMPLETADA" -ForegroundColor $successColor
Write-Host ("="*70 + "`n") -ForegroundColor $successColor

Write-Host "RESUMEN DE CAMBIOS:`n" -ForegroundColor $infoColor

$changesLog | ForEach-Object {
    Write-Host $_
}

# ============================================================================
# CREAR REPORTE EN ARCHIVO
# ============================================================================

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportPath = "$frontendPath\sync-report-$timestamp.txt"

Write-Host ("`n" + "="*70)
Write-Host "Generando reporte..." -ForegroundColor $infoColor
Write-Host ("="*70 + "`n")

$reportContent = "REPORTE DE SINCRONIZACION BACKEND -> FRONTEND`n"
$reportContent += "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
$reportContent += "UBICACIONES:`n"
$reportContent += "Backend: $backendPath`n"
$reportContent += "Frontend: $frontendPath`n`n"
$reportContent += "CAMBIOS REALIZADOS:`n"
$reportContent += ($changesLog -join "`n") + "`n`n"
$reportContent += "PROXIMOS PASOS:`n"
$reportContent += "1. Revisar los cambios en el frontend`n"
$reportContent += "2. Ejecutar: npm install (si hay nuevas dependencias)`n"
$reportContent += "3. Ejecutar: npm run build (para verificar que no hay errores de compilacion)`n"
$reportContent += "4. Ejecutar tests si es necesario`n"
$reportContent += "5. Commit de los cambios`n`n"
$reportContent += "ARCHIVOS COPIADOS:`n"
$reportContent += "- Entidades del dominio (entities)`n"
$reportContent += "- Value Objects`n"
$reportContent += "- DTOs (Data Transfer Objects)`n"
$reportContent += "- Validadores y esquemas Zod`n"
$reportContent += "- Constantes globales`n"
$reportContent += "- Enumeraciones`n"
$reportContent += "- Errores y excepciones`n"
$reportContent += "- Funciones de utilidad`n"
$reportContent += "- Configuracion de autenticacion`n"
$reportContent += "- Tipos comunes`n`n"
$reportContent += "NOTA: Revisa los imports en los archivos copiados. Algunos caminos pueden necesitar ajuste`n"
$reportContent += "para funcionar correctamente en el contexto del frontend.`n"

$reportContent | Out-File -FilePath $reportPath -Encoding UTF8
Log-Success "Reporte guardado en: $reportPath"

Write-Host "`n[SUCCESS] Sincronizacion finalizada exitosamente!`n" -ForegroundColor $successColor
