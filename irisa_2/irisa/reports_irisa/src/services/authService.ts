// Quitamos el '/login' del final de la URL base
const API_URL = 'https://irisa-page-web-backend.onrender.com/api/auth';

export const login = async (username: string, password: string) => {
    // Ahora aquí sí queda bien: .../api/auth/login
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        // Si el servidor responde 401 o 500, lanzamos error
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    
    if (data.token) {
        localStorage.setItem('authToken', data.token);
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

export const getCurrentUser = () => {
    return localStorage.getItem('currentUser');
};