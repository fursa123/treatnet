import React, { useState, useEffect } from 'react';
import NavBar from "../../component/NavBar";
import InfoBox from '../../component/InfoBox';
import { getUsername } from "../../api/Home";
import Cookies from "js-cookie";
import { findPatientsWithUnapprovedDietPlans } from "../../api/Nutritionist";
import { Link } from "react-router-dom";
import hostList from "../../utils/host";
import Footer from '../../component/Footer';
import Loading from '../../component/Loading';
import styled from 'styled-components';

function NuHomePage() {
    const [fullName, setFullName] = useState('');
    const [unapprovedDietPatients, setUnapprovedDietPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading
        getUsername('/patient/patient/get_user_name/' + token + '/', {})
            .then(res => {
                setFullName(res.data.forenames + " " + res.data.surname);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });

        findPatientsWithUnapprovedDietPlans('/patient/nutritionist/get_unapproved_diet_plans/' + token + '/', {})
            .then(res => {
                if (res.status === 200) {
                    setUnapprovedDietPatients(res.data.results);
                    setPrevPageUrl(res.data.previous);
                    setNextPageUrl(res.data.next);
                } else {
                    console.error('Error fetching unapproved diet plans, status code:', res.status);
                }
            })
            .catch(error => {
                console.error('Error fetching unapproved diet plans:', error);
            })
            .finally(() => {
                setLoading(false); // Stop loading
            });
    }, []);

    const handleNextPage = () => {
        if (nextPageUrl) {
            setLoading(true); // Start loading
            findPatientsWithUnapprovedDietPlans(nextPageUrl, {})
                .then(res => {
                    if (res.status === 200) {
                        setUnapprovedDietPatients(res.data.results);
                        setPrevPageUrl(res.data.previous);
                        setNextPageUrl(res.data.next);
                    } else {
                        console.error('Error fetching next page of unapproved diet plans, status code:', res.status);
                    }
                })
                .catch(error => {
                    console.error('Error fetching next page of unapproved diet plans:', error);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
    };

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

    const handlePrePage = () => {
        if (prevPageUrl) {
            setLoading(true); // Start loading
            findPatientsWithUnapprovedDietPlans(prevPageUrl, {})
                .then(res => {
                    if (res.status === 200) {
                        setUnapprovedDietPatients(res.data.results);
                        setPrevPageUrl(res.data.previous);
                        setNextPageUrl(res.data.next);
                    } else {
                        console.error('Error fetching previous page of unapproved diet plans, status code:', res.status);
                    }
                })
                .catch(error => {
                    console.error('Error fetching previous page of unapproved diet plans:', error);
                })
                .finally(() => {
                    setLoading(false); // Stop loading
                });
        }
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
            <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                        Welcome back, Nutritionist {fullName}
                    </h1>
                </div>
            </div>
            <div>
                <InfoBox title="Patients with Unapproved Diet Plans" backgroundColor="blue-500">
                    {Array.isArray(unapprovedDietPatients) && unapprovedDietPatients.length > 0 ? (
                        <div className="flex flex-wrap justify-start gap-4">
                            {unapprovedDietPatients.map((patient, index) => (
                                <div key={index} className="w-56 max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex flex-col items-center pb-10 mt-8">
                                        <img className="w-24 h-24 mb-3 rounded-full shadow-lg" src={`http://${hostList.backend}/media/summer_project/default-avatar.jpeg`} alt="Avatar" />
                                        <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{patient.Forenames} {patient.Surname}</h5>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{patient.Gender} {patient.Age}</span>
                                        <div className="flex mt-4 md:mt-6">
                                            {/* <a href="#" className="py-2 px-4 ms-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                                <Link to={"/nutritionist-pt?username=" + patient.Username} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Details</Link>
                                            </a> */}
                                            <Link to={"/nutritionist-pt?username=" + patient.Username}
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
                    ) : (
                        <p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>No patients found</p>
                    )}
                    <div className="flex mt-4 items-center justify-center">
                        {prevPageUrl && (
                            <a href="#" className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={handlePrePage}>
                                <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L7 10.414a1 1 0 010-1.414l4.293-4.293a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                                </svg>
                                Previous
                            </a>
                        )}
                        {nextPageUrl && (
                            <a href="#" className="flex items-center justify-center px-3 h-8 ml-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onClick={handleNextPage}>
                                Next
                                <svg aria-hidden="true" className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 001.414 0L13 10.414a1 1 0 000-1.414L8.707 4.707a1 1 0 00-1.414 1.414L10.586 10 7.293 13.293a1 1 0 000 1.414z" clipRule="evenodd"></path>
                                </svg>
                            </a>
                        )}
                    </div>
                </InfoBox>
            </div>
            <Footer />
        </div>
    );
}

export default NuHomePage;
