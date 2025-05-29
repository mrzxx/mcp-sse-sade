import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FilikaService } from "./filika-service.js";
import { z } from "zod";

const mcpServer = new McpServer({
  name: "FilikaMCPServer",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {},
  },
});

// Filika servisini başlatmak için token gerekli
let filikaService: FilikaService | null = null;

// Tool 1: Maaş kodlarını getir
mcpServer.tool(
  "filika_get-wage-codes",
  "Filika.co sistemindeki maaş kodlarını getirir",
  {
    random_string: z.string().describe("Dummy parameter for no-parameter tools"),
  },
  async (args) => {
    if (!filikaService) {
      throw new Error("Filika servisi başlatılmamış. Lütfen önce token'ı ayarlayın.");
    }

    try {
      const wageCodes = await filikaService.getWageCodes();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(wageCodes, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Maaş kodları alınamadı: ${error}`);
    }
  }
);

// Tool 2: Bordro hesapla
mcpServer.tool(
  "filika_calculate-payroll",
  "Verilen parametrelerle bordro hesaplar",
  {
    period: z.string().describe("Bordro periyodu (YYYY-MM formatında, örn: 2024-01)"),
    payroll_type: z.string().optional().describe("Bordro tipi (varsayılan: salaryPayroll)"),
    gross_salary: z.number().optional().describe("Brüt maaş tutarı"),
    net_salary: z.number().optional().describe("Net maaş tutarı"),
    working_days: z.number().optional().describe("Çalışılan gün sayısı"),
    overtime_hours: z.number().optional().describe("Fazla mesai saatleri"),
  },
  async (args) => {
    if (!filikaService) {
      throw new Error("Filika servisi başlatılmamış. Lütfen önce token'ı ayarlayın.");
    }

    try {
      const request = {
        period: args.period,
        payroll_type: args.payroll_type || "salaryPayroll",
        wages: [] as Array<{ code: string; amount: number }>,
        fields: [] as Array<{ code: string; value: string | number | boolean }>
      };

      // Brüt maaş varsa ekle
      if (args.gross_salary) {
        request.wages.push({
          code: "P001", // Brüt maaş kodu
          amount: args.gross_salary
        });
      }

      // Net maaş varsa ekle
      if (args.net_salary) {
        request.fields.push({
          code: "F001", // Net maaş field kodu
          value: args.net_salary
        });
      }

      // Çalışma günü varsa ekle
      if (args.working_days) {
        request.wages.push({
          code: "S001", // Normal mesai kodu
          amount: args.working_days
        });
      }

      // Fazla mesai varsa ekle
      if (args.overtime_hours) {
        request.wages.push({
          code: "S018", // Fazla mesai 150% kodu
          amount: args.overtime_hours
        });
      }

      const result = await filikaService.calculatePayroll(request);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Bordro hesaplanamadı: ${error}`);
    }
  }
);

// Tool 3: Kıdem tazminatı hesapla
mcpServer.tool(
  "filika_calculate-severance",
  "Kıdem tazminatı hesaplar",
  {
    job_start_date: z.string().describe("İşe başlama tarihi (YYYY-MM-DD formatında)"),
    job_end_date: z.string().describe("İşten ayrılma tarihi (YYYY-MM-DD formatında)"),
    gross_salary: z.number().describe("Brüt maaş tutarı"),
    bonus_amount: z.number().optional().describe("Yıllık ikramiye tutarı"),
    transportation_allowance: z.number().optional().describe("Ulaşım yardımı"),
    meal_allowance: z.number().optional().describe("Yemek yardımı"),
    other_payment: z.number().optional().describe("Diğer ödemeler"),
    cumulative_amount: z.number().optional().describe("Kümülatif vergi matrahı"),
  },
  async (args) => {
    if (!filikaService) {
      throw new Error("Filika servisi başlatılmamış. Lütfen önce token'ı ayarlayın.");
    }

    try {
      const request = {
        job_start_date: args.job_start_date,
        job_end_date: args.job_end_date,
        gross_salary: args.gross_salary,
        bonus_amount: args.bonus_amount,
        transportation_allowance: args.transportation_allowance,
        meal_allowance: args.meal_allowance,
        other_payment: args.other_payment,
        cumulative_amount: args.cumulative_amount,
      };

      const result = await filikaService.calculateSeverance(request);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Kıdem tazminatı hesaplanamadı: ${error}`);
    }
  }
);

// Tool 4: Çalışan listesi getir
mcpServer.tool(
  "filika_get-employee-list",
  "Çalışanlarla ilgili detaylı liste getirir",
  {
    month: z.string().describe("Rapor ayı (YYYY-MM formatında, örn: 2024-01)"),
  },
  async (args) => {
    if (!filikaService) {
      throw new Error("Filika servisi başlatılmamış. Lütfen önce token'ı ayarlayın.");
    }

    try {
      const request = {
        integration_id: "current-list-report",
        month: args.month
      };
      
      const result = await filikaService.getEmployeeList(request);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Çalışan listesi alınamadı: ${error}`);
    }
  }
);

// Token ayarlama fonksiyonu (server başlatılırken çağrılacak)
export function setFilikaToken(token: string) {
  filikaService = new FilikaService(token);
}

export { mcpServer };