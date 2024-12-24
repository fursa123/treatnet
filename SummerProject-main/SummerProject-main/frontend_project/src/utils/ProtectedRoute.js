import React from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import Cookies from "js-cookie";
import Profile from "../router/PtPages/Profile";

const ProtectedRoute = ({element, ...rest}) => {
    const patientAllowedPath = ['/profile', '/patient-home', '/contact-dr','/patient-calendar']
    const drAllowedPath = ['/drprofile', '/drhome', '/detailed-pt','/findpatient','/calendar']
    const nuAllowedPath = ['/nuprofile', '/nutritionist-pt', '/nutritionist-home', '/nutritionist-findpatient']
    const allAllowedPath = ['/message']

    let location = useLocation();
    const isAuthenticated = !!Cookies.get('token'); // 检查是否有token
    const isStaffCookie = Cookies.get('isStaff');
    const staffStatus = parseInt(isStaffCookie, 10);
    if (isAuthenticated) {
        if (patientAllowedPath.includes(location.pathname) && staffStatus === 0) {
            return element;
        } else if (drAllowedPath.includes(location.pathname) && staffStatus === 1) {
            return element;
        } else if (nuAllowedPath.includes(location.pathname) && staffStatus === 2) {
            return element;
        } else if (allAllowedPath.includes(location.pathname)) {
            return element;
        } else {
            return <Navigate to={'/'}/>
        }
    } else {
        return <Navigate to="/login"/>
    }
};

export default ProtectedRoute;

