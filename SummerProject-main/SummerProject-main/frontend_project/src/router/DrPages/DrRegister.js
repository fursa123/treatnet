import React from 'react';
import logo from '../../static/savoirlogo.png'
import { useEffect, useState } from "react";
import { doDrRegister } from "../../api/DrRegister";
// import { redirect } from "react-router-dom";
import Cookies from "js-cookie";
import request from '../../utils/request';
import {Link, useNavigate} from 'react-router-dom';

function Register() {

    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    // avatar
    const [phone_number, setPhone_number] = useState();
    const [forenames, setForenames] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState();
    const [rep_password, setRep_password] = useState();
    const [is_password_same = true, setIs_password_same] = useState();
    const [is_user_used = false, setIs_user_used] = useState();
    const [isStaff, setIsStaff] = useState(false);

    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    // doctor fields
    const [school, setSchool] = useState();
    const [seniority, setSeniority] = useState();
    const [experience_years, setExperience_years] = useState();

    // for drop down specialty menu
    const [filteredSpecialties, setFilteredSpecialties] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [query_word, setQuery_word] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [speNotFound, setSpeNotFound] = useState(false);

    // for drop down gender menu
    const [genderOptions, setGenderOptions] = useState([]);
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);
    const [gender, setGender] = useState('');

    const updateUsername = (e) => setUsername(e.target.value);
    const updateEmail = (e) => setEmail(e.target.value);
    const updatePhone_number = (e) => setPhone_number(e.target.value);
    const updateForenames = (e) => setForenames(e.target.value);
    const updateSurname = (e) => setSurname(e.target.value);
    const updatePassword = (e) => setPassword(e.target.value);
    const updateRep_password = (e) => setRep_password(e.target.value);

    // doctor updates 
    const updateSchool = (e) => setSchool(e.target.value);
    const updateSeniority = (e) => setSeniority(e.target.value);
    const updateExperience_years = (e) => setExperience_years(e.target.value);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setQuery_word(query);
        setSpecialty(e.target.value);

        try {
            const response = await request.post('/patient/doctor/search_specialty/', { query_word: query }, {});
            if (response.status === 200) {
                setFilteredSpecialties(response.data);
                setShowDropdown(true);
                setSpeNotFound(false);
            } else {
                console.error('Failed to fetch filtered specialties:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching filtered specialties:', error);
        }
    };

    const handleGenderSearchChange = async (e) => {
        const query = e.target.value;
        setQuery_word(query);

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

    const handleSuggestionClick = (suggestion) => {
        setQuery_word(suggestion.specialty_type);
        setSpecialty(suggestion.specialty_type);
        setFilteredSpecialties([]);
    };

    const handleGenderSuggestionClick = (suggestion) => {
        setGender(suggestion);
        setGenderOptions([]);
    };

    const validateFields = () => {
        const newErrors = {};
        if (!username) newErrors.username = 'Username is required';
        if (!email) newErrors.email = 'Email is required';
        if (!phone_number) newErrors.phone_number = 'Phone number is required';
        if (!forenames) newErrors.forenames = 'Forenames are required';
        if (!surname) newErrors.surname = 'Surname is required';
        if (!password) newErrors.password = 'Password is required';
        if (!rep_password) newErrors.rep_password = 'Repeat password is required';
        if (!school) newErrors.school = 'School is required';
        if (!seniority) newErrors.seniority = 'Seniority is required';
        if (!experience_years) newErrors.experience_years = 'Number of Years Experience is required';
        if (!gender) newErrors.gender = 'Gender is required';
        if (!specialty) newErrors.specialty = 'Specialty is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateFields()) return;

        if (password !== rep_password) {
            setIs_password_same(false);
            return;
        } else {
            setIs_password_same(true);
        }

        try {
            const res = await doDrRegister('patient/doctor/register/', {
                username,
                email,
                phone_number,
                password,
                school,
                seniority,
                specialty,
                experience_years,
                forenames,
                surname,
                gender
            });
            if (res.status === 200) {
                // setIfPasswordCorrect(true);
                alert('register success')
                Cookies.set('token', res.data.token, { expires: 1 });
                Cookies.set('isStaff', 1, { expires: 1});
                setTimeout(() => {
                    navigate('/drhome');
                }, 500);
                localStorage.setItem('isStaff', isStaff);
            } else if (res.status === 597) {
                setIs_user_used(true);
            } else if (res.status === 400) {
                if (res.data.msg.includes("Specialty")) {
                    setSpeNotFound(true);
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                            d="M13 5H1m0 0l4-4m-4 4l4 4" />
                    </svg>
                    <span className="sr-only">Back to home</span>
                </button>
            </Link>

            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img className="mx-auto h-10 w-auto scale-150" src={logo} alt="Your Company" />
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Register your Doctor account</h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        or <br />
                        <a href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a patient</a>
                        <br />
                        <a href="/nutritionist-register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a nutritionist</a>
                    </p>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="username" name="username" type="text" autoComplete="username" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateUsername} />
                                {!is_user_used ? null : <div className='text-red-500 pt-2'>Username already registered</div>}
                                {errors.username && <div className='text-red-500 pt-2'>{errors.username}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="email" name="email" type="email" autoComplete="email" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateEmail} />
                                {errors.email && <div className='text-red-500 pt-2'>{errors.email}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium leading-6 text-gray-900">Phone number <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="phone_number" name="phone_number" type="text" autoComplete="phone_number" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updatePhone_number} />
                                {errors.phone_number && <div className='text-red-500 pt-2'>{errors.phone_number}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="forenames" className="block text-sm font-medium leading-6 text-gray-900">Forenames <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="forenames" name="forenames" type="text" autoComplete="forenames" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateForenames} />
                                {errors.forenames && <div className='text-red-500 pt-2'>{errors.forenames}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="surname" className="block text-sm font-medium leading-6 text-gray-900">Surname <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="surname" name="surname" type="text" autoComplete="surname" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateSurname} />
                                {errors.surname && <div className='text-red-500 pt-2'>{errors.surname}</div>}
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">Gender <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="gender" name="gender" type="text" autoComplete="off" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Select gender..." value={gender} onClick={handleGenderSearchChange} />
                                {genderOptions.length > 0 && showGenderDropdown && (
                                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 absolute bg-white w-full shadow-lg z-10 mt-1">
                                        {genderOptions.map((suggestion) => (
                                            <li key={suggestion.id} className="cursor-pointer hover:bg-gray-100 px-4 py-2" onClick={() => handleGenderSuggestionClick(suggestion)}>
                                                {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.gender && <div className='text-red-500 pt-2'>{errors.gender}</div>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password <span className="text-red-500">*</span></label>
                            </div>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" autoComplete="current-password" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updatePassword} />
                                {errors.password && <div className='text-red-500 pt-2'>{errors.password}</div>}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="rep_password" className="block text-sm font-medium leading-6 text-gray-900">Repeat your password <span className="text-red-500">*</span></label>
                            </div>
                            <div className="mt-2">
                                <input id="rep_password" name="rep_password" type="password" autoComplete="current-password" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateRep_password} />
                                {is_password_same ? null : <div className='text-red-500 pt-2'>Password should be the same as above</div>}
                                {errors.rep_password && <div className='text-red-500 pt-2'>{errors.rep_password}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="school" className="block text-sm font-medium leading-6 text-gray-900">School <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="school" name="school" type="text" autoComplete="school" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateSchool} />
                                {errors.school && <div className='text-red-500 pt-2'>{errors.school}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="seniority" className="block text-sm font-medium leading-6 text-gray-900">Seniority <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="seniority" name="seniority" type="text" autoComplete="seniority" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateSeniority} />
                                {errors.seniority && <div className='text-red-500 pt-2'>{errors.seniority}</div>}
                            </div>
                        </div>

                        <div className="relative">
                            <label htmlFor="specialty" className="block text-sm font-medium leading-6 text-gray-900">Specialty <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="specialty" name="specialty" type="text" autoComplete="off" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Search specialties..." value={query_word} onChange={handleSearchChange} />
                                {speNotFound ? <div className='text-red-500 pt-2'>Specialty not found</div> : null}
                                {filteredSpecialties.length > 0 && showDropdown && (
                                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 absolute bg-white w-full shadow-lg z-10 mt-1">
                                        {filteredSpecialties.map((suggestion) => (
                                            <li key={suggestion.id} className="cursor-pointer hover:bg-gray-100 px-4 py-2" onClick={() => handleSuggestionClick(suggestion)}>
                                                {suggestion.specialty_type}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.specialty && <div className='text-red-500 pt-2'>{errors.specialty}</div>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="experience_years" className="block text-sm font-medium leading-6 text-gray-900">Number of Years Experience <span className="text-red-500">*</span></label>
                            <div className="mt-2">
                                <input id="experience_years" name="experience_years" type="text" autoComplete="experience_years" className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateExperience_years} />
                                {errors.experience_years && <div className='text-red-500 pt-2'>{errors.experience_years}</div>}
                            </div>
                        </div>

                        <div>
                            <button onClick={handleRegister} formMethod='post' className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Register
                            </button>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Already been a user?
                        <a href="/login" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Log in here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;