import axios from 'axios';

const request = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    timeout: 10000
});

// Request interceptor
request.interceptors.request.use(
    (config) => {
        // You can modify request headers or do other tasks here
        return config;
    },
    (error) => {
        // Handle request errors
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
request.interceptors.response.use(
    (response) => {
        // You can modify response data or do other tasks here
        return response;
    },
    (error) => {
        // Handle response errors
        console.error('Response error:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // Handle HTTP errors (status codes) here
            const status = error.response.status;
            if (status >= 550 || status === 400) {
                // known error
                return error.response
            } else if (status === 401) {
                // Unauthorized: Redirect the user to the login page
                window.location.href = '/login';
            } else {
                // Display a generic error message for other status codes
                console.error(`An error occurred: ${error.response.message}`);
            }
        } else if (error.request) {
            // The request was made but no response was received
            // Handle network errors here
            console.error('A network error occurred. Please check your internet connection.');
        } else {
            // Something happened in setting up the request that triggered an error
            console.error('Error message:', error.message);
        }
        return Promise.reject(error);
    }
);

export default request;
