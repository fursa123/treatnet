import React, {useEffect, useState, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';
import logo from '../static/savoirlogo.png';
import hostList from "../utils/host";
import {addAvatar, getAvatar} from "../api/Home";


function NavBar() {
    const [navLinks = [], setNavLinks] = useState();

    const navigate = useNavigate();
    const token = Cookies.get('token'); // Get the token cookie
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStaff, setIsStaff] = useState(0);

    const [showAvatars, setShowAvatars] = useState(false)

    const [showMsgBar, setShowMsgBar] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null)

    useEffect(()=>{
        getAvatar({}, Cookies.get('token')).then(res => {
            setUserAvatar(res.data.avatar)
        })
    },[showAvatars])

    useEffect(() => {
        const token = Cookies.get('token');
        const isStaffCookie = Cookies.get('isStaff');

        if (isStaffCookie !== undefined) {
            const staffStatus = parseInt(isStaffCookie, 10);
            if (!isNaN(staffStatus)) {
                setIsStaff(staffStatus);

                if (token) {
                    if (staffStatus === 0) {
                        // is patient
                        setNavLinks([
                            {text: 'Patient Home', path: '/patient-home'},
                            {text: 'View Appointments', path: '/patient-calendar'},
                            {text: 'Messages', path: '/message'},
                            {text: 'AI Chatbot', path: '/projects'},
                            {text: 'Help', path: '/help'},
                            {text: 'Feedback', path: '/feedback'},
                        ]);
                    } else if (staffStatus === 1) {
                        // is doctor
                        setNavLinks([
                            {text: 'Doctor Home', path: '/drhome'},
                            {text: 'Find Patient', path: '/findpatient'},
                            {text: 'View Appointments', path: '/calendar'},
                            {text: 'Messages', path: '/message'},
                            {text: 'AI Chatbot', path: '/projects'},
                            {text: 'Feedback', path: '/feedback'},
                        ]);
                    } else if (staffStatus === 2) {
                        // is nutritionist
                        setNavLinks([
                            {text: 'Nutritionist Home', path: '/nutritionist-home'},
                            {text: 'Find Patient', path: '/nutritionist-findpatient'},
                            {text: 'Messages', path: '/message'},
                            {text: 'AI Chatbot', path: '/projects'},
                            {text: 'Feedback', path: '/feedback'},
                        ]);
                    }
                } else {
                    setNavLinks([
                        {text: 'AI Chatbot', path: '/projects'},
                        {text: 'Feedback', path: '/feedback'},
                    ]);
                }
            } else {
                console.error('Invalid staffStatus value:', isStaffCookie); // Log error if parsing fails
            }
        } else {
            // Default navigation links if isStaff cookie is undefined
            setNavLinks([
                {text: 'AI Projects', path: '/projects'},
                {text: 'Feedback', path: '/feedback'},
            ]);
        }
    }, [token]);

    const submitAvatar = () => {
        let url = 'http://' + hostList.backend + '/media/summer_project/default_avatar/avatar_' + selectedAvatar + '.png'
        addAvatar({'avatar': url}, Cookies.get('token')).then(res => {
            if (res.status === 200) {
                setShowAvatars(false)
            }
        })
    }


    const handleSignOut = () => {
        Cookies.remove('userId'); // Remove the userId cookie
        Cookies.remove('token'); // Remove the token cookie
        Cookies.remove('isStaff'); // Remove the token cookie
        navigate('/'); // Redirect to the home page
    };

    return (
        <div>
            <div style={{height: '64px'}}></div>
            <div className={'fixed top-0 left-0 right-0 z-50'}>
                <nav className="bg-blue-500">
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Toggle button for mobile menu */}
                                <button
                                    type="button"
                                    className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                    aria-controls="mobile-menu"
                                    aria-expanded="false"
                                >
                                    <span className="absolute -inset-0.5"></span>
                                    <span className="sr-only">Open main menu</span>
                                    <svg
                                        className="block h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                                    </svg>
                                    <svg
                                        className="hidden h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                {/* Logo */}
                                <div className="flex flex-shrink-0 items-center">
                                    <button>
                                        <img className="h-8 w-auto" src={logo} alt="Your Company"
                                             onClick={() => navigate('/')}/>
                                    </button>
                                </div>
                                {/* Desktop menu */}
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        {navLinks.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => navigate(link.path)}
                                                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                                aria-current="page"
                                            >
                                                {link.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                {/* User menu */}
                                {token ? (
                                    <>

                                        {/* Notifications button */}
                                        {/*<button*/}
                                        {/*    type="button"*/}
                                        {/*    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"*/}
                                        {/*    onClick={() => setShowMsgBar(!showMsgBar)}>*/}
                                        {/*    <span className="absolute -inset-1.5"></span>*/}
                                        {/*    <span className="sr-only">View notifications</span>*/}
                                        {/*    /!*msg coming*!/*/}
                                        {/*    <span*/}
                                        {/*        class="top-0 left-6 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>*/}

                                        {/*    <svg*/}
                                        {/*        className="h-6 w-6"*/}
                                        {/*        fill="none"*/}
                                        {/*        viewBox="0 0 24 24"*/}
                                        {/*        strokeWidth="1.5"*/}
                                        {/*        stroke="currentColor"*/}
                                        {/*        aria-hidden="true"*/}
                                        {/*    >*/}
                                        {/*        <path*/}
                                        {/*            strokeLinecap="round"*/}
                                        {/*            strokeLinejoin="round"*/}
                                        {/*            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"*/}
                                        {/*        />*/}
                                        {/*    </svg>*/}
                                        {/*</button>*/}

                                        {/* Profile dropdown */}
                                        <div className="relative ml-3">
                                            <button
                                                type="button"
                                                className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                                id="user-menu-button"
                                                aria-expanded="false"
                                                aria-haspopup="true"
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            >
                                                <span className="absolute -inset-1.5"></span>
                                                <span className="sr-only">Open user menu</span>
                                                {userAvatar ? <img
                                                    className="h-9 w-9 rounded-full"
                                                    src={userAvatar}
                                                    alt=""
                                                /> : <img
                                                    className="h-9 w-9 rounded-full"
                                                    src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                                    alt=""
                                                />}

                                            </button>
                                            {/* Dropdown menu */}
                                            {isMenuOpen && (
                                                <div
                                                    className="absolute right-0 z-10 mt-4 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                                    role="menu" aria-orientation="vertical"
                                                    aria-labelledby="user-menu-button"
                                                    tabIndex="-1">
                                                    <button className="block px-4 py-2 text-sm text-gray-700"
                                                            role="menuitem">
                                                        {
                                                            Cookies.get('isStaff') === '1' ?
                                                                <Link to={'/drprofile'}>Your Profile</Link> :
                                                                Cookies.get('isStaff') === '2' ?
                                                                    <Link to={'/nuprofile'}>Your
                                                                        Profile</Link> :
                                                                    <Link to={'/profile'}>Your Profile</Link>
                                                        }
                                                    </button>
                                                    <button
                                                        className="block px-4 py-2 text-sm text-gray-700"
                                                        role="menuitem" onClick={() => setShowAvatars(true)}
                                                        data-modal-target="static-modal"
                                                        data-modal-toggle="static-modal"
                                                    >
                                                        Change avatar
                                                    </button>

                                                    <button
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        onClick={handleSignOut}
                                                    >
                                                        Sign out
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    // Sign In button when user is not authenticated
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="relative flex items-center rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
                                    >
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Mobile menu */}
                    <div className="sm:hidden" id="mobile-menu">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navLinks.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(link.path)}
                                    className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white"
                                    aria-current="page"
                                >
                                    {link.text}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/*message bar*/}
                {showMsgBar && (<div className={'relative'}>
                    <div
                        class="absolute z-50 right-0 w-full max-w-md p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-4">
                            <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Latest
                                Messages</h5>
                            <a href="#"
                               className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                                View all
                            </a>
                        </div>
                        <div class="flow-root">
                            <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
                                <li className="py-3 sm:py-4">
                                    <div class="flex items-center">
                                        <div class="flex-1 min-w-0 ms-4">
                                            <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                Neil Sims
                                            </p>
                                            <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                                email@windster.com
                                            </p>
                                        </div>
                                        <div
                                            class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            Reserved
                                        </div>
                                    </div>
                                </li>
                                <li className="py-3 sm:py-4">
                                    <div class="flex items-center ">
                                        <div class="flex-1 min-w-0 ms-4">
                                            <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                Bonnie Green
                                            </p>
                                            <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                                email@windster.com
                                            </p>
                                        </div>
                                        <div
                                            class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            Expired
                                        </div>
                                    </div>
                                </li>
                                <li className="py-3 sm:py-4">
                                    <div class="flex items-center">
                                        <div class="flex-1 min-w-0 ms-4">
                                            <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                Michael Gough
                                            </p>
                                            <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                                email@windster.com
                                            </p>
                                        </div>
                                        <div
                                            class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                            Cancelled
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>)}
            </div>

            <div>
                {showAvatars && (
                    <div id="static-modal" data-modal-backdrop="static" tabIndex="-1"
                         class="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                        <div class="relative p-4 w-full max-w-2xl max-h-full">
                            <div
                                class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                <div
                                    class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                                        Change your avatar
                                    </h3>
                                    <button type="button" onClick={() => setShowAvatars(false)}
                                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                            data-modal-hide="static-modal">
                                        <svg className="w-3 h-3" aria-hidden="true"
                                             xmlns="http://www.w3.org/2000/svg"
                                             fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                                  stroke-width="2"
                                                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                        <span class="sr-only">Close modal</span>
                                    </button>
                                </div>
                                <div class="p-4 md:p-5 space-y-4 flex justify-center">
                                    <div className={'grid grid-cols-4'}>
                                        {[...Array(12).keys()].map(index => (
                                            <img className={`w-10 h-10 rounded-full cursor-pointer mx-5 my-5 ${
                                                selectedAvatar === index ? 'ring-2 ring-blue-500' : ''
                                            }`} key={index} onClick={() => setSelectedAvatar(index)}
                                                 src={`http://` + hostList.backend + `/media/summer_project/default_avatar/avatar_` + index + `.png`}
                                                 alt="Rounded avatar"/>
                                        ))}
                                    </div>
                                </div>
                                <div
                                    class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                    <button type="button" onClick={submitAvatar}
                                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>


    );
}

export default NavBar;
