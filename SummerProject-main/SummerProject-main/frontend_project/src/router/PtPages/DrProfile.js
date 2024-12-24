import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { getDrProfile } from "../../api/Doctor"; // Adjust the path based on your project structure
import Cookies from "js-cookie";
import NavBar from "../../component/NavBar";
import {startContactUser} from "../../api/Home";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function DrProfile() {
    const [userData, setUserData] = useState({});
    const query = useQuery();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const username = query.get('username');
        if (username) {
            let token = Cookies.get('token');
            getDrProfile(`/patient/patient/doctor-profile/${username}/${token}/`).then(res => {
                let doctorInfo = res.data; // Assuming res.data contains all doctor profile information
                setUserData(doctorInfo);
            }).catch(error => {
                console.error('Error fetching doctor profile:', error);
            });
        }
    }, []);

    const handleContactDoctor = () => {
        startContactUser({'target_username':userData.username},Cookies.get('token')).then(res=>{
            if(res.status===200){
                navigate('/message')
            }
        })
    };

    return (
        <div>
            <NavBar />
            <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Doctor Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Professional details.</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.username}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.forename}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.surname}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Experience Years</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.experience_years}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Seniority</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.seniority}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">School</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.school}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Specialty</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.specialty}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                                    <p className="mt-1 text-sm text-gray-900">{userData?.gender}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-5 sm:px-6 flex justify-end">
                            <button
                                onClick={handleContactDoctor}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                                Contact Doctor
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DrProfile;
