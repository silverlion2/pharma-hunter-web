$ErrorActionPreference = 'Stop'

function Write-Omm {
    param(
        [string]$Path,
        [string]$Field,
        [string]$Content
    )
    $tempFile = [System.IO.Path]::GetTempFileName()
    Set-Content -Path $tempFile -Value $Content -Encoding UTF8
    Get-Content $tempFile -Raw | omm write $Path $Field -
    Remove-Item $tempFile
}

Write-Omm "overall-architecture" "diagram" @"
graph LR
    react-frontend["React Frontend\nsrc/"]
    python-ingestion["Data Ingestion\nupdate_data.py"]
    database-schema["Database SQL\n*.sql"]
    supabase-backend["Supabase Backend\nsrc/utils/supabase.js"]
    
    react-frontend -->|"fetches data via"| supabase-backend
    python-ingestion -->|"pushes real-time data to"| supabase-backend
    database-schema -->|"defines tables for"| supabase-backend
    
    classDef external fill:#585b70,stroke:#585b70,color:#cdd6f4
    classDef store fill:#a6e3a1,stroke:#a6e3a1,color:#1e1e2e
    classDef entry fill:#89b4fa,stroke:#89b4fa,color:#1e1e2e
    
    class supabase-backend store
    class python-ingestion entry
"@

Write-Omm "overall-architecture" "description" @"
The BioQuantix (Pharma Hunter) system architecture. It consists of a React Vite frontend, a Python data ingestion layer, and a Supabase backend to serve the application data.
"@

Write-Omm "overall-architecture/react-frontend" "diagram" @"
graph TD
    components["Components\nsrc/components/"]
    data["Mock Data\nsrc/data/"]
    utils["Utils\nsrc/utils/"]
    
    components -->|"loads static config"| data
    components -->|"calls DB"| utils
"@

Write-Omm "overall-architecture/react-frontend" "description" @"
The frontend application using React 19, Vite, and tailwind css. Contains various specialized trackers like BiosecureTracker, PatentRadar, and DealTracker.
"@

Write-Omm "overall-architecture/python-ingestion" "description" @"
A heavy `update_data.py` worker that pulls biotech and pharma intelligence (Clinical trials, FDA approvals, deals) and pushes it to Supabase data dumps.
"@

Write-Omm "overall-architecture/database-schema" "description" @"
Contains multiple incremental .sql files setting up triggers, Gap Map expansions, and Patent Radar tables in the Supabase PostgreSQL environment.
"@

Write-Omm "overall-architecture/supabase-backend" "description" @"
The backend-as-a-service layer providing auth, database, and edge functions. Accessed from the React frontend via `@supabase/supabase-js`.
"@

Write-Host "OMM documentation generation complete."
