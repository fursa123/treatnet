import request from '../utils/request'

export function getUsername(url, data) {
    return request({
        url:url,
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getUserAppointment(data, token) {
    return request({
        url:'/patient/user/get_user_appointments/'+token+'/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getUserProfile(data,token){
    return request({
        url:'/patient/user/profile/'+token+'/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getChannelId(data, token){
    return request({
        url:'/patient/user/get_channel_id/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getAllTargetMessage(data, token){
    return request({
        url:'/patient/user/get_target_message/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getContactorList(data, token){
    return request({
        url:'/patient/user/get_contactors/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function startContactUser(data, token){
    return request({
        url:'/patient/user/start_contact_user/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function addFeedback(data){
    return request({
        url:'/patient/user/give_feedback/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function addAvatar(data,token){
    return request({
        url:'/patient/user/add_avatar/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getAvatar(data,token){
    return request({
        url:'/patient/user/get_avatar/'+token+'/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}