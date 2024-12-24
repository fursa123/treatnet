import React, { useEffect, useState } from 'react';
import logo from '../static/savoirlogo.png';
import { doRegister } from '../api/Register';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import request from '../utils/request';

function Register() {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
      
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone_number, setPhone_number] = useState('');
    const [birthday, setBirthday] = useState('');
    const [password, setPassword] = useState('');
    const [rep_password, setRep_password] = useState('');
    const [forenames, setForenames] = useState('');
    const [surname, setSurname] = useState('');
    const [gender, setGender] = useState('');
    const [errors, setErrors] = useState([]);

    const navigate = useNavigate();

    const validateFields = () => {
        const newErrors = [];
        if (!username) newErrors.push('Username is required');
        if (!email) newErrors.push('Email is required');
        if (!phone_number) newErrors.push('Phone number is required');
        if (!birthday) newErrors.push('Birthday is required');
        if (!password) newErrors.push('Password is required');
        if (!rep_password) newErrors.push('Repeat password is required');
        if (!forenames) newErrors.push('Forenames are required');
        if (!surname) newErrors.push('Surname is required');
        if (!gender) newErrors.push('Sex is required');
        if (password !== rep_password) newErrors.push('Passwords do not match');
        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const updateUsername = (e) => setUsername(e.target.value);
    const updateEmail = (e) => setEmail(e.target.value);
    const updatePhone_number = (e) => setPhone_number(e.target.value);
    const updateBirthday = (e) => setBirthday(e.target.value);
    const updatePassword = (e) => setPassword(e.target.value);
    const updateRep_password = (e) => setRep_password(e.target.value);
    const updateForenames = (e) => setForenames(e.target.value);
    const updateSurname = (e) => setSurname(e.target.value);

    const [genderOptions, setGenderOptions] = useState([]);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);

    const handleGenderSearchChange = async () => {
        try {
            const response = await request.get('/patient/user/search_gender/');
            if (response.status === 200) {
                setGenderOptions(response.data.data);
                setShowGenderDropdown(true);
            } else {
                console.error('Failed to fetch genders:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching genders:', error);
        }
    };

    const handleGenderSuggestionClick = (suggestion) => {
        setGender(suggestion);
        setGenderOptions([]);
    };

    const handleRegister = async () => {
        if (!validateFields()) return;

        try {
            const res = await doRegister('patient/patient/register/', {
                username, email, phone_number, birthday, password, forenames, surname, gender, 'is_staff': 0
            });

            if (res.status === 200) {
                alert('Register success');
                Cookies.set('token', res.data.token, { expires: 1 });
                Cookies.set('isStaff', 0, { expires: 1 });
                navigate('/profile');
            } else if (res.status === 409) {
                setErrors(prevErrors => [...prevErrors, 'Username already registered']);
            } else if (res.status === 400) {
                const msg = res.data.msg;
                const newErrors = [];
                if (msg.includes('email')) newErrors.push('Invalid email format');
                if (msg.includes('phone number')) newErrors.push('Invalid phone number format');
                setErrors(prevErrors => [...prevErrors, ...newErrors]);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrors(prevErrors => [...prevErrors, 'Please ensure your username is unique.']);
        }
    };

    return (
        <div>
            <Link to={'/'}>
                <button type="button"
                        className="absolute z-50 m-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M13 5H1m0 0l4-4m-4 4l4 4"/>
                    </svg>
                    <span className="sr-only">Back to home</span>
                </button>
            </Link>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img className="mx-auto h-10 w-auto scale-150" src={logo} alt="Your Company" />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Register your Patient account</h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        or <br />
                        <a href="/dr_register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a doctor</a>
                        <br />
                        <a href="/nutritionist-register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a nutritionist</a>
                    </p>
                </div>
                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="space-y-6">
                        {errors.length > 0 && (
                            <div className="text-red-500 mb-4">
                                <ul>
                                    {errors.map((error, index) => (
                                        <li key={index}>• {error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="username" name="username" type="username" autoComplete="username" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateUsername} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="email" name="email" type="email" autoComplete="email" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateEmail} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium leading-6 text-gray-900">Phone number <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="phone_number" name="phone_number" type="phone_number" autoComplete="phone_number" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updatePhone_number} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium leading-6 text-gray-900">Birthday <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="dob" name="dob" type="date" autoComplete="dob" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateBirthday} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="forenames" className="block text-sm font-medium leading-6 text-gray-900">Forenames <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="forenames" name="forenames" type="text" autoComplete="forenames" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateForenames} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="surname" className="block text-sm font-medium leading-6 text-gray-900">Surname <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="surname" name="surname" type="text" autoComplete="surname" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateSurname} />
                            </div>
                        </div>
                        <div className="relative">
                            <label htmlFor="sex" className="block text-sm font-medium leading-6 text-gray-900">Sex <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="gender" name="gender" type="text" autoComplete="off" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Select sex..." value={gender} onClick={handleGenderSearchChange} />
                                {genderOptions.length > 0 && showGenderDropdown && (
                                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 absolute bg-white w-full shadow-lg z-10 mt-1">
                                        {genderOptions.map((suggestion) => (
                                            <li key={suggestion.id} className="cursor-pointer hover:bg-gray-100 px-4 py-2" onClick={() => handleGenderSuggestionClick(suggestion)}>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password <span className="text-red-500">*</span></label>
                            </div>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" autoComplete="current-password" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updatePassword} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="rep_password" className="block text-sm font-medium leading-6 text-gray-900">Repeat your password <span className="text-red-500">*</span></label>
                            </div>
                            <div className="mt-2">
                                <input id="rep_password" name="rep_password" type="password" autoComplete="current-password" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateRep_password} />
                            </div>
                        </div>
                        <div>
                            <button onClick={handleRegister} formMethod="post" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Register
                            </button>
                        </div>
                        <p className="mt-10 text-center text-sm text-gray-500">
                            Already been a user?
                            <a href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Log in here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
