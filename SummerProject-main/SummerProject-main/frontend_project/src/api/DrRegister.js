import request from '../utils/request'
import axios from 'axios';

export function doDrRegister(url, data) {
    return request({
        url:url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    })
}