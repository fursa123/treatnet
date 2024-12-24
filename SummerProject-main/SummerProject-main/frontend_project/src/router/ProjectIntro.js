import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import NavBar from "../component/NavBar";
import '../css/general.css'
import hostList from "../utils/host";
import Footer from "../component/Footer";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import styled from 'styled-components';
import Heading from '../component/Heading';

function ProjectIntro() {
    const [userInput, setUserInput] = useState('');
    const [chatbotResponse, setChatbotResponse] = useState('');
    const [isStaff, setIsStaff] = useState(0);
    const [token, setToken] = useState('');
    const [chatContent, setChatContent] = useState([])
    const msgEndRef = useRef(null)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSendMsg = (e) => {
        // chatContent.push({'to':true,'data':userInput})
        setChatContent(prevMessages => [...prevMessages, { 'to': true, 'data': userInput }]);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ "role": "user", "content": userInput }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer sk-proj-Vk0woAFAaoQH5sr6Ilk8T3BlbkFJPXSiuAbPD52FLsKkvEHO`
                }
            });
            setChatbotResponse(response.data.choices[0].message.content.trim());
            chatContent.push({ 'to': false, 'data': response.data.choices[0].message.content.trim() })
            setUserInput('')
        } catch (error) {
            console.error("Error fetching data from OpenAI:", error);
            setChatbotResponse("Sorry, I couldn't process your request. Please try again later.");
        }
    };

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsStaff(Cookies.get('isStaff'))
        setToken(Cookies.get('token'))
    }, [chatbotResponse]);

    const StyledButton = styled.button`
        width: 250px; 
        height: 50px;  

        background-color: white;
        color: rgba(28, 100, 242, 0.8);
        border: 0.8px solid rgba(120, 120, 120, 0.8);
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        border-radius: 15px;
        &:hover {
            background-color: rgba(28, 100, 242, 0.8);
            color: white;
        }
    `;

    return (
        <div>
            <NavBar />
            <Heading title="AI Chatbot"/>
            {/*border of chat bot*/}
            <div className="mx-10 my-5 p-5 flex flex-col w-full max-w-lg h-screen max-h-[600px] mx-auto border border-gray-300 rounded-lg overflow-hidden" id={'chatBox'}>
                {/* <h1 className={'title'}>AI Medical Chatbot</h1> */}

                <div id={'chat-container'} className={'flex-1 p-4 overflow-y-auto'}>
                    <div class="flex items-start gap-2.5 my-10">
                        <img className="w-8 h-8 rounded-full" src={`http://` + hostList.backend + `/media/summer_project/chat-bot.webp`}
                            alt="Jese image" />
                        <div
                            class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">Medical Chat bot</span>
                                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{new Date().getHours()}:{new Date().getMinutes() < 10 ? `0` + new Date().getMinutes() : new Date().getMinutes()}</span>
                            </div>
                            <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">Hello! How can I assist you today?</p>
                            {/*<span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>*/}

                            {token ? (
                                (isStaff == 0) ?
                                    (<div>
                                        <ul>
                                            <li>
                                                <br></br>
                                                <Link to={"/contact-dr"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>Contact a Doctor</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/patient-calendar"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View Existing Appointments</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/message"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View Messages</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/profile"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View Your Profile</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/symptoms"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>Update Your New Symptoms</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/risk-factors"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>Update Your Risk factors</StyledButton>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>)
                                    :
                                    (<div>
                                        <ul>
                                            <li>
                                                <br></br>
                                                <Link to={"/drhome"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>
                                                        Doctor Home
                                                    </StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/findpatient"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>
                                                        Find Patients
                                                    </StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/calendar"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View calendar</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/message"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View Messages</StyledButton>
                                                </Link>
                                            </li>
                                            <li>
                                                <br></br>
                                                <Link to={"/drprofile"}
                                                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                    <StyledButton>View Your Profile</StyledButton>
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>)

                            )
                                :
                                (<div>
                                    <ul>
                                        <li>
                                            <br></br>
                                            <Link to={"/login"}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <StyledButton>Login</StyledButton>
                                            </Link>
                                        </li>
                                        <li>
                                            <br></br>
                                            <Link to={"/register"}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <StyledButton>Register</StyledButton>
                                            </Link>
                                        </li>
                                        <li>
                                            <br></br>
                                            <Link to={"/"}
                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                <StyledButton>About Us</StyledButton>
                                            </Link>
                                        </li>
                                    </ul>
                                </div>)
                            }

                            <div>
                                <p class="text-sm font-normal py-2.5 text-gray-500 dark:text-white">
                                    <br></br>Help us improve!
                                    <a className="text-sm text-blue-600 dark:text-blue-500 hover:underline" href="/feedback"> Provide your Feedback</a>
                                </p>
                            </div>

                        </div>
                    </div>

                    {chatContent?.map(item => item.to ? (
                        <div class="flex items-start gap-2.5 ml-10 my-10">
                            <div
                                class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-s-xl rounded-es-xl rounded-b-xl dark:bg-gray-700">
                                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Medical Chat bot</span>
                                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{new Date().getHours()}:{new Date().getMinutes() < 10 ? `0` + new Date().getMinutes() : new Date().getMinutes()}</span>
                                </div>
                                <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{item.data}</p>
                                {/*<span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>*/}
                            </div>
                            <img className="w-8 h-8 rounded-full" src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                alt="Jese image" />
                        </div>
                    ) : (
                        <div class="flex items-start gap-2.5 my-10">
                            <img className="w-8 h-8 rounded-full" src={`http://` + hostList.backend + `/media/summer_project/chat-bot.webp`}
                                alt="Jese image" />
                            <div
                                class="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                <div class="flex items-center space-x-2 rtl:space-x-reverse">
                                    <span class="text-sm font-semibold text-gray-900 dark:text-white">Medical Chat bot</span>
                                    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">{new Date().getHours()}:{new Date().getMinutes() < 10 ? `0` + new Date().getMinutes() : new Date().getMinutes()}</span>
                                </div>
                                <p class="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{item.data}</p>
                                {/*<span class="text-sm font-normal text-gray-500 dark:text-gray-400">Delivered</span>*/}
                            </div>
                        </div>
                    ))}
                    <div ref={msgEndRef} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex items-center">
                        <input
                            type="text"
                            id="userInput"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            required
                            className="border p-2 w-full h-10"
                            placeholder="Enter your medical query here"
                        />
                        <button
                            onClick={handleSendMsg}
                            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 ml-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                            Send
                        </button>
                    </div>
                </form>
            </div>

            {/*<hr />*/}
            {/*<div className={'mx-10'}>*/}
            {/*    <h2 className={'title'}>Our AI model</h2>*/}
            {/*</div>*/}


            {/* <Footer /> */}

        </div>
    );
}

export default ProjectIntro;
