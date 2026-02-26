import axios from "axios";
import { getCurrentUser } from "./authService";

const API_URL = "https://irisa-page-web-backend.onrender.com/api/charts";

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
        // CORRECCIÓN: Tenías {$API_URL} con llaves pero sin el símbolo $ fuera o con backticks mal puestos.
        // Lo correcto es `${API_URL}`
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
        console.error("Error fetching charts:", error);
        throw error;
    }
}


export const getThermostatChartsData = async (setpointTemperature : number,
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
        console.error("Error fetching charts:", error);
        throw error;              
    }}


    export const getPressureSwitchChartsData = async ( setPoint : number,
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
        console.error("Error fetching charts:", error);
        throw error;              
    }
}