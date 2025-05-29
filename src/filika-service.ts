import axios from 'axios';
import type { AxiosInstance } from 'axios';

export interface WageCode {
  code: string;
  type: string;
  description: string;
}

export interface PayrollRequest {
  period: string;
  payroll_type?: string;
  wages?: Array<{
    code: string;
    amount: number;
  }>;
  fields?: Array<{
    code: string;
    value: string | number | boolean;
  }>;
}

export interface PayrollResponse {
  payroll: {
    payroll_summary: Array<{
      code: string;
      amount: number;
      description?: string;
    }>;
    calculated_wages: Array<{
      code: string;
      amount: number;
      description?: string;
    }>;
  };
}

export interface SeveranceRequest {
  job_start_date: string;
  job_end_date: string;
  gross_salary: number;
  bonus_amount?: number;
  transportation_allowance?: number;
  meal_allowance?: number;
  other_payment?: number;
  cumulative_amount?: number;
}

export interface SeveranceResponse {
  notice_period: number;
  gross_notice_compensation: number;
  income_tax_and_premium_notice_compensation: number;
  stamp_tax_and_premium_notice_compensation: number;
  net_notice_compensation: number;
  seniority_period: number;
  gross_seniority_compensation: number;
  stamp_tax_and_premium_seniority_compensation: number;
  net_seniority_compensation: number;
  total_net_compensation: number;
  year: number;
  month: number;
  day: number;
}

export interface EmployeeListRequest {
  integration_id: "current-list-report";
  month: string;
}

export interface EmployeeListResponse {
  headers: any;
  rows: any;
}

export class FilikaService {
  private api: AxiosInstance;
  private token: string;

  constructor(token: string) {
    this.token = token;
    this.api = axios.create({
      baseURL: 'https://api.filika.co',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getWageCodes(): Promise<WageCode[]> {
    try {
      const response = await this.api.get('/wage-codes');
      return response.data;
    } catch (error) {
      throw new Error(`Maaş kodları alınırken hata oluştu: ${error}`);
    }
  }

  async calculatePayroll(request: PayrollRequest): Promise<PayrollResponse> {
    try {
      const response = await this.api.post('/calculations/single', request);
      return response.data;
    } catch (error) {
      throw new Error(`Bordro hesaplanırken hata oluştu: ${error}`);
    }
  }

  async calculateSeverance(request: SeveranceRequest): Promise<SeveranceResponse> {
    try {
      const response = await this.api.post('/severance/calculate', request);
      return response.data;
    } catch (error) {
      throw new Error(`Kıdem tazminatı hesaplanırken hata oluştu: ${error}`);
    }
  }


  async getEmployeeList(request: EmployeeListRequest): Promise<EmployeeListResponse> {
    try {
      const response = await this.api.post('/integrations/outbound', request);
      return response.data;
    } catch (error) {
      throw new Error(`Çalışan listesi alınırken hata oluştu: ${error}`);
    }
  }
} 