import React, { useEffect, useRef, useState } from 'react';
import NavBar from "../component/NavBar";
import hostList from "../utils/host";
import Cookies from "js-cookie";
import { get_doctor_profile_patient_byId } from "../api/Doctor";
import { get_patient_profile_doctor_byId } from "../api/Patient";
import { getAllTargetMessage, getChannelId, getContactorList, getUserProfile } from "../api/Home";
import { Link } from "react-router-dom";
import Heading from "../component/Heading";

function Message(props) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [channelId, setChannelId] = useState(0)
    const [ws, setWs] = useState(null)
    const [userData, setUserData] = useState({})
    const [targetId, setTargetId] = useState(-1)
    const msgEndRef = useRef(null)
    const [contactors, setContactors] = useState([])
    const [targetAvatar, setTargetAvatar] = useState('')
    const [selectedDrProfile, setSelectedDrProfile] = useState([])
    const [selectedPtProfile, setSelectedPtProfile] = useState([])
    const [isStaff, setIsStaff] = useState(0)

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let token = Cookies.get('token')
        getUserProfile({}, token).then(res => {
            setUserData(res.data)
        })
    }, [])

    useEffect(() => {
        refreshContactor()

        const interval = setInterval(refreshContactor, 10000)
        return () => clearInterval(interval)
    }, [])

    const refreshContactor = () => {
        getContactorList({}, Cookies.get('token')).then(res => {
            let sorted_list = res.data.data
            sorted_list = sorted_list.sort((a, b) => new Date(b.last_timestamp) - new Date(a.last_timestamp));
            setContactors(sorted_list)
        })
    }

    useEffect(() => {
        let token = Cookies.get('token')
        if (targetId === -1) {
            return
        }
        getChannelId({ 'target_id': targetId }, token).then(res => {
            setChannelId(res.data.channel_id)
            setTargetAvatar(res.data.avatar)
        })

    }, [targetId]);

    useEffect(() => {
        if (channelId === 0) {
            return
        }
        const socket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${channelId}/`);
        setWs(socket)

        getAllTargetMessage({ 'channel_id': channelId }, Cookies.get('token')).then(res => {
            setMessages(res.data.messages)
        })

        socket.onopen = function (event) {
        }

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            setMessages(prevMessages => [...prevMessages, data.message]);
            refreshContactor()
        };

        socket.onclose = function (e) {
            console.error('Chat socket closed');
        };

        return () => {
            socket.close();
        };
    }, [channelId])

    const sendMessage = () => {
        if (targetId !== -1 && ws && message.trim()) {
            ws.send(JSON.stringify({
                'user_id': userData.id,
                'message': message
            }));
            setMessage('');
            refreshContactor()
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const handleClickContactor = (target_id, target_username) => {
        setTargetId(target_id);

        let token = Cookies.get('token');
        setIsStaff(Cookies.get('isStaff'))
        let id = target_id
        if (Number(Cookies.get('isStaff')) === 0) {
            get_doctor_profile_patient_byId('/patient/patient/get_doctor_profile_patient_byId/' + token + '/', { id }).then(res => {
                setSelectedDrProfile(res.data);
            }).catch(error => {
                console.error('Error fetching doctor profile:', error);
            });
        } else {
            get_patient_profile_doctor_byId('/patient/doctor/get_patient_profile_doctor_byId/' + token + '/', { id }).then(res => {
                setSelectedPtProfile(res.data.data);
            }).catch(error => {
                console.error('Error fetching patient profile:', error);
            });
        }
    };

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={'bg-blue-500'} style={{ height: document.documentElement.clientHeight }}>
            <NavBar />
            <div>
                <div class="border-2">
                    <div class="flex flex-row justify-between bg-white">
                        <div class="flex flex-col w-2/5 border-r-2 overflow-y-auto" style={{ height: '680px' }}>

                            <div class="border-b-2 py-4 px-2">
                                <input
                                    type="text"
                                    placeholder="search chatting"
                                    class="py-2 px-2 border-2 border-gray-200 rounded-2xl w-full"
                                />
                            </div>

                            {Array.isArray(contactors) && contactors.map(item => (
                                <div key={item.target_id} onClick={() => handleClickContactor(item.target_id, item.target_username)}
                                    style={{ cursor: 'pointer' }}
                                    className={`flex flex-row py-4 px-2 justify-center items-center border-b-2 ${targetId === item.target_id ? 'bg-blue-500 text-white' : ''
                                        }`}
                                >
                                    <div class="w-1/4">
                                        {item.avatar === '' ? (<img
                                            src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                            className="object-cover h-12 w-12 rounded-full"
                                            alt=""
                                        />)
                                            : (<img
                                                src={item.avatar}
                                                className="object-cover h-12 w-12 rounded-full"
                                                alt=""
                                            />)}


                                    </div>
                                    <div class="w-full">
                                        <div
                                            class="text-lg font-semibold">{item.target_forename} {item.target_surname}</div>
                                        <div className={'flex justify-between items-center'}>
                                            {/*21 characters*/}
                                            <span class="text-gray-600">{item.last_message.substring(0, 21)}</span>
                                            <span
                                                className={'text-sm text-gray-300'}> {item.last_timestamp.split('T')[0]}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </div>
                        <div class="w-full px-5 flex flex-col justify-between ">
                     <div class="flex flex-col mt-5 overflow-y-auto" style={{ height: '590px' }}>
                         {targetId === -1 ? (
                           <div className="flex items-center justify-center h-full">
                           <p className="text-gray-500 text-lg">Please select someone to message</p>
                      </div>
                     ) : (
                     Array.isArray(messages) && messages.map(item => (
                        item.user === userData.id ? ( <div class="flex justify-end mb-4">
                              <div 
                                 class="mr-2 py-3 px-4 bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white"
                              >
                                 {item.content}
                           </div>
                           {userData.avatar === null ? (<img
                                src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                className="object-cover h-8 w-8 rounded-full"
                                alt=""
                            />) : 
                            (<img
                                src={`http://` + hostList.backend + `/media/summer_project/default_avatar/` + userData.avatar.split('/').at(-1)}
                                className="object-cover h-8 w-8 rounded-full"
                                alt=""
                            />)}
                    </div>) : (<div class="flex justify-start mb-4">
                        <Link to={"/detailed-pt?username=" + item.username}>
                            {targetAvatar === '' ? (<img
                                    src={`http://` + hostList.backend + `/media/summer_project/default-avatar.jpeg`}
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />) : 
                                (<img
                                    src={targetAvatar}
                                    className="object-cover h-8 w-8 rounded-full"
                                    alt=""
                                />)}
                            </Link>
                        <div 
                           class="ml-2 py-3 px-4 bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white"
                        >
                            {item.content}
                        </div>
                    </div>
                  ))))}
               <div ref={msgEndRef} />
             </div>
                     <div class="py-5 flex h-20">
                        <input
                            className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                            type="text" onKeyDown={handleKeyDown} value={message}
                            placeholder="type your message here..." onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="button" onClick={sendMessage}
                            className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 ml-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                            Submit
                        </button>
                    </div>
                </div>
                        <div class="w-2/5 border-l-2 px-5">
                            {Number(isStaff) === 0 ? (
                                <div>
                                    {targetId === -1 ? (
                                        <div></div>
                                    )
                                        : (
                                            <div className="px-4 py-5 sm:px-6">
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.username}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.forename}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.surname}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Experience Years</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.experience_years}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Seniority</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.seniority}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">School</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.school}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Specialty</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.specialty}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                                                    <p className="text-sm text-gray-900">{selectedDrProfile.gender}</p>
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div>
                                    {targetId === -1 ? (
                                        <div></div>
                                    )
                                        : (
                                            <div className="px-4 py-5 sm:px-6">
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Username</h4>
                                                    <p className="text-sm text-gray-900">{selectedPtProfile.username}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Forename</h4>
                                                    <p className="text-sm text-gray-900">{selectedPtProfile.forename}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Surname</h4>
                                                    <p className="text-sm text-gray-900">{selectedPtProfile.surname}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                                                    <p className="text-sm text-gray-900">{selectedPtProfile.gender}</p>
                                                </div>

                                                <div className="px-4 py-5 sm:px-6 justify-end">
                                                    {isStaff === '1' ? (
                                                        <Link to={`/detailed-pt?username=${selectedPtProfile.username}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                                                Check Patient Information
                                                            </button>
                                                        </Link>
                                                    ) : isStaff === '2' ? (
                                                        <Link to={`/nutritionist-pt?username=${selectedPtProfile.username}`} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                                                Check Patient Information
                                                            </button>
                                                        </Link>
                                                    ) : (
                                                        <p>Invalid staff type</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Message;