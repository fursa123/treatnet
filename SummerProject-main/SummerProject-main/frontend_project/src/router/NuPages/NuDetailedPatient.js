import React, { useState, useEffect } from 'react';
import NavBar from "../../component/NavBar";
import '../../css/general.css';
import InfoBox from "../../component/InfoBox";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getPatientDetailedInfo } from "../../api/Doctor";
import request from '../../utils/request';
import Footer from '../../component/Footer'
import Loading from '../../component/Loading';
import {startContactUser} from "../../api/Home";
import Heading from '../../component/Heading';

function NuPatient() {
    const [userData, setUserData] = useState({});
    const [chart, setChart] = useState('');
    const [is_authenticated, setIs_authenticated] = useState(false);
    const [dietaryPreferences, setDietaryPreferences] = useState({});
    const [dietPlans, setDietPlans] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(0);
    const [username, setUsername] = useState('');
    const [approvalStatus, setApprovalStatus] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [newMealText, setNewMealText] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();
    const nav = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        loadInfo();
    }, []);

    useEffect(() => {
        if (username) {
            fetchDietPlans();
            fetchApprovalStatus();
            fetchDietaryPreferences();
        }
    }, [currentWeek, username]);

    const contactUser = () => {
        startContactUser({'target_username':userData.username},Cookies.get('token')).then(res=>{
            if(res.status===200){
                nav('/message')
            }
        })
    }

    const loadInfo = async () => {
        setIsLoading(true); // Start loading
        try {
            const queryParams = new URLSearchParams(location.search);
            const username = queryParams.get('username');
            setUsername(username);
            let token = Cookies.get('token');
            const res = await getPatientDetailedInfo('patient/doctor/get_patient_information/' + token + '/', { 'username': username });
            if (res.status === 200) {
                setUserData(res.data.patient_information);
                setChart(res.data.chart);
                setIs_authenticated(true);
            } else if (res.status === 400) {
                setIs_authenticated(false);
            } else if (res.status === 404) {
                nav('/404')
            }
        } catch (error) {
            console.error('Error loading information:', error);
            setIs_authenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDietaryPreferences = async () => {
        try {
            const response = await request.get(`/patient/nutritionist/dietary_preferences/?username=${username}`);
            if (response.status === 200) {
                setDietaryPreferences(response.data);
            } else {
                console.error('Failed to fetch dietary preferences:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching dietary preferences:', error);
        }
    };

    const capitaliseName = (name) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };


    const fetchDietPlans = async () => {
        try {
            const response = await request.get(`/patient/nutritionist/diet-plans/?week_num=${currentWeek}&username=${username}`);
            if (response.status === 200) {
                setDietPlans(response.data);
            } else {
                console.error('Failed to fetch diet plans:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching diet plans:', error);
        }
    };

    const fetchApprovalStatus = async () => {
        try {
            const response = await request.get(`/patient/nutritionist/get_approval_status/?username=${username}`);
            if (response.status === 200) {
                setApprovalStatus(response.data.approval_status);
            } else {
                console.error('Failed to fetch approval status:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching approval status:', error);
        }
    };

    const approveDietPlan = async () => {
        try {
            const response = await request.post('/patient/nutritionist/approve-diet-plan/', {
                week_num: currentWeek,
                username: username
            });
            if (response.status === 200) {
                fetchDietPlans();
                fetchApprovalStatus();
                alert('Successfully Approved Diet Plan');
            } else {
                console.error('Failed to approve diet plan:', response.statusText);
            }
        } catch (error) {
            console.error('Error approving diet plan:', error);
        }
    };

    const prevWeek = () => {
        setCurrentWeek(currentWeek > 0 ? currentWeek - 1 : 0);
    };

    const nextWeek = () => {
        setCurrentWeek(currentWeek < 3 ? currentWeek + 1 : 3);
    };

    const openModal = (plan) => {
        setCurrentPlan(plan);
        setNewMealText(plan.meal);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPlan(null);
        setNewMealText('');
    };

    const handleMealChange = (e) => {
        setNewMealText(e.target.value);
    };

    const submitMealChange = async () => {
        try {
            const response = await request.post('/patient/nutritionist/update-meal/', {
                id: currentPlan.id,
                meal: newMealText
            });
            if (response.status === 200) {
                fetchDietPlans();
                closeModal();
            } else {
                console.error('Failed to update meal:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating meal:', error);
        }
    };

    const renderDietaryPreferences = () => {
        const preferences = [
            { key: 'vegetarian', label: 'Vegetarian' },
            { key: 'vegan', label: 'Vegan' },
            { key: 'pescatarian', label: 'Pescatarian' },
            { key: 'halal', label: 'Halal' },
            { key: 'kosher', label: 'Kosher' },
            { key: 'glutenFree', label: 'Gluten Free' },
            { key: 'lactoseFree', label: 'Lactose Free' }
        ];

        const allFalse = preferences.every(pref => !dietaryPreferences[pref.key]);
    
        if (allFalse && !dietaryPreferences.other) {
            return <p>No preferences</p>;
        }
     
        return (
            <>
                {preferences
                    .filter(pref => dietaryPreferences[pref.key])
                    .map(pref => (
                        <div key={pref.key}>
                            <p>{pref.label}</p>
                        </div>
                    ))}
                {dietaryPreferences.other && dietaryPreferences.otherDetails && (
                    <div>
                        <br></br>
                        <h2 className="intext">Additional preferences: </h2>
                        <p>{dietaryPreferences.otherDetails}</p>
                    </div>
                )}
            </>
        );
    };

    if (isLoading) {
        return (
            <div>
                <NavBar />
                <Loading />
            </div>

        );
    }

    return (
        <div>
            <NavBar />
            <Heading title={`Patient: ${capitaliseName(userData.forename)} ${capitaliseName(userData.surname)}`} />
            <InfoBox title="Patient Details" backgroundColor="blue-500">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                        <p className="para">{capitaliseName(userData.forename)}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                        <p className="para">{capitaliseName(userData.surname)}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="para">{userData.email}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                        <p className="para">{userData.phone_Number}</p>
                    </div>
                </div>
                <button type="button" onClick={contactUser}
                                        className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800">
                                    Contact Patient
                                </button>
            </InfoBox>

            <InfoBox title="Requirements for the meal plan" backgroundColor="blue-500">
                <p className="para">{renderDietaryPreferences()}</p>
            </InfoBox>

            <InfoBox title="Generated Meal Plan" backgroundColor="blue-500">
                <div id="tableContainer">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            className={`px-4 py-2 rounded-md ${currentWeek === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                            onClick={prevWeek}
                            disabled={currentWeek === 0}
                        >
                            Previous Week
                        </button>
                        <h2 className="text-2xl font-bold">Week {currentWeek + 1}</h2>
                        <button
                            className={`px-4 py-2 rounded-md ${currentWeek === 3 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                            onClick={nextWeek}
                            disabled={currentWeek === 3}
                        >
                            Next Week
                        </button>
                    </div>

                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3"></th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Monday</th>
                                    <th scope="col" className="px-6 py-3">Tuesday</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Wednesday</th>
                                    <th scope="col" className="px-6 py-3">Thursday</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Friday</th>
                                    <th scope="col" className="px-6 py-3">Saturday</th>
                                    <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Sunday</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Breakfast', 'Snack', 'Lunch', 'Snack', 'Dinner'].map((mealType, mealIndex) => (
                                    <tr className="border-b border-gray-200 dark:border-gray-700" key={mealType}>
                                        <th scope="row" className={`px-6 py-4 ${mealIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>{mealType}</th>
                                        {[...Array(7)].map((_, dayIndex) => (
                                            <td className={`px-6 py-4 ${dayIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`} key={dayIndex}>
                                                {dietPlans
                                                    .filter(plan => plan.week_num === currentWeek && plan.day_num === dayIndex && plan.meal_num === mealIndex)
                                                    .map(plan => (
                                                        <div key={plan.id}>
                                                            <p>{plan.meal}</p>
                                                            <button className="text-blue-700" onClick={() => openModal(plan)}>edit</button>
                                                        </div>
                                                    ))}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!approvalStatus && (
                        <button
                            className="approval-button bg-blue-600 text-white px-4 py-2 rounded mt-4"
                            onClick={approveDietPlan}
                        >
                            Approve Meal Plan
                        </button>
                    )}
                </div>
            </InfoBox>

            {isModalOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h2 className="text-xl mb-4">Edit Meal</h2>
                        <textarea
                            className="w-full p-2 border rounded mb-4"
                            value={newMealText}
                            onChange={handleMealChange}
                        />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={submitMealChange}>
                            Save
                        </button>
                        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}

export default NuPatient;

