const API_URL = 'http://localhost:8080/api/auth';

export const login = async (username: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Login failed');
    }

    const data = await response.json();
    
    if (data.token) {
        localStorage.setItem('authToken', data.token);
        // Guardamos también el usuario
        localStorage.setItem('currentUser', username);
    }
    
    return data;
};

export const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
    return !!getToken();
};

// ¡Esta es la función que faltaba!
export const getCurrentUser = () => {
    return localStorage.getItem('currentUser');
};