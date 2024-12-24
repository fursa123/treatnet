import React, {useState, useEffect} from 'react';
import NavBar from '../../component/NavBar';
import BackButton from '../../component/BackButton';
import Footer from "../../component/Footer";
import breast from '../../static/breast.png'
import lung from '../../static/lung.png'
import oarium from '../../static/oarium.png'
import prostate from '../../static/prostate.png'
import colorectal from '../../static/colorectal.png'
import Heading from '../../component/Heading';

function RiskFactors() {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            <NavBar/>
            <Heading title="Risk Prediction"/>
            <BackButton to="/patient-home"/>

            <div className={'grid grid-cols-3 mx-5 mt-16'}>
                <div className={'flex items-center justify-center mb-8'}>
                    <div
                        class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <a href="/risk-factors-question?type=lung">
                            <img className="rounded-t-lg" src={lung} alt=""/>
                        </a>
                        <div class="p-5">
                            <a href={"/risk-factors-question?type=lung"}>
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lung Cancer Prediction</h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Using our self-made AI models to predict potential possibility of lung cancer</p>
                            <a href={"/risk-factors-question?type=lung"}
                               className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Click here
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className={'flex items-center justify-center mb-8'}>
                    <div
                        class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <a href="/risk-factors-question?type=breast">
                            <img className="rounded-t-lg" src={breast} alt=""/>
                        </a>
                        <div class="p-5">
                            <a href="/risk-factors-question?type=breast">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Breast Cancer Prediction</h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">To be developed</p>
                            <br></br>
                            <a href="/risk-factors-question?type=breast"
                               className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Read more
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className={'flex items-center justify-center mb-8'}>
                    <div
                        class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <a href="/risk-factors-question?type=bowel">
                            <img className="rounded-t-lg" src={colorectal} alt=""/>
                        </a>
                        <div class="p-5">
                            <a href="/risk-factors-question?type=bowel">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bowel Cancer Prediction</h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Using our self-made AI models to predict potential possibility of bowel cancer</p>
                            <br></br>
                            <a href="/risk-factors-question?type=bowel"
                               className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Click here
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className={'flex items-center justify-center mb-8'}>
                    <div
                        class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <a href="/risk-factors-question?type=ovarian">
                            <img className="rounded-t-lg" src={oarium} alt=""/>
                        </a>
                        <div class="p-5">
                            <a href="/risk-factors-question?type=ovarian">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Ovarian Cancer Prediction</h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">To be developed</p>
                            <br></br>
                            <a href="/risk-factors-question?type=ovarian"
                               className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Read more
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className={'flex items-center justify-center mb-8'}>
                    <div
                        class="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                        <a href="/risk-factors-question?type=prostate">
                            <img className="rounded-t-lg" src={prostate} alt=""/>
                        </a>
                        <div class="p-5">
                            <a href="/risk-factors-question?type=prostate">
                                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Prostate Cancer Prediction</h5>
                            </a>
                            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">To be developed</p>
                            <br></br>
                            <a href="/risk-factors-question?type=prostate"
                               className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Read more
                                <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                          stroke-width="2"
                                          d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>


            <Footer/>
        </div>
    );
}

export default RiskFactors;
