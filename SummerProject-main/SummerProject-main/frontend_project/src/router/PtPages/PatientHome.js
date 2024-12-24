import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import NavBar from '../../component/NavBar';
import {getUsername} from "../../api/Home";
import Cookies from "js-cookie";
import inputSymptom from '../../static/inputSymptom.jpeg'
import bookdr from '../../static/bookdr.jpg'
import riskfactor2 from '../../static/riskfactor2.jpg'
import Footer from "../../component/Footer";
import Loading from '../../component/Loading';

function PatientHome() {
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let token = Cookies.get('token');
        setLoading(true); // Start loading
        getUsername('/patient/patient/get_user_name/'+token+'/', {}).then(res => {
            setFullName(res.data.forenames + " " + res.data.surname)
            setLoading(false); // Stop loading
        })
    }, [])

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
            <NavBar/>
            <div className="bg-white">
                <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Welcome back, {fullName}</h1>
                        <p className="mt-4 text-lg leading-6 text-gray-600">
                            <a href="/help"
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Get started here
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round"
                                            strokeLinejoin="round" strokeWidth="2"
                                            d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </p>
                    </div>
                </div>
                <hr style={{width:'85%',margin:'0 auto'}}/>
                <div>
                    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <Link to="/contact-dr"
                                  className="flex items-center justify-center rounded-lg bg-blue-100 p-6 text-center hover:bg-blue-200">
                                <div
                                    class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                    <a href="#">
                                        <img className="rounded-t-lg h-80" src={bookdr} alt=""/>
                                    </a>
                                    <div class="p-5">
                                        <a href="#">
                                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Contact a Doctor</h5>
                                        </a>
                                        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Book an appointment with a doctor.</p>
                                        <br></br>
                                        <a href="#"
                                           className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            Click here
                                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round"
                                                      strokeLinejoin="round" strokeWidth="2"
                                                      d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </Link>
                            <Link to="/symptoms"
                                  className="flex items-center justify-center rounded-lg bg-red-100 p-6 text-center hover:bg-red-200">
                                <div
                                    class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                    <a href="#">
                                        <img className="rounded-t-lg w-full h-80" src={inputSymptom} alt=""/>
                                    </a>
                                    <div class="p-5">
                                        <a href="#">
                                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Enter New Symptoms</h5>
                                        </a>
                                        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Report any new symptoms you are experiencing.</p>
                                        <a href="#"
                                           className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            Click here
                                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round"
                                                      strokeLinejoin="round" strokeWidth="2"
                                                      d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </Link>
                            <Link to="/risk-factors"
                                  className="flex items-center justify-center rounded-lg bg-green-100 p-6 text-center hover:bg-green-200">
                                <div
                                    class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                    <a href="#">
                                        <img className="rounded-t-lg h-80" src={riskfactor2} alt=""/>
                                    </a>
                                    <div class="p-5">
                                        <a href="#">
                                            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Risk Assessment</h5>
                                        </a>
                                        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Update your risk factors and medical history for an assessment.</p>
                                        <a href="#"
                                           className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                            Click here
                                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                                <path stroke="currentColor" strokeLinecap="round"
                                                      strokeLinejoin="round" strokeWidth="2"
                                                      d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                                {/*<div>*/}
                                {/*    <h3 className="text-lg font-medium text-gray-900">Enter Risk Factors</h3>*/}
                                {/*    <p className="mt-2 text-base leading-6 text-gray-600">Update your risk factors and*/}
                                {/*        medical history.</p>*/}
                                {/*</div>*/}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900">
                    <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Improve Your Gut
                            Health</h2>
                        <div className="mt-8 flex justify-center gap-6">
                            <Link to="/diet-plans"
                                  className="rounded-md bg-white px-5 py-3 text-lg font-medium text-gray-900 hover:bg-gray-100">
                                Meal Plans
                            </Link>
                            <Link to="/exercise-plans"
                                  className="rounded-md bg-white px-5 py-3 text-lg font-medium text-gray-900 hover:bg-gray-100">
                                Exercise Plans
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
}

export default PatientHome;