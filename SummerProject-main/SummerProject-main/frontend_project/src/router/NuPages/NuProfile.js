import NavBar from "../../component/NavBar";
import React, {useState, useEffect} from "react";
import {getDrProfile} from "../../api/Doctor";
import Cookies from "js-cookie";
import request from '../../utils/request';

function NuProfile() {
    const [showForm, setShowForm] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);

    const [experiencedYears, setExperiencedYears] = useState(0);
    const [qualification, setQualification] = useState('')

    const [userData, setUserData] = useState({})
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const response = await request.post(`/patient/nutritionist/update_nutritionist_profile/${token}/`, {
                experience_years: experiencedYears,
                qualification
            });
            if (response.status === 200) {
                setUserData(response.data);
                setShowForm(false);
                window.location.href = '/nuprofile';
            } else {
                console.error('Failed to update profile information:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating profile information:', error);
        }
    };

    const handleContactSave = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const response = await request.post(`/patient/patient/update_contact/${token}/`, {
                email,
                phone_number: phoneNumber
            });
            if (response.status === 200) {
                setUserData(response.data);
                setShowContactForm(false);
                window.location.href = '/nuprofile';
            } else {
                console.error('Failed to update contact information:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating contact information:', error);
        }
    };

    const handleProfile = (e) => {
        let token = Cookies.get('token');
        getDrProfile('/patient/nutritionist/get_nutritionist_profile/'+token+'/',{}).then(res=>{
            let nutritionistInfo = res.data.nutritionist_profile
            setExperiencedYears(nutritionistInfo.Experience_years)
            setQualification(nutritionistInfo.Qualification)
            setEmail(nutritionistInfo.Email)
            setPhoneNumber(nutritionistInfo.Phone_Number)
            setUserData(nutritionistInfo)
        })
    }

    return (
        <div onLoad={handleProfile}>
            <NavBar/>
            <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and settings.</p>
                        </div>
                        <div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                {showForm ? 'Cancel' : 'Edit Personal Info'}
                            </button>
                            <button
                                onClick={() => setShowContactForm(!showContactForm)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ml-2"
                            >
                                {showContactForm ? 'Cancel' : 'Edit Contact Info'}
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200">
                        {showForm ? (
                            <form className="px-4 py-5 sm:px-6" onSubmit={handleSave}>
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="height"
                                               className="block text-sm font-medium text-gray-700">Experience
                                            Years</label>
                                        <input
                                            type="text"
                                            name="experiencedYears"
                                            id="experiencedYears"
                                            value={experiencedYears}
                                            onChange={(e) => setExperiencedYears(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="weight"
                                               className="block text-sm font-medium text-gray-700">Qualification</label>
                                        <input
                                            type="text"
                                            name="weight"
                                            id="weight"
                                            value={qualification}
                                            onChange={(e) => setQualification(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="px-4 py-5 sm:px-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Username</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Username}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Forenames}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Surname}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Email}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Phone_Number}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Experienced Years</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Experience_years}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Qualification</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Qualification}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userData?.Gender}</p>
                                    </div>

                                </div>
                            </div>
                        )}
                        {showContactForm && (
                            <form className="px-4 py-5 sm:px-6" onSubmit={handleContactSave}>
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="email"
                                               className="block text-sm font-medium text-gray-700">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="phoneNumber"
                                               className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NuProfile;