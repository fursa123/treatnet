import request from "../utils/request";

export function findPatientsByConditions(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function findPatientsRegisteredThisDay(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getPatientDetailedInfo(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getDrProfile(url, data) {
    return request({
        url:url,
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function submitPatientDiagnosis(url, data) {
    return request({
        url:url,
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function addAvailableTime(data, token) {
    return request({
        url:'patient/doctor/add_availability/'+token+'/',
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getNormalWorkingTime(data, token) {
    return request({
        url:'patient/doctor/get_doctor_working_time/'+token+'/',
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function getComingMeetings(url, data) {
    return request({
        url:url,
        method: 'Get',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}

export function get_doctor_profile_patient_byId(url,data) {
    return request({
        url:url,
        method: 'Post',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}