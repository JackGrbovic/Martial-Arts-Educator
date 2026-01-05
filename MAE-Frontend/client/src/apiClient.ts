import { resolve } from 'path';
import axios, { AxiosResponse } from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
// const API_BASE = "http://localhost:5240"

export const api = axios.create({
    baseURL: `${API_BASE}/api/mae`,
    withCredentials: true,
  });

let isRefreshing = false;
let failedQueue : Promise<AxiosResponse>[] = [];

const processQueue = (error, user = null) => {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(user)))
    failedQueue = [];
};

let accessToken: String = "";

export const authApi = {
    setAccessToken(token: String){
        accessToken = token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    clearAccessToken(){
        accessToken = "";
        delete api.defaults.headers.common['Authorization'];
    },

    async refresh(){
        isRefreshing = true;

        try {
            const refreshResponse = await api.post("/refresh", { withCredentials : true });

            const user = refreshResponse.data.user;

            processQueue(null, user);
            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false
        }
    }
}

const checkIfUrlShouldNotBeRefreshed = (url) => {
    if (url.includes('/refresh')) {
        return false;
    }
    if (url.includes('/login')) {
        return false;
    }
    if (url.includes('/login-link-request')) {
        return false;
    }
    if (url.includes('/register')) {
        return false;
    }
    if (url.includes('/complete-registration')) {
        return false;
    }
}

export const refreshResponse = api.interceptors.response.use((response) => {
    if (response.status === 200){ 
        return response;
    }
    }, async function onRejected(error){
        const originalRequest = error.config;
        
        const retry = checkIfUrlShouldNotBeRefreshed(originalRequest.url)
        if (!retry){
            return Promise.reject(error);
        }

        if (error.status !== 200){
            try{
                await authApi.refresh();
                return api(originalRequest);
            }
            catch {
                return Promise.reject(error);
            }
        }
    }
);


// async function refresh(error){
//     const originalRequest = error.config;
//         if (error.response?.status === 401 && !originalRequest._retry) {
//             originalRequest._retry = true;

//             if (isRefreshing) {
//                 return new Promise((resolve: (value: AxiosResponse) => void, reject) => {
//                     failedQueue.push({ resolve, reject });
//                   }).then(() => api(originalRequest));
//             }

//             isRefreshing = true;

//             try {
//                 const refreshResponse = await axios.post(
//                     '/refresh',
//                     {},
//                     { withCredentials : true }
//                 );

//                 const user = refreshResponse.data.user;

//                 processQueue(null, user);
//                 return api(originalRequest)
//             } catch (refreshError) {
//                 processQueue(refreshError, null);
//                 return Promise.reject(refreshError);
//             } finally {
//                 isRefreshing = false
//             }
//         }
//     return Promise.reject(error);
// }


export const updateUserLearnedMoves = async (learnedMovesDto) => {
    const response = await api.post('/update-learned-moves', learnedMovesDto, { withCredentials : true });
    return response.data;
}


export const addUserLearnedMove = async (moveId, martialArtId) => {
    const response = await api.post('/add-learned-move', {moveId: moveId, martialArtId: martialArtId}, { withCredentials : true });
    return response.data;
}


export const fetchReviews = async () => {
    const response = await api.get('/get-user-reviews', { withCredentials : true });
    return response.data;
}


export const logout = async () => {
    await api.post('/logout', { withCredentials : true });
}


export default api;
