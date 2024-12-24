import React, {useEffect, useState} from 'react';
import NavBar from "../component/NavBar";
import {addFeedback} from "../api/Home";
import Heading from '../component/Heading';

function Feedback(props) {
    const [content, setContent] = useState('')
    const [email, setEmail] = useState('')
    const [reminder, setReminder] = useState('')

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const submitForm = (e) => {
        e.preventDefault()
        if (content === '' || email === '') {
            setReminder('Cannot submit empty email or content')
            return
        }
        addFeedback({'email': email, 'content': content}).then(res => {
            if (res.status === 200) {
                setContent('')
                setEmail('')
                setReminder('Submit success, thanks for your feedback')
            } else {
                setReminder('Unknown problem')
            }
        })
    }

    return (
        <div>
            <NavBar/>
            <div className={'grid grid-cols-3'}>
                <div></div>
                <div>
                    <Heading title="Leave your feedback"/>
                    <ol className="relative border-s border-gray-200 dark:border-gray-700">
                        <li className="mb-10 ms-4">
                            <div
                                class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time
                                className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">May
                                2024
                            </time>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Linked our users to
                                professional doctors in our platform</h3>
                            <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">Help doctors to
                                prescribe the right medication and recommend specific radiotherapy treatments and
                                chemotherapy treatments.</p>
                        </li>
                        <li className="mb-10 ms-4">
                            <div
                                class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time
                                className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">June
                                2024
                            </time>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Linked our users to our
                                large AI models</h3>
                            <p class="text-base font-normal text-gray-500 dark:text-gray-400">Use AI to help doctors to
                                prescribe the right medication and recommend specific radiotherapy treatments and
                                chemotherapy treatments</p>
                        </li>
                        <li className="ms-4">
                            <div
                                class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                            <time
                                className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">July
                                2024
                            </time>
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Linked our users to our
                                nutritionist and dietitian</h3>
                            <p class="text-base font-normal text-gray-500 dark:text-gray-400">Create Gut Health guidance
                                i.e. (Meal Plans) and offer Alternative Lifestyle Guidance i.e. (Exercises Plans)
                                for users.</p>
                        </li>
                    </ol>

                    <form onSubmit={submitForm}>
                        <textarea id="message" rows="4" value={content}
                                  className="block p-2.5 my-5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder="Write your thoughts here..."
                                  onChange={(e) => setContent(e.target.value)}></textarea>
                        <label htmlFor="input-group-1"
                               className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Leave your Email
                            for
                            future contact</label>
                        <div class="relative mb-6">
                            <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                    <path
                                        d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                                    <path
                                        d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                                </svg>
                            </div>
                            <input type="email" id="input-group-1" onChange={(e) => setEmail(e.target.value)}
                                   value={email}
                                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                   placeholder="name@qict.com"/>
                        </div>

                        <button type="submit"
                                className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">Submit
                        </button>

                        {reminder!==''&&<span class=" mx-5 bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{reminder}</span>}

                    </form>
                </div>
                <div>

                </div>

            </div>
        </div>
    );
}

export default Feedback;