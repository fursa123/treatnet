import request from '../utils/request'

export function doNuRegister(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}