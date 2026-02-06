import axios from 'axios';
import { getCurrentUser } from './authService';
import type { ReportType } from '../types/ReportType';

const API_URL = 'http://localhost:8080/api/reports';

// --- Funciones CRUD para Reportes ---

export const getAllReports = async (): Promise<ReportType[]> => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.get(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all reports:', error);
        throw error;
    }
};

export const getReportById = async (id: number): Promise<ReportType> => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching report ${id}:`, error);
        throw error;
    }
};

export const createReport = async (reportData: Omit<ReportType, 'id'>): Promise<ReportType> => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(API_URL, reportData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
};



// export const updateReport = async (id: number, reportData: ReportType): Promise<ReportType> => {
//     const user = getCurrentUser();
//     const token = user?.token;
//     try {
//         const response = await axios.put(`${API_URL}/${id}`, reportData, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error updating report ${id}:`, error);
//         throw error;
//     }
// };

// export const deleteReport = async (id: number): Promise<void> => {
//     const user = getCurrentUser();
//     const token = user?.token;
//     try {
//         await axios.delete(`${API_URL}/${id}`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//     } catch (error) {
//         console.error(`Error deleting report ${id}:`, error);
//         throw error;
//     }
// };


// --- Generación de PDF ---

// En reportService.js
export const generateReportPdf = async (reportData: any) => {
    const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
    });
    
    return response.blob();
};