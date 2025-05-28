import { mcpServer, setFilikaToken } from "./mcp-server.js";
import { createSSEServer } from "./sse-server.js";
// Environment variable'dan token'ı oku
const filikaToken = process.env.FILIKA_TOKEN;
if (filikaToken) {
    setFilikaToken(filikaToken);
    console.log("Filika token ayarlandı.");
}
else {
    console.warn("FILIKA_TOKEN environment variable bulunamadı. Toollar çalışmayabilir.");
}
const sseServer = createSSEServer(mcpServer);
console.log("MCP Server başlatılıyor...");
sseServer.listen(3000, () => {
    console.log("MCP Server 3000 portunda çalışıyor");
    console.log("Mevcut toollar:");
    console.log("- filika_get-wage-codes: Maaş kodlarını getirir");
    console.log("- filika_calculate-payroll: Bordro hesaplar");
    console.log("- filika_calculate-severance: Kıdem tazminatı hesaplar");
    console.log("- filika_get-employee-list: Çalışan listesi getirir");
});
