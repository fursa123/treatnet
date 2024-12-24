import React, { useState, useEffect } from 'react';
import NavBar from "../../component/NavBar";
import InfoBox from '../../component/InfoBox';
import { getUsername } from "../../api/Home";
import Cookies from "js-cookie";
import { findPatientsRegisteredThisDay, getComingMeetings } from "../../api/Doctor";
import { Link } from "react-router-dom";
import hostList from "../../utils/host";
import Loading from '../../component/Loading';
import styled from 'styled-components';

function DrHomePage() {

    const [fullName, setFullName] = useState('')
    const [latestPatients, setLatestPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);
    const [comingMeetings, setComingMeetings] = useState([])
    const [authenticated, setAuthenticated] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading

        Promise.all([
            getUsername('/patient/patient/get_user_name/' + token + '/', {}),
            findPatientsRegisteredThisDay('/patient/doctor/get_pt_registered_in_days/' + token + '/', {}),
            getComingMeetings('/patient/doctor/get_coming_meeting/' + token + '/', {})
        ]).then(([usernameRes, patientsRes, meetingsRes]) => {
            if (usernameRes.status === 200) {
                setFullName(usernameRes.data.forenames + " " + usernameRes.data.surname);
            }
            if (patientsRes.status === 200) {
                setLatestPatients(patientsRes.data.results);
                setPrevPageUrl(patientsRes.data.previous);
                setNextPageUrl(patientsRes.data.next);
                setAuthenticated(true);
            } else {
                setAuthenticated(false);
            }
            if (meetingsRes.status === 200) {
                setComingMeetings(meetingsRes.data.data);
            }
        }).catch(error => {
            console.error('Error fetching data:', error);
        }).finally(() => {
            setLoading(false); // Stop loading
        });
    }, []);

    const handleNextPage = () => {
        setLoading(true);
        findPatientsRegisteredThisDay(nextPageUrl, {})
            .then(res => {
                if (res.status === 200) {
                    setLatestPatients(res.data.results);
                    setPrevPageUrl(res.data.previous);
                    setNextPageUrl(res.data.next);
                }
            })
            .catch(error => {
                console.error('Error fetching next page:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handlePrePage = () => {
        setLoading(true);
        findPatientsRegisteredThisDay(prevPageUrl, {})
            .then(res => {
                if (res.status === 200) {
                    setLatestPatients(res.data.results);
                    setPrevPageUrl(res.data.previous);
                    setNextPageUrl(res.data.next);
                }
            })
            .catch(error => {
                console.error('Error fetching previous page:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${month}-${day}  ${hours}:${minutes}`;
    };

    const handleLatestPatients = () => {
        let token = Cookies.get('token');
    }

    if (loading) {
        return (
            <div>
                <NavBar />
                <Loading />
            </div>
        );
    }

    const StyledButton = styled.button`
        // width: 250px; 
        // height: 50px;  

        background-color: white;
        color: rgba(28, 100, 242, 0.8);
        border: 0.8px solid rgba(120, 120, 120, 0.2);
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        border-radius: 10px;
        &:hover {
            background-color: rgba(28, 100, 242, 0.8);
            color: white;
        }
    `;

    return (
        <div onLoad={handleLatestPatients}>
            <NavBar />
            <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Welcome back,
                        Dr {fullName}</h1>
                </div>
            </div>
            <div>
                <InfoBox title="Upcoming meetings" backgroundColor="blue-500">

                    <div class="relative overflow-x-auto">
                        <table className="w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead class="text-xs text-gray-900 uppercase dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">
                                        Patient name
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Age
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Gender
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Booking time
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        Patient details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(comingMeetings) && comingMeetings?.map((patient, index) => (
                                    <tr key={index}
                                        class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                        <th scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {patient.patient_name}
                                        </th>
                                        <td className="px-6 py-4">
                                            {patient.age}
                                        </td>
                                        <td className="px-6 py-4">
                                            {patient.gender}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatDateTime(patient.booking_time)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={"/detailed-pt?username=" + patient.patient_name}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">select</Link>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>

                        {comingMeetings.length === 0 &&
                            (<p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>No coming meeting</p>)
                        }
                    </div>


                </InfoBox>

                <InfoBox title="Newest Patient" backgroundColor="blue-500">
                    {/*spinner*/}
                    {loading && (<div role="status" className={'flex items-center justify-center w-full my-3'}>
                        <svg aria-hidden="true"
                            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor" />
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill" />
                        </svg>
                        <span class="sr-only">Loading...</span>
                    </div>)}

                    <div>
                        {Array.isArray(latestPatients) && latestPatients.length > 0 ? (
                            <div class="flex flex-wrap justify-start gap-4">
                                {latestPatients.map((patient, index) => (
                                    <div key={index}
                                        class="w-56 max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                        <div class="flex flex-col items-center pb-10 mt-8">
                                            {patient.Avatar===''?(<img className="w-24 h-24 mb-3 rounded-full shadow-lg"
                                                                       src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                                                       alt="image" />)
                                                :(<img className="w-24 h-24 mb-3 rounded-full shadow-lg"
                                                       src={patient.Avatar}
                                                       alt="image" />)}

                                            <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">{patient.Forenames} {patient.Surname}</h5>
                                            <span
                                                class="text-sm text-gray-500 dark:text-gray-400">{patient.Gender} {patient.Age}</span>
                                            <div class="flex mt-4 md:mt-6">
                                                {/* <a href="#"
                                                    className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                    <Link to={"/detailed-pt?username=" + patient.Username}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                        <StyledButton>
                                                            Details
                                                        </StyledButton>
                                                    </Link>
                                                </a> */}
                                                <Link to={"/detailed-pt?username=" + patient.Username}
                                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>
                                                        Details
                                                    </StyledButton>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>No recent patient</p>)}
                    </div>

                    <div class="flex mt-4 items-center justify-center">
                        {prevPageUrl && (<a href="#"
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            onClick={handlePrePage}>
                            Previous
                        </a>)}
                        {nextPageUrl && (<a href="#"
                            className="flex items-center justify-center px-3 h-8 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            onClick={handleNextPage}>
                            Next
                        </a>)}
                    </div>
                </InfoBox>
            </div>
        </div>
    );
}

export default DrHomePage;
