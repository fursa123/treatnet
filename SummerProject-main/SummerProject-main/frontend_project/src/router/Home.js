import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import NavBar from '../component/NavBar';
import doctorBackground from '../static/doctorBackground.png';
import Footer from "../component/Footer";
import Cookies from 'js-cookie';
import hostList from "../utils/host";


function Home() {
    const [navLinks = [], setNavLinks] = useState();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    useEffect(() => {
        const token = Cookies.get('token');
        const isStaffCookie = Cookies.get('isStaff');

        if (token) {
            // Parse isStaff cookie to integer
            const isStaff = parseInt(isStaffCookie, 10); // Parse the cookie value to integer

            if (!isNaN(isStaff)) {
                if (isStaff === 1) {
                    setNavLinks([
                        { text: 'DrHome', path: '/drhome' },
                        { text: 'Team', path: '/team' },
                        { text: 'Projects', path: '/projects' },
                        { text: 'Calendar', path: '/calendar' }
                    ]);
                } else {
                    setNavLinks([
                        { text: 'Team', path: '/team' },
                        { text: 'Projects', path: '/projects' },
                        { text: 'Calendar', path: '/calendar' }
                    ]);
                }
            } else {
                // Default case if isStaff cookie is not valid
                setNavLinks([
                    { text: 'Team', path: '/team' },
                    { text: 'Projects', path: '/projects' }
                ]);
            }
        } else {
            setNavLinks([
                { text: 'Team', path: '/team' },
                { text: 'Projects', path: '/projects' }
            ]);
        }
    }, []);
    


    return (
        <div>
            <NavBar navLinks={navLinks}/>
            <div
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.7)), url(${doctorBackground})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    height: '700px'
                }}
            >
                <div className="relative isolate lg:px-8">
                    <div className="mx-auto max-w-2xl pt-20">

                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-6xl">Qi-CT</h1>
                            <p className="mt-6 text-lg leading-8 text-gray-900">
                                Qi-CT is a digital transformation tool set to change how medical diagnosis is carried
                                out,
                                making it faster and more effective.
                                The main objective of this tool is to help patients and medical practitioners identify
                                and find any abnormal cancer cell growth in their early stages by reporting symptoms as
                                early as possible to save lives and significantly reduce treatment costs.
                            </p>
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                <Link
                                    to="/register"
                                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Get started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={'flex'} style={{backgroundColor: '#F7FFFF'}}>
                <video className="h-96 mx-3 mt-20" controls>
                    <source src={`http://` + hostList.backend + `/media/summer_project/homevideo.MOV`}
                            type="video/mp4"/>
                    Your browser does not support the video tag.
                </video>
                <div className={'text-right pt-5 mx-3'}>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Get start in
                        minutes</h1>
                    <p className="mt-2 text-lg leading-8 text-gray-600 text-left">

                        <b>Qi-CT</b> can help doctors to prescribe the right medication and recommend specific radiotherapy treatments and chemotherapy treatments.<br/>
                        <b>Qi-CT</b> can expedite a consultation appointment booking system and bookings for tests at government and private clinics.<br/>
                        <b>Qi-CT</b> can create Gut Health guidance i.e. (Nutrition Plans) and offer Alternative Lifestyle Guidance i.e. (Exercises Plans) for all users.<br/>
                        • Enhanced Accuracy: Reduces false positives and negatives, minimizing the risk of misdiagnosis.<br/>
                        • Time-Efficiency: Accelerates the diagnostic process, allowing for prompt treatment initiation.<br/>
                        • Cost Savings: Optimises resource utilisation by minimising unnecessary follow-up tests through accurate initial diagnostics.<br/>
                        • Reduces overcrowding at hospitals by providing a medium to report symptoms remotely.<br/>
                    </p>
                </div>
            </div>
            <div style={{height: '400px', backgroundColor: '#F7FFFF'}} className={'py-14 px-5'}>
                <h1 className="pb-10 text-1xl text-center tracking-tight text-gray-900 sm:text-3xl">
                    <b>Qi-CT</b> can help doctors to prescribe the right medication and recommend specific radiotherapy treatments and chemotherapy treatments.<br/>
                </h1>

                <div class="flex flex-col items-center pb-10">
                    <img className="w-24 h-24 mb-3 rounded-full shadow-lg"
                         src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                         alt="Supervisor avatar"/>
                    <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">Michael Adeleye</h5>
                    <span class="text-sm text-gray-500 dark:text-gray-400">CEO of Tee Martin Ltd</span>
                </div>
            </div>

            <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
                <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full object-cover object-right md:object-center"
                />
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">About us</h2>
                        <p className="mt-6 mx-3 text-lg leading-8 text-gray-300">
                            Our cancer diagnosis software represents a groundbreaking leap in the field of oncology,
                            utilizing advanced technologies to revolutionise the detection and classification of various
                            cancers.
                        </p>
                    </div>
                    <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
                        <div
                            className="grid grid-cols-1 gap-x-8 gap-y-6 text-base font-semibold leading-7 text-white sm:grid-cols-2 md:flex lg:gap-x-10">
                            <Link to="#">Our team members <span aria-hidden="true">&rarr;</span></Link>
                            <Link to="#">Our values <span aria-hidden="true">&rarr;</span></Link>
                            <Link to="/projects">Meet our AI project <span aria-hidden="true">&rarr;</span></Link>
                        </div>
                        <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex flex-col-reverse">
                                <dt className="text-base leading-7 text-gray-300">Offices worldwide</dt>
                                <dd className="text-2xl font-bold leading-9 tracking-tight text-white">1</dd>
                            </div>
                            <div className="flex flex-col-reverse">
                                <dt className="text-base leading-7 text-gray-300">Full-time colleagues</dt>
                                <dd className="text-2xl font-bold leading-9 tracking-tight text-white">5+</dd>
                            </div>
                            <div className="flex flex-col-reverse">
                                <dt className="text-base leading-7 text-gray-300">Hours per week</dt>
                                <dd className="text-2xl font-bold leading-9 tracking-tight text-white">40</dd>
                            </div>
                            <div className="flex flex-col-reverse">
                                <dt className="text-base leading-7 text-gray-300">Paid time off</dt>
                                <dd className="text-2xl font-bold leading-9 tracking-tight text-white">Unlimited</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <Footer/>




        </div>
    );
}

export default Home;
