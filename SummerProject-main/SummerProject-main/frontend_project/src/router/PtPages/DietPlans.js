import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InfoBox from '../../component/InfoBox';
import Cookies from 'js-cookie';
import NavBar from '../../component/NavBar';
import BackButton from '../../component/BackButton';
import Footer from '../../component/Footer';
import request from '../../utils/request';
import { getPtDietPlan, getPtProfile, handleSaveDietPlan, handleSaveDietaryPreferences } from "../../api/Patient";
import Heading from '../../component/Heading';
import Loading from '../../component/Loading';

const DietPlans = () => {
    const [userData, setUserData] = useState('');
    const [dietPlansJson, setDietPlansJson] = useState([]);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [currentWeek, setCurrentWeek] = useState(0);
    const [loading, setLoading] = useState(true); // loading state
    const [dietPlans, setDietPlans] = useState([]);
    const [ifFirstRender, SetIfFirstRender] = useState(true);
    const [ifHidden, setIfHidden] = useState(0);
    const [dietaryPreferences, setDietaryPreferences] = useState({
        vegetarian: false,
        vegan: false,
        pescatarian: false,
        halal: false,
        kosher: false,
        glutenFree: false,
        lactoseFree: false,
        other: false,
        otherDetails: ''
    });
    const [medicalHistory, setMedicalHistory] = useState('');
    const [status, setStatus] = useState(-1); // 0: no diagnosis from dr, 1: waiting for input by pt, 2: waiting for approval from nu, 3: show tables

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading
        getPtProfile(token, {}).then(res => {
            if (res.status === 200) {
                setUserData(res.data.patient_profile);
            }
        });
    }, []);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading
        getPtDietPlan(token, {}).then(res => {
            setStatus(res.data.diet_status);
            if (res.status === 200 && res.data.diet_status !== 1) {
                fetchDietPlans();
            }
        });
    }, [userData, status]);

    useEffect(() => {
        if (userData && status !== -1) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 300); // 0.3-second delay
    
            return () => clearTimeout(timer);
        }
    }, [userData, status]);
    
    
    const handleChange = (event) => {
        const { name, type, checked, value } = event.target;

        setDietaryPreferences(prevState => {
            const updatedPreferences = { ...prevState, [name]: type === 'checkbox' ? checked : value };

            if (name === 'vegetarian' && checked) {
                updatedPreferences.vegan = false;
                updatedPreferences.pescatarian = false;
            } else if (name === 'vegan' && checked) {
                updatedPreferences.vegetarian = false;
                updatedPreferences.pescatarian = false;
            } else if (name === 'pescatarian' && checked) {
                updatedPreferences.vegetarian = false;
                updatedPreferences.vegan = false;
            }

            return updatedPreferences;
        });
    };

    const handleMedicalHistoryChange = (event) => {
        setMedicalHistory(event.target.value);
    };

    const fetchHeightWeightHistory = async () => {
        const token = Cookies.get('token');
        try {
            const historyResponse = await request.get(`/patient/patient/height_weight_history/${token}/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (historyResponse.status === 200) {
                const sortedData = historyResponse.data.sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));
                if (sortedData.length > 0) {
                    const latestEntry = sortedData[0];
                    setHeight(latestEntry.height || '');
                    setWeight(latestEntry.weight || '');
                }
            } else {
                console.error('Failed to fetch height and weight history:', historyResponse.statusText);
            }
        } catch (error) {
            console.error('Error fetching height and weight history:', error);
        }
    };

    useEffect(() => {
        fetchHeightWeightHistory();
    }, []);

    const validateDietPlans = (plans) => {
        if (plans.length !== 4) return false; // Ensure we have 4 weeks
        for (const plan of plans) {
            try {
                const parsedPlan = JSON.parse(plan);
                const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                const meals = ["Breakfast", "Snack", "Lunch", "Snack", "Dinner"];
                for (const day of days) {
                    if (!parsedPlan[day]) return false; // Check if day is present
                    for (const meal of meals) {
                        if (!parsedPlan[day][meal] || parsedPlan[day][meal].trim() === "") return false; // Check if meal is present and not empty
                    }
                }
            } catch (e) {
                return false; // JSON parsing failed
            }
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (loading) return;
        let validPlans = false;
        let newDietPlansJson = [];

        while (!validPlans) {
            try {
                const responsePromises = [0, 1, 2, 3].map(week => {
                    const requestData = {
                        model: "gpt-3.5-turbo",
                        messages: [{
                            "role": "user",
                            "content": `Provide a structured weekly diet plan for the following symptoms: ${userData.diagnosis}. Format the diet plan in a JSON object with columns for Monday to Sunday and rows for Breakfast, Snack, Lunch, Snack, and Dinner. Ensure the object formatting is consistent across all weeks, with the same structure and style. Dietary preferences: ${JSON.stringify(dietaryPreferences)}, allergy:${userData.allergies} and ${userData.other_allergies}, age:${userData.dob}, height: ${height} cm, weight: ${weight} kg, medical history: ${medicalHistory}`
                        }]
                    };

                    return axios.post('https://api.openai.com/v1/chat/completions', requestData, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer sk-proj-Vk0woAFAaoQH5sr6Ilk8T3BlbkFJPXSiuAbPD52FLsKkvEHO`
                        }
                    });
                });

                const responses = await Promise.all(responsePromises);
                newDietPlansJson = responses.map(response => response.data.choices[0].message.content.trim());
                validPlans = validateDietPlans(newDietPlansJson);
                if (validPlans) {
                    setDietPlansJson(newDietPlansJson);
                } else {
                    newDietPlansJson = [];
                }
            } catch (error) {
                console.error("Error fetching data from OpenAI:", error.response?.data || error.message);
                setLoading(false);
                return; // Exit on error
            }
        }

        try {
            let token = Cookies.get('token');
            await handleSaveDietaryPreferences('/patient/patient/save_dietary_preferences/' + token + '/', dietaryPreferences, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error("Error saving dietary preferences:", error.response?.data || error.message);
            setLoading(false);
            return;
        }

        setLoading(false);
        setDietPlansJson(newDietPlansJson);
        let token = Cookies.get('token');
        handleSaveDietPlan('/patient/patient/save_diet_plan/' + token + '/', {
            'dietPlansJson': newDietPlansJson,
            "dietReq": dietaryPreferences
        }).then(res => {
            setStatus(2); // Set status to 2 to indicate waiting for approval from nutritionist
        }).catch(error => {
            console.error("Error saving diet plan:", error.response?.data || error.message);
        });
    };

    const nextWeek = () => {
        if (currentWeek < 3) {
            setCurrentWeek(currentWeek + 1);
        }
    };

    const prevWeek = () => {
        if (currentWeek > 0) {
            setCurrentWeek(currentWeek - 1);
        }
    };

    const goNext = (e) => {
        e.preventDefault();
        setIfHidden(ifHidden + 1);
    };

    const goPrev = (e) => {
        e.preventDefault();
        setIfHidden(ifHidden - 1);
    };

    const fetchDietPlans = async () => {
        try {
            const response = await request.get(`/patient/nutritionist/diet-plans/?week_num=${currentWeek}&username=${userData.username}`);
            if (response.status === 200) {
                setDietPlans(response.data);
            } else {
                console.error('Failed to fetch diet plans:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching diet plans:', error);
        }
    };

    useEffect(() => {
        if (status === 3) {
            fetchDietPlans();
        }
    }, [currentWeek, status]);

    if (loading) {
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
            <Heading 
            title={`Meal Plans for ${userData.forename} ${userData.surname}`}
            subtitle={status === 0 ? 'You need to be diagnosed by a doctor first.' : ''}
            />
            <BackButton to="/patient-home" />
            <div className="bg-white">
                <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                    {status === 1 &&
                        (
                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                <div hidden={ifHidden !== 0}>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Please select your dietary preferences
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="vegetarian"
                                                checked={dietaryPreferences.vegetarian}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Vegetarian</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="vegan"
                                                checked={dietaryPreferences.vegan}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Vegan</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="pescatarian"
                                                checked={dietaryPreferences.pescatarian}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Pescatarian</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="halal"
                                                checked={dietaryPreferences.halal}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Halal</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="kosher"
                                                checked={dietaryPreferences.kosher}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Kosher</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="glutenFree"
                                                checked={dietaryPreferences.glutenFree}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Gluten-Free</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                name="lactoseFree"
                                                checked={dietaryPreferences.lactoseFree}
                                                onChange={handleChange}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2">Lactose-Free</span>
                                        </label>
                                    </div>
                                </div>

                                <div hidden={ifHidden !== 1}>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Any other dietary preferences?
                                    </h2>
                                    <h2 className="text-gray-900">
                                            Select the checkbox to enter additional food or cuisine preferences (e.g. prefer Italian cuisine or don't eat peppers).
                                    </h2>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            name="other"
                                            checked={dietaryPreferences.other}
                                            onChange={handleChange}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="ml-2">Other</span>
                                    </label>
                                    {dietaryPreferences.other && (<div>
                                        <textarea
                                            name="otherDetails"
                                            value={dietaryPreferences.otherDetails}
                                            onChange={handleChange}
                                            rows="4"
                                            className="form-textarea mt-1 block w-full"
                                            placeholder="Please specify other dietary preferences"
                                        /></div>
                                    )}
                                </div>

                                <div hidden={ifHidden !== 2}>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Relevant Medical History
                                    </h2>
                                    <textarea
                                        name="medicalHistory"
                                        value={medicalHistory}
                                        onChange={handleMedicalHistoryChange}
                                        rows="4"
                                        className="form-textarea mt-1 block w-full"
                                        placeholder="Please specify any relevant medical history"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={goPrev}
                                            className={`px-4 py-2 bg-gray-300 text-gray-900 rounded ${ifHidden === 0 ? 'invisible' : ''}`}>Previous
                                    </button>
                                    <button onClick={goNext}
                                            className={`px-4 py-2 bg-blue-600 text-white rounded ${ifHidden === 2 ? 'invisible' : ''}`}>Next
                                    </button>
                                    <button type="submit"
                                            className={`px-4 py-2 bg-green-600 text-white rounded ${ifHidden !== 2 ? 'invisible' : ''}`}>
                                        {loading ? 'Generating...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    {status === 2 && (
                        <div className="text-center mt-4 text-2xl font-bold text-gray-900">
                            Waiting for approval from the nutritionist
                        </div>
                    )}
                    {status === 3 && (
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
                                                    {[...Array(7)].map((_, dayIndex) => {
                                                        const mealPlan = dietPlans.find(plan => plan.week_num === currentWeek && plan.day_num === dayIndex && plan.meal_num === mealIndex);
                                                        return (
                                                            <td className={`px-6 py-4 ${dayIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`} key={dayIndex}>
                                                                {mealPlan && (
                                                                    <div>
                                                                        <p>{mealPlan.meal}</p>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </InfoBox>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default DietPlans;
