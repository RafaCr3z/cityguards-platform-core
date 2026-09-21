/* =====================================================================
   CityGuards — Template Bicep de Infraestrutura (IaC)
   
   Provisionamento completo da infraestrutura Cloud Native no Azure:
   - Resource Group (implícito se corrido a nível de RG)
   - Azure App Service Plan & Web App (Next.js Frontend/Backend)
   - Azure Storage Account (Blobs: occurrences-photos & thumbnails)
   - Azure Cognitive Services (Azure AI Vision para categorização e moderação)
   - Azure Function App (Consumo Serverless para triggers de blob)
   - Azure Cosmos DB Account (Opção original NoSQL SQL API)
   ===================================================================== */

@description('Prefixo para o nome de todos os recursos.')
@minLength(3)
@maxLength(12)
param prefix string = 'cityguards'

@description('Localização geográfica padrão para o provisionamento dos recursos.')
param location string = resourceGroup().location

@description('Tipo de plano tarifário para o Azure App Service.')
@allowed([
  'F1'
  'D1'
  'B1'
  'S1'
  'P1v2'
])
param appServiceSku string = 'B1'

@description('Nível de capacidade para a conta do Cosmos DB.')
param cosmosDbThroughput int = 400

// Nomes Únicos Dinâmicos baseados no prefixo e ID de subscrição curto
var uniqueSuffix = uniqueString(resourceGroup().id)
var storageAccountName = '${prefix}store${substring(uniqueSuffix, 0, 6)}'
var appServicePlanName = '${prefix}-asp-${uniqueSuffix}'
var webAppName = '${prefix}-web-${uniqueSuffix}'
var functionAppName = '${prefix}-func-${uniqueSuffix}'
var cognitiveServiceName = '${prefix}-ai-${uniqueSuffix}'
var cosmosDbName = '${prefix}-db-${uniqueSuffix}'

/* ── 1. Conta de Armazenamento (Azure Blob Storage) ───────────────────── */

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

// Contentor de fotos originais submetidas pelos cidadãos
resource photoContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccountName}/default/occurrences-photos'
  dependsOn: [
    storageAccount
  ]
}

// Contentor de thumbnails gerados pela Azure Function
resource thumbnailContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccountName}/default/thumbnails'
  dependsOn: [
    storageAccount
  ]
}

/* ── 2. Azure AI Vision (Serviços Cognitivos) ─────────────────────────── */

resource cognitiveService 'Microsoft.CognitiveServices/accounts@2022-10-25' = {
  name: cognitiveServiceName
  location: location
  sku: {
    name: 'S1'
  }
  kind: 'ComputerVision'
  properties: {
    customSubDomainName: '${prefix}-vision-${uniqueSuffix}'
    apiProperties: {}
  }
}

/* ── 3. Azure Cosmos DB (Camada NoSQL Original) ───────────────────────── */

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2022-08-15' = {
  name: cosmosDbName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2022-08-15' = {
  parent: cosmosDbAccount
  name: 'CityGuardsDB'
  properties: {
    resource: {
      id: 'CityGuardsDB'
    }
  }
}

resource occurrencesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-08-15' = {
  parent: cosmosDatabase
  name: 'Ocorrencias'
  properties: {
    resource: {
      id: 'Ocorrencias'
      partitionKey: {
        paths: [
          '/municipio'
        ]
        kind: 'Hash'
      }
      defaultTtl: -1
    }
    options: {
      throughput: cosmosDbThroughput
    }
  }
}

/* ── 4. App Service Plan & Web App (Plataforma Web Next.js) ───────────── */

resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServiceSku
    tier: 'Standard'
  }
  kind: 'linux'
  properties: {
    reserved: true // Requerido para planos Linux
  }
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: location
  kind: 'app'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'BLOB_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'AI_VISION_ENDPOINT'
          value: cognitiveService.properties.endpoint
        }
        {
          name: 'AI_VISION_KEY'
          value: cognitiveService.listKeys().key1
        }
      ]
    }
  }
}

/* ── 5. Azure Function App (Processamento Serverless & Triggers) ──────── */

resource functionAppPlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${prefix}-func-plan-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionAppPlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'AI_VISION_ENDPOINT'
          value: cognitiveService.properties.endpoint
        }
        {
          name: 'AI_VISION_KEY'
          value: cognitiveService.listKeys().key1
        }
      ]
    }
  }
}

/* ── outputs de Ligação ────────────────────────────────────────────────── */

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output storageAccountName string = storageAccount.name
output visionEndpoint string = cognitiveService.properties.endpoint
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint
