import axios from "axios";
import { getCurrentUser } from "./authService";

const API_URL = "https://irisa-page-web-backend.onrender.com/api/charts";

/**
 * Obtiene datos para gráficas de Transmisores
 */
export const getTransmitterChartsData = async (
    lrv: number, 
    span: number,
    measurements: Array<{
        percentage: number;
        patronUe: number;
        ueTransmitter: number;
        maTransmitter: number;
    }>
) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(`${API_URL}/transmitter`, {
            lrv,
            span,
            measurements
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching transmitter charts:", error);
        throw error;
    }
}

/**
 * Obtiene datos para gráficas de Termostatos
 */
export const getThermostatChartsData = async (
    setpointTemperature : number,
    differentialTemperature : number,
    testPoints : Array<{
        typeTest: string,
        appliedTemperature: number,
        realTemperatureChange: number
    }>
) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(`${API_URL}/thermostat`, {
            setpointTemperature,
            differentialTemperature,
            testPoints
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching thermostat charts:", error);
        throw error;              
    }
}

/**
 * Obtiene datos para gráficas de Presostatos
 */
export const getPressureSwitchChartsData = async ( 
    setPoint : number,
    differential : number,
    testPoints : Array<{
        typeTest: string,
        appliedPressure: number,
        realPressureChange: number
    }>
) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(`${API_URL}/pressure-switch`, {
            setPoint,
            differential,
            testPoints
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pressure switch charts:", error);
        throw error;              
    }
}

/**
 * Obtiene datos para gráficas de Sensores de pH
 */
export const getPHChartsData = async (
    tests: Array<{
        promedio: string;
        desviacion: string;
        voltaje: string;
        temperatura: string;
        error: string;
    }>
) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(`${API_URL}/ph`, {
            tests
        }, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching pH charts:", error);
        throw error;
    }
}