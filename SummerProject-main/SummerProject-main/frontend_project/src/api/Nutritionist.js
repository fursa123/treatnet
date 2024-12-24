import request from "../utils/request";

export function getDietPlans(token, username) {
   return request({
       url: `/diet-plans/${token}/`,
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
       },
       data: { username }
   });
}

export function findPatientsWithUnapprovedDietPlans(url, data) {
    return request({
        url: url,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify(data)
    });
}