import React, {useEffect, useRef, useState} from 'react';
import NavBar from '../../component/NavBar';
import BackButton from '../../component/BackButton';
import Footer from "../../component/Footer";
import {submitUnspecifiedSymptom} from "../../api/Patient";
import Cookies from "js-cookie";
import {useNavigate} from "react-router-dom";
import Heading from '../../component/Heading';

let totalPage = 3

function Symptoms() {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [pageNum, setPageNum] = useState(0)
    const progressBar = useRef();
    const [otherInfo, setOtherInfo] = useState('')
    const navigate = useNavigate();
    const [success, setSuccess]= useState(false)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleSymptom = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
        } else {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    useEffect(() => {
        progressBar.current.style.width = (pageNum * 100) / totalPage + '%'
    }, [pageNum])
    const prePage = () => {
        if (pageNum === 0) {
            return
        }
        setPageNum(pageNum - 1)
    }

    const nextPage = () => {
        if (pageNum === totalPage) {
            return
        }
        setPageNum(pageNum + 1)
    }

    const submitForm = () => {
        submitUnspecifiedSymptom(Cookies.get('token'), {
            'selectedSymptoms': selectedSymptoms,
            'otherInfo': otherInfo
        }).then(res => {
            if(res.status===200){
                setSuccess(true)
            }
        })
    }

    useEffect(() => {
        if(success){
            const timer = setTimeout(() => {
                navigate('/patient-home')
            }, 1500); // 3秒延迟

            // 清除定时器
            return () => clearTimeout(timer);
        }

    }, [success]);

    return (
        <div>
            <NavBar/>
            <Heading title="Please enter your symptoms"/>
            <BackButton to="/patient-home"/>
            <div className="bg-white">
                <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <p className="mt-4 text-lg leading-6 text-gray-600">
                            Have you experienced any of the following symptoms in the last 30 days?
                        </p>
                    </div>
                </div>

                <div className={'grid grid-cols-3'}>
                    <div></div>
                    <div>
                        <div className={'mb-8'}>
                            <div class="flex justify-between mb-1">
                                <span class="text-base font-medium text-blue-700 dark:text-white">Progress</span>
                                <span
                                    class="text-sm font-medium text-blue-700 dark:text-white">{((pageNum / totalPage) * 100).toFixed(0)} %</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div class="bg-blue-600 h-2.5 rounded-full" ref={progressBar}></div>
                            </div>
                        </div>


                        <fieldset>
                            <legend class="sr-only">Checkbox variants</legend>
                            {pageNum === 0 && (<div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(0)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Unexplained
                                            Weight
                                            Loss</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Losing weight
                                            without trying, particularly if it is more than 10 pounds.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(1)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Fatigue</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Persistent and
                                            unexplained tiredness that does not improve with rest.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(2)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Fever</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Frequent or
                                            persistent fever without an obvious infection.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(3)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Pain</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Unexplained or
                                            persistent pain in any part of the body.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(4)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Skin
                                            Changes</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Changes in skin
                                            colour, new growths, or sores that do not heal.</p>
                                    </div>
                                </div>
                            </div>)}
                            {pageNum === 1 && (<div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(5)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Changes in Bowel
                                            or Bladder Habits</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Prolonged
                                            changes such as diarrhoea, constipation, or frequent urination.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(6)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Unexplained
                                            Bleeding or Bruising</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Unexpected
                                            bleeding or bruising without known cause.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(7)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Lumps or
                                            Masses</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">New lumps or
                                            masses in any body part, particularly in the breasts, testicles, lymph
                                            nodes, or soft tissues.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(8)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Persistent Cough
                                            or Hoarseness</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">A cough that
                                            does not go away or changes in the voice.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(9)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Difficulty
                                            Swallowing</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Persistent
                                            trouble swallowing or feeling like food is stuck in the throat.</p>
                                    </div>
                                </div>
                            </div>)}
                            {pageNum === 2 && (<div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(10)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Appetite
                                            Loss</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Loss of appetite
                                            or feeling full quickly.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(11)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Night
                                            Sweats</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Drenching night
                                            sweats without an obvious reason.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(12)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Swollen Lymph
                                            Nodes</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Enlarged lymph
                                            nodes, particularly in the neck, armpits, or groin.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(13)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Neurological
                                            Symptoms</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Headaches,
                                            seizures, or vision changes without an obvious cause.</p>
                                    </div>
                                </div>
                                <div class="flex mb-4">
                                    <div class="flex items-center h-5">
                                        <input id="helper-checkbox" aria-describedby="helper-checkbox-text"
                                               type="checkbox" onChange={() => toggleSymptom(14)}
                                               value=""
                                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                    </div>
                                    <div class="ms-2 text-sm">
                                        <label htmlFor="helper-checkbox"
                                               className="font-medium text-gray-900 dark:text-gray-300">Abdominal Pain
                                            or Bloating</label>
                                        <p id="helper-checkbox-text"
                                           class="text-xs font-normal text-gray-500 dark:text-gray-400">Persistent
                                            discomfort, bloating, or feeling of fullness.</p>
                                    </div>
                                </div>
                            </div>)}
                            {pageNum === 3 && (<div>
                                <form className="max-w-sm mx-auto mb-5">
                                    <label htmlFor="message"
                                           className="block text-sm font-medium text-gray-900 dark:text-white">Other
                                        symptoms</label>
                                    <p id="helper-checkbox-text"
                                       class="text-xs mb-2 font-normal text-gray-500 dark:text-gray-400">This part will
                                        help improve accuracy of diagnosis from doctors</p>
                                    <textarea id="message" rows="4"
                                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                              placeholder="Leave some information..."
                                              onChange={(e) => setOtherInfo(e.target.value)}></textarea>
                                </form>
                            </div>)}


                            <div class="inline-flex rounded-md shadow-sm" role="group">
                                {pageNum !== 0 && <button type="button" onClick={prePage}
                                                          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    Pre
                                </button>}
                                {pageNum !== totalPage && <button type="button" onClick={nextPage}
                                                                  className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    Next
                                </button>}
                                {pageNum === totalPage && <button type="button" onClick={submitForm}
                                                                  className="py-2 ml-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Submit</button>
                                }
                            </div>
                            {success&&(
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
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                  strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )}


                        </fieldset>
                    </div>
                    <div></div>
                </div>

                <Footer/>
            </div>

        </div>
    );
}

export default Symptoms;
