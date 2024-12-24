import React, {useState, useEffect, useRef} from 'react';
import NavBar from "../../component/NavBar";
import request from '../../utils/request';
import Cookies from 'js-cookie';
import Heading from '../../component/Heading';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [userName, setUserName] = useState({forenames: '', surname: ''});
    const [showForm, setShowForm] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [filteredHistoryData, setFilteredHistoryData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filterOption, setFilterOption] = useState('last_day');
    const [allergy, setAllergy] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredAllergies, setFilteredAllergies] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allergyData, setAllergyData] = useState([]);
    const [otherAllergyData, setOtherAllergyData] = useState({otherAllergy: ''});
    const [heightError, setHeightError] = useState('');
    const [weightError, setWeightError] = useState('');
    const [formError, setFormError] = useState('');
    const[dob, setDob] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.error('No user token found in cookies.');
                    window.location.href = '/login';
                    return;
                }

                const profileResponse = await request.get(`/api/user/profile/${token}/`);
                if (profileResponse.status === 200) {
                    setUserData(profileResponse.data);
                    setEmail(profileResponse.data.email);
                    setPhoneNumber(profileResponse.data.phone_number);
                } else {
                    console.error('Failed to fetch user profile:', profileResponse.statusText);
                }

                const userNameResponse = await request.get(`/patient/patient/get_user_name/${token}`);
                if (userNameResponse.status === 200) {
                    const patientName = userNameResponse.data;
                    setUserName(patientName);
                } else {
                    console.error('Failed to fetch user name:', userNameResponse.statusText);
                }

                const dobResponse = await request.get(`/patient/patient/get_patient_dob/${token}/`);
            if (dobResponse.status === 200) {
                setDob(dobResponse.data.dob);
            } else {
                console.error('Failed to fetch date of birth:', dobResponse.statusText);
            }

                const historyResponse = await request.get(`/patient/patient/height_weight_history/${token}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (historyResponse.status === 200) {
                    const sortedData = historyResponse.data.sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));
                    setHistoryData(sortedData);
                    filterHistoryData(sortedData, filterOption);
                    if (sortedData.length > 0) {
                        const latestEntry = sortedData[0];
                        setHeight(latestEntry.height || '');
                        setWeight(latestEntry.weight || '');
                    }
                } else {
                    console.error('Failed to fetch height and weight history:', historyResponse.statusText);
                }

                const allergyResponse = await request.get(`/patient/patient/get_patient_allergy/${token}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (allergyResponse.status === 200) {
                    const allergyData = allergyResponse.data.allergies;
                    setAllergyData(Array.isArray(allergyData) ? allergyData : []);
                    setOtherAllergyData(Array.isArray(allergyResponse.data.other_allergies) ? allergyResponse.data.other_allergies : []);
                } else {
                    console.error('Failed to fetch allergies');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [filterOption]);


    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const response = await request.post(`/patient/patient/add_record/${token}/`, { height, weight });
            if (response.status === 200) {
                setUserData(response.data);
                setShowForm(false);
                window.location.href = '/profile';
            } else {
                console.error('Failed to update user profile:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };
    
    const validateHeight = (value) => {
        const height = parseFloat(value);
        if (height < 50 || height > 300) {
            setHeightError('Please enter a valid height between 50 and 300 cm.');
            return false;
        } else {
            setHeightError('');
            return true;
        }
    };
    
    const validateWeight = (value) => {
        const weight = parseFloat(value);
        if (weight < 3 || weight > 300) {
            setWeightError('Please enter a valid weight between 3 and 300 kg.');
            return false;
        } else {
            setWeightError('');
            return true;
        }
    };
    
    const handleSaveWithValidation = (e) => {
        e.preventDefault();
        const isHeightValid = validateHeight(height);
        const isWeightValid = validateWeight(weight);
    
        if (isHeightValid && isWeightValid) {
            setFormError('');
            handleSave(e);
        } else {
            setFormError('Please enter realistic values for height and weight.');
        }
    };
    

    const handleContactSave = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            const response = await request.post(`/api/patient/update_contact/${token}/`, {
                email,
                phone_number: phoneNumber
            });
            if (response.status === 200) {
                setUserData(response.data);
                setShowContactForm(false);
                window.location.href = '/profile';
            } else {
                console.error('Failed to update contact information:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating contact information:', error);
        }
    };

    const handleFilterChange = (event) => {
        const option = event.target.value;
        setFilterOption(option);
        filterHistoryData(historyData, option);
    };

    const filterHistoryData = (data, option) => {
        let filteredData = [];
        const currentDate = new Date();
        switch (option) {
            case 'last_7_days':
                filteredData = data.filter(record => isWithinDays(record.date_changed, currentDate, 7));
                break;
            case 'last_100_days':
                filteredData = data.filter(record => isWithinDays(record.date_changed, currentDate, 100));
                break;
            case 'last_year':
                filteredData = data.filter(record => isWithinDays(record.date_changed, currentDate, 365));
                break;
            default:
                filteredData = data;
                break;
        }
        setFilteredHistoryData(filteredData);
        setCurrentPage(1);
    };

    const isWithinDays = (date1, date2, days) => {
        const diffTime = Math.abs(date2 - new Date(date1));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= days;
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistoryData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredHistoryData.length / itemsPerPage);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        try {
            const response = await request.post('/patient/patient/search_allergy/', {query_word: query}, {});
            if (response.status === 200) {
                setFilteredAllergies(response.data);
                setShowDropdown(true); // Show dropdown when allergies are fetched
            } else {
                console.error('Failed to fetch filtered allergies:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filtered allergies:', error);
        }
    };

    const handleAllergySelect = async (allergyId, allergy_name) => {
        try {
            const token = Cookies.get('token');
            const response = await request.post(`/patient/patient/add_patient_allergy/${token}/`, {allergy: allergyId});
            if (response.status === 200) {
                window.location.href = '/profile';
                // Perform any necessary UI updates or state changes
            } else {
                console.error('Failed to add allergy:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding allergy:', error);
        } finally {
            setShowDropdown(false); // Hide dropdown after selecting an allergy
        }
    };

    const resultRef = useRef()

    // menu disappear when click other side
    const handleClickOutside = (e) => {
        if (resultRef.current.contains(e.target) === false) {
            setShowDropdown(false)
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])


    const handleOtherAllergySave = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');

            // Check if otherAllergyData.otherAllergy is not empty
            if (!otherAllergyData.otherAllergy.trim()) {
                console.error('Other allergy cannot be empty.');
                // Handle the empty field case as per your UI/UX requirements
                return;
            }

            // Make the API call only if otherAllergyData.otherAllergy is valid
            const response = await request.post(`/patient/patient/add_patient_other_allergy/${token}/`, {
                other_allergy: otherAllergyData.otherAllergy.trim()
            });

            if (response.status === 200) {
                // Perform any necessary UI updates or state changes
            } else {

                console.error('Failed to add other allergy:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding other allergy:', error);
        } finally {
            window.location.href = '/profile';
            // Clear the form or reset necessary state
        }
    };


    return (
        <div>
            <NavBar/>
            <Heading title="Your Profile"/>
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
        {height && weight ? (showForm ? 'Cancel' : 'Edit Height/Weight') : (showForm ? 'Cancel' : 'Add Height/Weight')}
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
                            <form className="px-4 py-5 sm:px-6" onSubmit={handleSaveWithValidation}>
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="height"
                                               className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                        <input
                                            type="text"
                                            name="height"
                                            id="height"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                        {heightError && <p className="text-red-500 text-xs mt-1">{heightError}</p>}
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label htmlFor="weight"
                                               className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                        <input
                                            type="text"
                                            name="weight"
                                            id="weight"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                        />
                                         {weightError && <p className="text-red-500 text-xs mt-1">{weightError}</p>}
                                    </div>
                                </div>
                                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>} {/* Display form error message */}
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
                                        <p className="mt-1 text-sm text-gray-900">{userData?.username}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userName?.forenames || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                                        <p className="mt-1 text-sm text-gray-900">{userName?.surname || 'N/A'}</p>
                                    </div>
                                    <div>
                                    <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                                    <p className="mt-1 text-sm text-gray-900">{dob || 'N/A'}</p>
                                </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="mt-1 text-sm text-gray-900">{email}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                        <p className="mt-1 text-sm text-gray-900">{phoneNumber}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Height (cm)</h4>
                                        <p className="mt-1 text-sm text-gray-900">{height || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Weight (kg)</h4>
                                        <p className="mt-1 text-sm text-gray-900">{weight || 'N/A'}</p>
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


            <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Allergies</h3>
            <div className="mt-2 flex flex-wrap gap-2">
                {/* Mapping over allergyData assuming it's always an array */}
                {allergyData.map((allergy, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full"
                    >
                        {allergy}
                    </span>
                ))}
                {/* Check if otherAllergyData is an array before mapping */}
                {Array.isArray(otherAllergyData) && otherAllergyData.map((data, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full"
                    >
                        {data.otherAllergy}
                    </span>
                ))}
                {/* Handle the case where otherAllergyData is not an array */}
                {!Array.isArray(otherAllergyData) && !otherAllergyData.otherAllergy && (
                    <span
                        className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full">
                        Error: Other allergies data is not available.
                    </span>
                )}
            </div>
        </div>
    </div>
</div>

{/* Allergy Search/Select Box */}
<div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8 relative" ref={resultRef}>
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Allergy Search</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Search and select allergies. Click on an allergy to add it to your list.
            </p>
            <input
                type="text"
                placeholder="Search allergies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="mt-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
            />
            {/* Dropdown menu or search results */}
            {filteredAllergies.length > 0 && showDropdown && (
                <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 absolute bg-white w-full shadow-lg z-10 top-full left-0">
                    {filteredAllergies.map((allergy) => (
                        <li
                            key={allergy.id}
                            onClick={() => handleAllergySelect(allergy.id, allergy.allergy_name)}
                            className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                            style={{minWidth: '100%'}} // Adjusted style for minimum width
                        >
                            {allergy.allergy_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
</div>

{/* Add Other Allergy Form */}
<div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Add Other Allergy</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                If you don't find your allergy in the dropdown menu, please type it out and press submit.
            </p>
            <form onSubmit={handleOtherAllergySave} className="mt-4">
                <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="otherAllergy" className="block text-sm font-medium text-gray-700">
                            Other Allergy
                        </label>
                        <input
                            type="text"
                            id="otherAllergy"
                            name="otherAllergy"
                            value={otherAllergyData.otherAllergy || ''}
                            onChange={(e) => setOtherAllergyData({
                                ...otherAllergyData,
                                otherAllergy: e.target.value
                            })}
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Add Allergy
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>


            <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Height and Weight History</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Filter by:</p>
                        <select
                            value={filterOption}
                            onChange={handleFilterChange}
                            className="mt-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="last_day">Last 7 Days</option>
                            <option value="last_100_days">Last 100 Days</option>
                            <option value="last_year">Last Year</option>
                            <option value="all_time">All Time</option>
                        </select>
                    </div>
                    <div className="border-t border-gray-200">
                        <ul role="list" className="divide-y divide-gray-200">
                            {currentItems.map((item, index) => (
                                <li key={index} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-indigo-600 truncate">
                                            {new Date(item.date_changed).toLocaleString()}
                                        </div>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Height: {item.height}, Weight: {item.weight}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4 flex justify-between items-center px-4 py-3 sm:px-6">
                        {currentPage !== 1 && (
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Previous
                            </button>
                        )}
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                        {currentPage !== totalPages && (
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
