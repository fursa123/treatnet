import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../static/savoirlogo.png';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import request from '../../utils/request';
import { doNuRegister } from "../../api/NuRegister";
import Footer from '../../component/Footer'

function NuRegister() {
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

   const navigate = useNavigate(); // What is this for?

   // nutritionist fields
   const [qualification, setQualification] = useState();
   const [experience_years, setExperience_years] = useState();

   const updateUsername = (e) => setUsername(e.target.value);
   const updateEmail = (e) => setEmail(e.target.value);
   const updatePhone_number = (e) => setPhone_number(e.target.value);
   const updateForenames = (e) => setForenames(e.target.value);
   const updateSurname = (e) => setSurname(e.target.value);
   const updatePassword = (e) => setPassword(e.target.value);
   const updateRep_password = (e) => setRep_password(e.target.value);

   // nutritionist updates 
   const updateQualification = (e) => setQualification(e.target.value);
   const updateExperience_years = (e) => setExperience_years(e.target.value);

   // for drop down gender menu
   const [genderOptions, setGenderOptions] = useState([]);
   const [showGenderDropdown, setShowGenderDropdown] = useState(false);
   const [gender, setGender] = useState('');

   useEffect(() => {
      window.scrollTo(0, 0);
   }, []);

   const handleGenderSearchChange = async (e) => {
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

   const validateFields = () => {
      const newErrors = {};
      if (!username) newErrors.username = 'Username is required';
      if (!email) newErrors.email = 'Email is required';
      if (!phone_number) newErrors.phone_number = 'Phone number is required';
      if (!forenames) newErrors.forenames = 'Forenames are required';
      if (!surname) newErrors.surname = 'Surname is required';
      if (!password) newErrors.password = 'Password is required';
      if (!rep_password) newErrors.rep_password = 'Repeat password is required';
      if (!qualification) newErrors.qualification = 'Qualification is required';
      if (!experience_years) newErrors.experience_years = 'Number of Years Experience is required';
      if (!gender) newErrors.gender = 'Gender is required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleRegister = () => {
      if (!validateFields()) return;

      if (password !== rep_password) {
         setIs_password_same(false);
         return;
      } else {
         setIs_password_same(true);
      }

      doNuRegister('patient/nutritionist/register/', { username, email, phone_number, password, qualification, experience_years, forenames, surname }).then((res) => {
         if (res.status === 200) {
            alert('register success')
            Cookies.set('token', res.data.token, { expires: 1 });
            Cookies.set('isStaff', 2, { expires: 1 });
            setTimeout(() => {
               navigate('/nutritionist-home');
            }, 500);
            localStorage.setItem('isStaff', isStaff);
         } else if (res.status === 597) {
            setIs_user_used(true);
         }
      })
   }

   return (
      <div>
         {/* Back button */}
         <Link to={'/'}>
            <button type="button"
               className="absolute z-50 m-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
               <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 14 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                     d="M13 5H1m0 0l4-4m-4 4l4 4" />
               </svg>
               <span class="sr-only">Back to home</span>
            </button>
         </Link>

         <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            {/* Logo and heading */}
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
               <img className="mx-auto h-10 w-auto scale-150" src={logo} alt="Your Company" />
               <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Register your Nutritionist account</h2>
               <p className="mt-2 text-center text-sm text-gray-500">
                  or <br></br>
                  <a href="/dr_register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a doctor</a>
                  <br></br>
                  <a href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> register as a patient</a>
               </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
               <div className="space-y-6">
                  {/* Normal Register */}
                  <div>
                     <label htmlFor="username"
                        className="block text-sm font-medium leading-6 text-gray-900">Username <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="username" name="username" type="username" autoComplete="username" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updateUsername} />
                        {!is_user_used ? <div></div> :
                           <div className={'text-red-500 pt-2'}>Username already be registered</div>}
                        {errors.username && <div className='text-red-500 pt-2'>{errors.username}</div>}
                     </div>
                  </div>

                  <div>
                     <label htmlFor="email"
                        className="block text-sm font-medium leading-6 text-gray-900">Email <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="email" name="email" type="email" autoComplete="email" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updateEmail} />
                        {errors.email && <div className='text-red-500 pt-2'>{errors.email}</div>}
                     </div>
                  </div>

                  <div>
                     <label htmlFor="phone_number"
                        className="block text-sm font-medium leading-6 text-gray-900">Phone number <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="phone_number" name="phone_number" type="phone_number"
                           autoComplete="phone_number" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updatePhone_number} />
                        {errors.phone_number && <div className='text-red-500 pt-2'>{errors.phone_number}</div>}
                     </div>
                  </div>

                  <div>
                     <label htmlFor="forenames" className="block text-sm font-medium leading-6 text-gray-900">Forenames <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="forenames" name="forenames" type="text" autoComplete="forenames" required className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateForenames} />
                        {errors.forenames && <div className='text-red-500 pt-2'>{errors.forenames}</div>}
                     </div>
                  </div>
                  <div>
                     <label htmlFor="surname" className="block text-sm font-medium leading-6 text-gray-900">Surname <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="surname" name="surname" type="text" autoComplete="surname" required className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" onChange={updateSurname} />
                        {errors.surname && <div className='text-red-500 pt-2'>{errors.surname}</div>}
                     </div>
                  </div>

                  {/* gender */}
                  <div className="relative">
                     <label htmlFor="seniority"
                        className="block text-sm font-medium leading-6 text-gray-900">Gender <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="Seniority" name="Seniority" type="text" autoComplete="off" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           placeholder="Select gender..."
                           value={gender}
                           onClick={handleGenderSearchChange} />
                        {/* Dropdown menu results */}
                        {genderOptions.length > 0 && showGenderDropdown && (
                           <ul className="divide-y divide-gray-200 rounded-md border border-gray-300 absolute bg-white w-full shadow-lg z-10 mt-1">
                              {genderOptions.map((suggestion) => (
                                 <li
                                    key={suggestion.id}
                                    className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                                    onClick={() => handleGenderSuggestionClick(suggestion)}>
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
                        <label htmlFor="password"
                           className="block text-sm font-medium leading-6 text-gray-900">Password <span className="text-red-500">*</span></label>
                     </div>
                     <div className="mt-2">
                        <input id="password" name="password" type="password" autoComplete="current-password"
                           required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updatePassword} />
                        {errors.password && <div className='text-red-500 pt-2'>{errors.password}</div>}
                     </div>
                  </div>

                  <div>
                     <div className="flex items-center justify-between">
                        <label htmlFor="repeat your password"
                           className="block text-sm font-medium leading-6 text-gray-900">Repeat your
                           password <span className="text-red-500">*</span></label>
                     </div>
                     <div className="mt-2">
                        <input id="rep_password" name="rep_password" type="password"
                           autoComplete="current-password"
                           required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updateRep_password} />
                        {is_password_same ? <div></div> :
                           <div className={'text-red-500 pt-2'}>password should be the same as above</div>}
                        {errors.rep_password && <div className='text-red-500 pt-2'>{errors.rep_password}</div>}
                     </div>
                  </div>

                  {/* Nutritionist extra register */}
                  <div>
                     <label htmlFor="qualification"
                        className="block text-sm font-medium leading-6 text-gray-900">Qualification <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="qualification" name="qualification" type="qualification"
                           autoComplete="qualification" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updateQualification} />
                        {errors.qualification && <div className='text-red-500 pt-2'>{errors.qualification}</div>}
                     </div>
                  </div>

                  <div>
                     <label htmlFor="experience_years"
                        className="block text-sm font-medium leading-6 text-gray-900">Number of Years Experience <span className="text-red-500">*</span></label>
                     <div className="mt-2">
                        <input id="experience_years" name="experience_years" type="experience_years" autoComplete="experience_years" required
                           className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                           onChange={updateExperience_years} />
                        {errors.experience_years && <div className='text-red-500 pt-2'>{errors.experience_years}</div>}
                     </div>
                  </div>

                  <div>
                     <button onClick={handleRegister} formMethod='post'
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        Register
                     </button>
                  </div>
               </div>

               <p className="mt-10 text-center text-sm text-gray-500">
                  Already been a user?
                  <a href="login/" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Log
                     in here</a>
               </p>
            </div>
         </div>
         <Footer />
      </div>
   );
}

export default NuRegister;
