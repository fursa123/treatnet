import request from '../utils/request'

export function doRegister(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}