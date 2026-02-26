import axios from "axios";
import { getCurrentUser } from "./authService";
// Importamos el tipo desde el archivo hermano en la misma carpeta service
import type { PressureSwitchTest } from "./pressureSwitchTest"; 

// Si no tienes el tipo PressureSwitch definido, aquí te dejo la estructura base
export interface PressureSwitch {
    id?: number;
    reportId: number;
    nombre?: string;
    // ... otros campos que tengas en tu tabla de presostato
}

const API_URL = "http://localhost:8080/api/pressure-switch";

export const getAllPressureSwiches = async () => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.get(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pressure switches:", error);
        throw error;
    }
}

export const getPressureSwitchByReportId = async (reportId: number) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.get(`${API_URL}/report/${reportId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pressure switch by report ID:", error);
        throw error;
    }
}

export const createPressureSwitch = async (pressureSwitchData: PressureSwitch) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(API_URL, pressureSwitchData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating pressure switch:", error);
        throw error;
    }
}

export const updatePressureSwitch = async (id: number, pressureSwitchData: PressureSwitch) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.put(`${API_URL}/${id}`, pressureSwitchData, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating pressure switch:", error);
        throw error;
    }
}

export const deletePressureSwitch = async (id: number) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting pressure switch:", error);
        throw error;
    }
};