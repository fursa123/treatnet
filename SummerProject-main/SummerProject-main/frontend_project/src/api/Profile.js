import request from '../utils/request';

export function getUserProfile(userId) {
    return request.get(`/api/user/profile/${userId}/`, {
        headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
}