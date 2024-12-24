import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import BackButton from '../../component/BackButton';
import NavBar from "../../component/NavBar";
import styled from 'styled-components';
import Footer from "../../component/Footer";
import {
    submitCancerSymptom,
} from "../../api/Patient";
import Cookies from "js-cookie";
import {
    getBowelCancerQuestions,
    getBreastCancerQuestions,
    getLungCancerQuestions,
    getOvarianCancerQuestions, getProstateCancerQuestions
} from "../../utils/QuestionnaireList";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function RiskFactorQuestions(props) {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const query = useQuery();
    const [answer, setAnswer] = useState([])
    const [warning, setWarning] = useState(false)
    const [success, setSuccess] = useState(false)
    const [cancerType, setCancerType] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(res => {
        let t = query.get('type')
        setCancerType(t);
        if (t === 'lung') {
            setQuestions(getLungCancerQuestions())
        } else if (t === 'bowel') {
            setQuestions(getBowelCancerQuestions())
        } else if (t === 'breast') {
            setQuestions(getBreastCancerQuestions())
        } else if (t === 'ovarian') {
            setQuestions(getOvarianCancerQuestions())
        } else if (t === 'prostate') {
            setQuestions(getProstateCancerQuestions())
        } else {
            navigate('/404')
        }

    }, [])

    useEffect(res => {
        if (Array.isArray(questions)) {
            setAnswer(Array(questions.length).fill(-1))
        }
    }, [questions])

    const handleChangeChoice = (index, value) => {
        setAnswer(prevAnswer =>
            prevAnswer.map((item, idx) => (idx === index ? value : item))
        );
    }

    const submitForm = () => {
        if (answer.includes(-1)) {
            setWarning(true)
        } else {
            submitCancerSymptom(Cookies.get('token'), {'answer': answer}, cancerType).then(res => {
                if (res.status === 200) {
                    setSuccess(true)
                }
            })
        }
    }

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                navigate('/patient-home')
            }, 1500); // 3秒延迟

            // 清除定时器
            return () => clearTimeout(timer);
        }

    }, [success]);

    const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    max-width: 4xl;
    padding: 0 110px;
    margin-top: 30px;
    margin-bottom: 30px;
    `;

    return (
        <div className='bg-white w-full'>
            <NavBar/>
            <BackButton to="/patient-home" />
            <div className="w-full flex justify-start mt-0.5">
            <button type="button" onClick={() => navigate('/risk-factors')}
                    className="py-1 px-4 bg-gray-500 text-white font rounded shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75">
                Go back
            </button>
        </div>
            <HeaderContainer>
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-[#003A9A] sm:text-4xl">
                    Please answer the following questions:
                    </h1>
                    <p className="mt-4 text-lg leading-6 text-gray-600"></p>
                </div>
            </HeaderContainer>
            <div className='w-full'>
                <div className='grid grid-cols-2 gap-8 w-full'>
                    {/*single element*/}
                    {Array.isArray(questions) && questions.map((item, i) => (
                        <div className='bg-white p-6 rounded-lg shadow-md' key={i}>
                            <div>
                                <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{item.topic}</h5>
                                <p class="font-normal text-gray-700 text-gray-400">{item.detailed_question}</p>
                            </div>
                            <fieldset>
                                <div className={'space-y-4'}>

                                    {item.choices.length === 0 && (
                                        <form className="max-w-sm mx-auto bg-white">
                                            <input type="number" id="number-input"
                                                   onChange={(e) => handleChangeChoice(i, e.target.value)}
                                                   aria-describedby="helper-text-explanation"
                                                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 placeholder-gray-400 dark:text-white focus:ring-blue-500 dark:focus:border-blue-500"
                                                   placeholder="0" required/>
                                        </form>
                                    )}
                                    {item.choices.length !== 0 && item.choices.map((choice, index) => (
                                            <div class="flex items-center mx-4">
                                                <input id="option-1" type="radio" name={item.topic}
                                                       value={item.value[index]}
                                                       onChange={(e) => handleChangeChoice(i, e.target.value)}
                                                       className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 dark:focus:bg-blue-600 dark:bg-gray-700 dark:border-gray-600"/>
                                                <label htmlFor="option-1"
                                                       className="block ms-2  text-sm font-medium text-gray-900 dark:text-gray-300">
                                                    {choice}
                                                </label>
                                            </div>
                                        )
                                    )}


                                </div>

                            </fieldset>
                        </div>
                    ))}

                    {/*element end*/}
                    <div class="inline-flex rounded-md shadow-sm" role="group">
                        <button type="button" onClick={submitForm}
                                className="py-2 px-4 bg-blue-500 text-white font rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">Submit
                        </button>
                    </div>
                    {warning && <div id="toast-danger"
                                     class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
                                     role="alert">
                        <div
                            class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg bg-red-800 text-red-200">
                            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                 fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                            </svg>
                            <span class="sr-only">Error icon</span>
                        </div>
                        <div class="ms-3 text-sm font-normal">Some options not be chosen</div>
                        <button type="button" onClick={() => setWarning(false)}
                                className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                                aria-label="Close">
                            <span class="sr-only">Close</span>
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                 viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                        </button>
                    </div>}

                    {success && (
                        <div id="toast-success"
                             class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800"
                             role="alert">
                            <div
                                class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                     fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                                </svg>
                                <span class="sr-only">Check icon</span>
                            </div>
                            <div class="ms-3 text-sm font-normal">Well done! please wait a second for upload.</div>
                            <button type="button"
                                    className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                                    data-dismiss-target="#toast-success" aria-label="Close">
                                <span class="sr-only">Close</span>
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                     fill="none"
                                     viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <div>
                </div>
            </div>

            <Footer/>
        </div>
    );
}

export default RiskFactorQuestions;