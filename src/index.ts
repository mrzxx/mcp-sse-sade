import { mcpServer } from "./mcp-server.js";
import { createSSEServer } from "./sse-server.js";

const sseServer = createSSEServer(mcpServer);

const PORT = process.env.PORT || 3000;

console.log("MCP Server başlatılıyor...");
sseServer.listen(PORT, () => {
  console.log(`MCP Server ${PORT} portunda çalışıyor`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse?token=YOUR_TOKEN`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log("Mevcut toollar:");
  console.log("- filika_get-wage-codes: Maaş kodlarını getirir");
  console.log("- filika_calculate-payroll: Bordro hesaplar");
  console.log("- filika_calculate-severance: Kıdem tazminatı hesaplar");
  console.log("- filika_get-employee-list: Çalışan listesi getirir");
  console.log("\nToken URL parametresi olarak gönderilmelidir:");
  console.log("Örnek: /sse?token=your_filika_token_here");
});
