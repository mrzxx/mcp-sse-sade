import axios from 'axios';
export class FilikaService {
    api;
    token;
    constructor(token) {
        this.token = token;
        this.api = axios.create({
            baseURL: 'https://api.filika.co',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async getWageCodes() {
        try {
            const response = await this.api.get('/wage-codes');
            return response.data;
        }
        catch (error) {
            throw new Error(`Maaş kodları alınırken hata oluştu: ${error}`);
        }
    }
    async calculatePayroll(request) {
        try {
            const response = await this.api.post('/calculations/single', request);
            return response.data;
        }
        catch (error) {
            throw new Error(`Bordro hesaplanırken hata oluştu: ${error}`);
        }
    }
    async calculateSeverance(request) {
        try {
            const response = await this.api.post('/severance/calculate', request);
            return response.data;
        }
        catch (error) {
            throw new Error(`Kıdem tazminatı hesaplanırken hata oluştu: ${error}`);
        }
    }
    async getEmployeeList(month) {
        try {
            const response = await this.api.get(`/employees?month=${month}`);
            return response.data;
        }
        catch (error) {
            throw new Error(`Çalışan listesi alınırken hata oluştu: ${error}`);
        }
    }
}