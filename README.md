# Filika MCP Server

Bu proje, Filika.co API'sini kullanarak bordro hesaplamaları ve insan kaynakları işlemlerini gerçekleştiren bir MCP (Model Context Protocol) server'ıdır.

## Özellikler

Bu MCP server aşağıdaki toolları sağlar:

### 1. `filika_get-wage-codes`
- **Açıklama**: Filika.co sistemindeki maaş kodlarını getirir
- **Parametreler**: Yok (dummy parameter gerekli)
- **Kullanım**: Sistemde tanımlı wage kodlarını listelemek için

### 2. `filika_calculate-payroll`
- **Açıklama**: Verilen parametrelerle bordro hesaplar
- **Parametreler**:
  - `period` (zorunlu): Bordro periyodu (YYYY-MM formatında, örn: 2024-01)
  - `payroll_type` (opsiyonel): Bordro tipi (varsayılan: salaryPayroll)
  - `gross_salary` (opsiyonel): Brüt maaş tutarı
  - `net_salary` (opsiyonel): Net maaş tutarı
  - `working_days` (opsiyonel): Çalışılan gün sayısı
  - `overtime_hours` (opsiyonel): Fazla mesai saatleri

### 3. `filika_calculate-severance`
- **Açıklama**: Kıdem tazminatı hesaplar
- **Parametreler**:
  - `job_start_date` (zorunlu): İşe başlama tarihi (YYYY-MM-DD formatında)
  - `job_end_date` (zorunlu): İşten ayrılma tarihi (YYYY-MM-DD formatında)
  - `gross_salary` (zorunlu): Brüt maaş tutarı
  - `bonus_amount` (opsiyonel): Yıllık ikramiye tutarı
  - `transportation_allowance` (opsiyonel): Ulaşım yardımı
  - `meal_allowance` (opsiyonel): Yemek yardımı
  - `other_payment` (opsiyonel): Diğer ödemeler
  - `cumulative_amount` (opsiyonel): Kümülatif vergi matrahı

### 4. `filika_get-employee-list`
- **Açıklama**: Çalışanlarla ilgili detaylı liste getirir
- **Parametreler**:
  - `month` (zorunlu): Rapor ayı (YYYY-MM formatında, örn: 2024-01)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
yarn install
```

2. Server'ı başlatın:
```bash
yarn start
```

Geliştirme modunda çalıştırmak için:
```bash
yarn dev
```

## Kullanım

### SSE Endpoint ile Bağlantı

Server başlatıldıktan sonra, SSE endpoint'i üzerinden bağlanabilirsiniz:

```
GET /sse?token=YOUR_FILIKA_TOKEN
```

**Önemli**: Token parametresi zorunludur ve Filika.co API token'ınız olmalıdır.

### Canlı URL Kullanımı

Canlı server için:
```
https://mcp.mertpamuk.com/sse?token=YOUR_FILIKA_TOKEN
```

### Claude Desktop Konfigürasyonu

Claude Desktop için `claude_desktop_config.json` dosyanızı şu şekilde güncelleyin:

**Yerel server için:**
```json
{
  "mcpServers": {
    "filika": {
      "command": "node",
      "args": ["--loader", "ts-node/esm", "/path/to/your/project/src/index.ts"],
      "env": {
        "FILIKA_TOKEN": "YOUR_FILIKA_TOKEN_HERE"
      }
    }
  }
}
```

**Canlı URL için (SSE Transport):**
```json
{
  "mcpServers": {
    "filika": {
      "url": "https://mcp.mertpamuk.com/sse?token=YOUR_FILIKA_TOKEN_HERE",
      "transport": "sse"
    }
  }
}
```

**Alternatif path-based token:**
```json
{
  "mcpServers": {
    "filika": {
      "url": "https://mcp.mertpamuk.com/sse/YOUR_FILIKA_TOKEN_HERE",
      "transport": "sse"
    }
  }
}
```

**Not**: Token'ınızı URL'de görünür olmasını istemiyorsanız, environment variable kullanarak yerel server'ı tercih edebilirsiniz.

### Örnek Kullanımlar

#### Maaş Kodlarını Getirme
```javascript
// Tool: filika_get-wage-codes
// Parametre: random_string: "dummy"
```

#### Bordro Hesaplama
```javascript
// Tool: filika_calculate-payroll
{
  "period": "2024-01",
  "gross_salary": 50000,
  "working_days": 22,
  "overtime_hours": 10
}
```

#### Kıdem Tazminatı Hesaplama
```javascript
// Tool: filika_calculate-severance
{
  "job_start_date": "2020-01-01",
  "job_end_date": "2024-01-01",
  "gross_salary": 50000,
  "bonus_amount": 5000
}
```

## Endpoints

- **SSE Endpoint**: `/sse?token=YOUR_TOKEN` - MCP bağlantısı için
- **Messages**: `/messages?sessionId=SESSION_ID` - MCP mesajları için
- **Health Check**: `/health` - Server durumu kontrolü

## API Entegrasyonu

Bu server, Filika.co REST API'sini kullanır:
- **Base URL**: https://api.filika.co
- **Authentication**: Bearer Token (URL parametresi olarak gönderilir)
- **Content-Type**: application/json

## Güvenlik

- Token URL parametresi olarak gönderilir
- CORS ayarları yapılandırılmıştır
- Hata durumlarında detaylı log tutulur

## Gereksinimler

- Node.js 18+
- TypeScript
- Filika.co API Token

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Destek

API ile ilgili sorularınız için: api@filika.co
