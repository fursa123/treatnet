import request from "../utils/request";

export function searchAvailableBooking(url, data) {
    return request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function addAppointment(url, data) {
    return request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function handleSaveDietPlan(url, data) {
    return request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function handleCheckDietPlan(url, data) {
    return request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getPtProfile(token, data) {
    return request({
        url: 'patient/patient/get_patient_profile/' + token + '/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getPtDietPlan(token, data) {
    return request({
        url: 'patient/patient/get_diet_plan/' + token + '/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function submitUnspecifiedSymptom(token, data) {
    return request({
        url: '/patient/patient/add_unspecified_symptoms/' + token + '/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function submitCancerSymptom(token, data, cancerType) {
    return request({
        url: 'patient/patient/get_' + cancerType + '_cancer_answers/' + token + '/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function get_patient_profile_doctor_byId(url, data) {
    return request({
        url: url,
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function handleSaveDietaryPreferences(url, data) {
    return request({
        url: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    });
}