import axios from 'axios';
import { getCurrentUser } from './authService';
import type { PressureSwitchTest } from '../types/PressureSwitchTest';

const API_URL = 'http://localhost:8080/api/pressure-switch-test';

export const getTestsByPressureSwitchId = async (pressureSwitchId: number) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.get(`${API_URL}/${pressureSwitchId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching tests for pressure switch ${pressureSwitchId}:`, error);
        throw error;
    }
};

export const createTestForPressureSwitch = async (pressureSwitchId: number, testData: PressureSwitchTest) => {
    const user = getCurrentUser();
    const token = user?.token;
    try {
        const response = await axios.post(`${API_URL}/create/pressure-switch/${pressureSwitchId}`, testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating pressure switch test:', error);
        throw error;
    }
};

// export const updatePressureSwitchTest = async (id: number, testData: PressureSwitchTest) => {
//     const user = getCurrentUser();
//     const token = user?.token;
//     try {
//         const response = await axios.put(`${API_URL}/update-pressure-switch-test/${id}`, testData, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error updating pressure switch test ${id}:`, error);
//         throw error;
//     }
// };

// export const deletePressureSwitchTest = async (id: number) => {
//     const user = getCurrentUser();
//     const token = user?.token;
//     try {
//         await axios.delete(`${API_URL}/delete-pressure-switch-test/${id}`, {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//     } catch (error) {
//         console.error(`Error deleting pressure switch test ${id}:`, error);
//         throw error;
//     }
// };
