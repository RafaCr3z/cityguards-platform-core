/* =====================================================================
   CityGuards — Template Bicep de Infraestrutura (IaC) - Zero-Trust & Zero-Keys
   
   Provisionamento de Infraestrutura Cloud Native no Azure:
   - Resource Group (implícito se corrido a nível de RG)
   - Azure Storage Account (Blobs: occurrences-photos & thumbnails)
   - Azure AI Vision (Serviços Cognitivos)
   - Azure Cosmos DB Account (NoSQL SQL API)
   - Azure App Service Plan & Web App (Next.js) com System-Assigned Managed Identity
   - Azure Function App (Serverless Triggers) com System-Assigned Managed Identity
   - Azure RBAC Role Assignments (Zero-Keys Security Model):
       * Storage Blob Data Contributor para WebApp e FunctionApp
       * Cognitive Services User para WebApp e FunctionApp
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

// Definições de Papéis RBAC Built-in (Role Definition IDs)
var storageBlobDataContributorRoleId = 'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
var cognitiveServicesUserRoleId = 'a97b65f3-24c7-4388-baec-2e87135dc908'

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
    allowBlobPublicAccess: false
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
    publicNetworkAccess: 'Enabled'
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
  identity: {
    type: 'SystemAssigned' // Ativação de Managed Identity no Azure AD
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'AZURE_STORAGE_ACCOUNT_NAME'
          value: storageAccount.name
        }
        {
          name: 'AZURE_BLOB_SERVICE_URL'
          value: storageAccount.properties.primaryEndpoints.blob
        }
        {
          name: 'AI_VISION_ENDPOINT'
          value: cognitiveService.properties.endpoint
        }
        {
          name: 'COSMOS_DB_ENDPOINT'
          value: cosmosDbAccount.properties.documentEndpoint
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
  identity: {
    type: 'SystemAssigned' // Managed Identity para a Function App
  }
  properties: {
    serverFarmId: functionAppPlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage__accountName'
          value: storageAccount.name
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
          name: 'AZURE_BLOB_SERVICE_URL'
          value: storageAccount.properties.primaryEndpoints.blob
        }
      ]
    }
  }
}

/* ── 6. Atribuições de Funções RBAC (Role Assignments - Zero-Keys) ────── */

// Conceder permissão de leitura/escrita de Blobs ao WebApp
resource webAppStorageRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, webApp.id, storageBlobDataContributorRoleId)
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleId)
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Conceder permissão de leitura/escrita de Blobs à FunctionApp
resource functionAppStorageRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, functionApp.id, storageBlobDataContributorRoleId)
  scope: storageAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', storageBlobDataContributorRoleId)
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Conceder permissão de uso do Azure AI Vision ao WebApp
resource webAppCognitiveRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cognitiveService.id, webApp.id, cognitiveServicesUserRoleId)
  scope: cognitiveService
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

// Conceder permissão de uso do Azure AI Vision à FunctionApp
resource functionAppCognitiveRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(cognitiveService.id, functionApp.id, cognitiveServicesUserRoleId)
  scope: cognitiveService
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', cognitiveServicesUserRoleId)
    principalId: functionApp.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

/* ── outputs de Ligação ────────────────────────────────────────────────── */

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppPrincipalId string = webApp.identity.principalId
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppPrincipalId string = functionApp.identity.principalId
output storageAccountName string = storageAccount.name
output visionEndpoint string = cognitiveService.properties.endpoint
output cosmosDbEndpoint string = cosmosDbAccount.properties.documentEndpoint
