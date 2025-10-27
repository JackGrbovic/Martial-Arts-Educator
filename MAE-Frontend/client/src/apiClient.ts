import { resolve } from 'path';
import axios, { AxiosResponse } from 'axios';


export const api = axios.create({
    baseURL: 'http://localhost:5240/api/mae',
    withCredentials: true,
  });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, user = null) => {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(user)))
    failedQueue = [];
};

export const refreshResponse = api.interceptors.request.use(
    response => response,
    async error => {
        return refresh(error.response)
    }
);

//make sure this works in tandem with the above
async function refresh(error){
    const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve: (value: AxiosResponse) => void, reject) => {
                    failedQueue.push({ resolve, reject });
                  }).then(() => api(originalRequest));
            }

            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    '/refresh',
                    {},
                    { withCredentials : true }
                );

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
    return Promise.reject(error);
}

export const updateUserLearnedMoves = async (learnedMovesDto) => {
        const response = await api.post('/update-learned-moves', learnedMovesDto, { withCredentials : true });
        return response.data;
}

export const addUserLearnedMove = async (moveId, martialArtId) => {
    const response = await api.post('/add-learned-move', {moveId, martialArtId}, { withCredentials : true });
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
