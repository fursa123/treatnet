import React, { useEffect, useState } from 'react';
import NavBar from "../../component/NavBar";
import Cookies from "js-cookie";
import { getUsername } from "../../api/Home";
import { addAvailableTime, getNormalWorkingTime } from "../../api/Doctor";
import CustomCalendar from "../../component/CustomCalendar";
import Heading from "../../component/Heading";
import Loading from '../../component/Loading';
import "../../css/button.css";
import "../../css/calendar.css";

function ViewCalendar() {
    const [fullName, setFullName] = useState('');
    const [availableTime, setAvailableTime] = useState(new Array(24).fill(false));
    const [hideEditBar, setHideEditBar] = useState(true);
    const [timeLine, setTimeLine] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading

        Promise.all([
            getUsername('/patient/patient/get_user_name/' + token + '/', {}),
            getNormalWorkingTime({}, token)
        ]).then(([usernameRes, workingTimeRes]) => {
            if (usernameRes.status === 200) {
                setFullName(usernameRes.data.forenames + " " + usernameRes.data.surname);
            }
            if (workingTimeRes.status === 200) {
                setTimeLine(workingTimeRes.data.data);
            }
        }).catch(error => {
            console.error('Error fetching data:', error);
        }).finally(() => {
            setLoading(false); // Stop loading
        });
    }, []);

    const handleAvailableTime = (num) => {
        const updatedCheckedState = availableTime.map((item, index) =>
            index === num ? !item : item
        );
        setAvailableTime(updatedCheckedState);
    };

    const submitAvailableTime = () => {
        let timeList = [];
        for (let i = 0; i < availableTime.length; i++) {
            if (availableTime[i]) {
                timeList.push(i);
            }
        }
        addAvailableTime({
            'availableTime': timeList,
            'isStaff': Cookies.get('isStaff')
        }, Cookies.get('token')).then(res => {
            setHideEditBar(true);
        });
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

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
            <Heading title={`Dr ${fullName}'s Calendar`}/>
            <div className="mx-4">
                <button
                    className="text-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    onClick={toggleDrawer} // Toggle the drawer visibility
                >
                    Show your available time table
                </button>
                <div
                    id="drawer-timeTable"
                    className={`fixed top-0 left-0 mt-16 z-40 h-screen p-4 overflow-y-auto transition-transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} bg-white w-80 dark:bg-gray-800`}
                    tabIndex="-1"
                    aria-labelledby="drawer-label"
                >
                    <h5
                        id="drawer-label"
                        className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
                    >
                        <svg
                            className="w-4 h-4 me-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
                            />
                        </svg>
                        Info
                    </h5>
                    <button
                        type="button"
                        onClick={toggleDrawer} // Close the drawer
                        aria-controls="drawer-timeTable"
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                        </svg>
                        <span className="sr-only">Close menu</span>
                    </button>

                    <h3>Your available time in days. Some users may book before you change the schedule, you can reject the appointments which you are not available anymore.</h3>
                    {hideEditBar ? (
                        Array.isArray(timeLine) &&
                        timeLine.map((time, index) => (
                            <div key={index} className="m-3 text-lg text-gray-500 dark:text-gray-400">
                                {time.time}
                            </div>
                        ))
                    ) : (
                        <div className="calendar-container justify-center mt-4">
                            <h2 className="text-xl font-bold mb-4">Choose or change your availability</h2>
                            <div className="flex flex-wrap">
                                {[...Array(24).keys()].map((num) => (
                                    <div
                                        key={num}
                                        className="items-center p-5 m-1 border border-gray-200 rounded dark:border-gray-700 w-56"
                                    >
                                        <input
                                            type="checkbox"
                                            value=""
                                            name="bordered-checkbox"
                                            onChange={() => handleAvailableTime(num)}
                                            checked={availableTime[num]}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <label
                                            htmlFor="bordered-checkbox-1"
                                            className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                        >
                                            {num < 10 ? '0' + num : num} : 00 - {num < 9 ? '0' + (num + 1) : (num + 1)} : 00
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={submitAvailableTime}
                                className="button bg-blue-600 hover:bg-blue-700 items-end m-2"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => setHideEditBar(!hideEditBar)}
                                className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setHideEditBar(!hideEditBar)}
                        className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    >
                        Edit your availability
                    </button>
                </div>
            </div>
            <CustomCalendar />
        </div>
    );
}

export default ViewCalendar;
