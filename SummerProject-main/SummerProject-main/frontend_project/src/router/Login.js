import React, { useEffect, useRef, useState } from 'react';
import logo from '../static/savoirlogo.png';
import { doLogin } from '../api/Login';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    let navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isStaff, setIsStaff] = useState(0); // 0 = patient, 1 = doctor, 2 = nutritionist
    const [ifPasswordCorrect, setIfPasswordCorrect] = useState(true);
    const [ifLoginSuccess, setIfLoginSuccess] = useState(false);
    const [ifNoSuchUser, setIfNoSuchUser] = useState(false);
    const [wrongLoginPage, setWrongLoginPage] = useState(false);
    const [loginPageError, setLoginPageError] = useState(false); // New state for 400 error

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const updateUsername = (e) => {
        setUsername(e.target.value);
    };

    const updatePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setWrongLoginPage(false); // Reset the wrong login page state
        setLoginPageError(false); // Reset the login page error state
    
        doLogin('patient/user/login/', { 'username': username, 'password': password, 'isStaff': isStaff }).then((res) => {
            if (res.status === 200) {
                if ((res.data.isStaff === 1 && isStaff !== 1) ||
                    (res.data.isStaff === 2 && isStaff === 0) ||
                    (res.data.isStaff === 0 && isStaff !== 0)) {
                    setWrongLoginPage(true);
                    return;
                }
    
                setIfPasswordCorrect(true);
                setIfLoginSuccess(true);
                setIfNoSuchUser(false);
                Cookies.set('token', res.data.token, { expires: 1 });
                Cookies.set('isStaff', res.data.isStaff, { expires: 1 });
    
                if (res.data.isStaff === 1) {
                    navigate('/drhome');
                } else if (res.data.isStaff === 2) {
                    navigate('/nutritionist-home');
                } else {
                    navigate('/patient-home');
                }
    
                localStorage.setItem('isStaff', isStaff.toString()); // Setting staff status in local storage
            } else if (res.status === 599) {
                setIfPasswordCorrect(false);
                setIfNoSuchUser(false);
                setIfLoginSuccess(false);
            } else if (res.status === 598) {
                setIfNoSuchUser(true);
                setIfPasswordCorrect(true);
                setIfLoginSuccess(false);
            }else if (res.status === 400){
                setIfNoSuchUser(true);
                setIfPasswordCorrect(true);
                setIfLoginSuccess(false);
            }
        }).catch((error) => {
            console.error('Login failed:', error); // Debugging: Log any login errors
            if (error.response && error.response.status === 400) {
                setLoginPageError(true); // Set the login page error state if 400 status is returned
            }
        });
    };
    

    const bgColor = useRef(null);

    const changeLoginUser = (e) => {
        if (e.target.checked) {
            // Staff user (doctor or nutritionist)
            setIsStaff(1); // Set to doctor as default when checkbox is checked
            bgColor.current.className = 'bg-gradient-to-b from-gray-200 to-white';
        } else {
            // Patient user
            setIsStaff(0);
            bgColor.current.className = 'bg-gradient-to-b from-blue-200 to-white';
        }
    };

    return (
        <div className='bg-gradient-to-b from-blue-200 to-white' ref={bgColor}>
            <Link to={'/'}>
                <button type="button" className="absolute z-50 m-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0l4-4m-4 4l4 4"/>
                    </svg>
                    <span className="sr-only">Back to home</span>
                </button>
            </Link>

            <div className={'relative'}>
                {ifLoginSuccess === true && <div className="absolute z-50 text-center w-full p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                    <span className="font-medium">Login success</span>
                </div>}
                {ifNoSuchUser === true && <div className="absolute z-50 text-center w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Unknown username</span>
                </div>}
                {ifPasswordCorrect === false && (<div className="absolute z-50 text-center w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Incorrect Password</span>
                </div>)}
                {wrongLoginPage === true && (<div className="absolute z-50 text-center w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Please use the correct login page for your role</span>
                </div>)}
                {loginPageError === true && (<div className="absolute z-50 text-center w-full p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                    <span className="font-medium">Check you are logging in on the right page</span>
                </div>)}
            </div>

            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm mt-5">
                    <img className="mx-auto h-10 w-auto scale-150" src={logo} alt="Your Company"/>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Sign in to your account</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                            <div className="mt-2">
                                <input id="username" name="username" type="username" autoComplete="username" required
                                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={updateUsername}/>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>

                            </div>
                            <div className="mt-2">
                                <input id="password" name="password" type="password" autoComplete="current-password" required
                                    className="pl-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={updatePassword}/>
                            </div>
                        </div>

                        <div className='grid grid-cols-3 gap-4 content-start pl-5'>
                            <div className=" text-left text-sm text-gray-500">I am a patient</div>
                            <div className='relative pl-4'>
                                <label htmlFor="toggleTwo" className="flex items-center cursor-pointer select-none text-dark dark:text-blue-900">
                                    <div className="absolute bottom-0">
                                        <input type="checkbox" id="toggleTwo" className="peer sr-only" onChange={changeLoginUser}/>
                                        <div className="block h-8 rounded-full bg-blue-200 w-14"></div>
                                        <div className="absolute w-6 h-6 transition bg-blue-700 rounded-full dot dark:bg-dark-4 left-1 top-1 peer-checked:translate-x-full peer-checked:bg-primary"></div>
                                    </div>
                                </label>
                            </div>
                            <div className=" text-left text-sm text-gray-500">I am staff</div>
                        </div>

                        <div>
                            <button className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Sign in
                            </button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        Not a user? <a href="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Register here</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
