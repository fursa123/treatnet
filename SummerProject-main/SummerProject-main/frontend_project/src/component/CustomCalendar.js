import React, { useEffect, useState } from 'react';
import Calendar from "react-calendar";
import Cookies from "js-cookie";
import { getUserAppointment } from "../api/Home";
import axios from 'axios'; 
import request from '../utils/request';

function CustomCalendar(props) {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDetailedAppointment, setShowDetailedAppointment] = useState(true);
    const [selectedAppointments, setSelectedAppointments] = useState([]);
    const [zoomMessage, setZoomMessage] = useState('');
    const [doctorNames, setDoctorNames] = useState({});

    useEffect(() => {
        getUserAppointment({}, Cookies.get('token')).then(res => {
            setAppointments(res.data);
        });
    }, []);

    useEffect(() => {
        const selectedDateAppointments = appointments.filter(appointment =>
            new Date(appointment.reservation_date).toDateString() === selectedDate.toDateString()
        ).sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date));
        setSelectedAppointments(selectedDateAppointments);
    }, [selectedDate, appointments]);

    useEffect(() => {
        const fetchDoctorNames = async () => {
            const names = {};
            for (const appointment of appointments) {
                if (appointment.doctor && !names[appointment.doctor]) {
                    try {
                        const response = await request.get(`/patient/patient/user_full_name/${appointment.doctor}`);
                        if (response.status === 200) {
                            names[appointment.doctor] = response.data.full_name;
                        }
                    } catch (error) {
                        console.error('Error fetching doctor name', error);
                    }
                }
            }
            setDoctorNames(names);
        };

        fetchDoctorNames();
    }, [appointments]);

    const selectTile = (e) => {
        setSelectedDate(e);
        setShowDetailedAppointment(false);
    }

    const handleCancel = (appointmentId) => {
        const token = Cookies.get('token');
        axios.post(`http://127.0.0.1:8000/patient/patient/cancel_appointment/${token}/`, { appointment_id: appointmentId })
        .then(response => { 
                // Refresh the appointments after a successful cancellation
                getUserAppointment({}, token).then(res => {
                    setAppointments(res.data);
                });
            })
            .catch(error => {
                console.error('There was an error canceling the appointment!', error);
            });
    }

    const handleZoomClick = () => {
        const isStaff = Cookies.get('isStaff');
        if (isStaff === '0') { 
            setZoomMessage('The doctor will send you the meeting ID and passcode via "Messages" - 10 minutes before the appointment starts.');
            window.open('http://127.0.0.1:9999', '_blank');
        } else {
            window.open('https://zoom.us/meeting#/upcoming', '_blank');
        }
    };

    return (
        <div>
            <div className="calendar-container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                <Calendar
                    onChange={selectTile}
                    value={selectedDate}
                    tileContent={({ date, view }) =>
                        view === 'month' && appointments.some(appointment =>
                            new Date(appointment.reservation_date).toDateString() === date.toDateString()
                        ) ? (
                            <div className="tile-content">
                                {appointments.filter(appointment =>
                                    new Date(appointment.reservation_date).toDateString() === date.toDateString()
                                ).sort((a, b) => new Date(a.reservation_date) - new Date(b.reservation_date)).map((appointment, index) => (
                                    <div key={index} className="appointment">
                                        {Cookies.get('isStaff') !== '0' ? (new Date(appointment.reservation_date).toLocaleTimeString() + ' - ' + appointment.patient) :
                                            (new Date(appointment.reservation_date).toLocaleTimeString() + ' - ' + (doctorNames[appointment.doctor] || appointment.doctor))}
                                    </div>
                                ))}
                            </div>
                        ) : null
                    }
                />

                <div tabIndex="-1" aria-hidden="true" hidden={showDetailedAppointment}
                     className="overflow-y-auto overflow-x-hidden fixed z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div className="relative p-4 w-full max-w-2xl max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                            <div
                                className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Appointments on {selectedDate.toDateString()} <div className={'font-thin text-sm text-gray-500'}>select username to see details</div>
                                </h3>
                                <button type="button" onClick={() => setShowDetailedAppointment(true)}
                                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                        data-modal-hide="default-modal">
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                    </svg>
                                    <span className="sr-only">Close modal</span>
                                </button>
                            </div>
                            <div className="p-4 md:p-5 space-y-4">
                                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                                    <table
                                        className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead
                                            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">
                                                Username
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Reservation Time
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Action
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                                Join Meeting
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {selectedAppointments.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-lg text-gray-600">
                                                    No appointments on this day.
                                                </td>
                                            </tr>
                                        ) :
                                            selectedAppointments.map((appointment, index) => (
                                                <tr key={index} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                                    <th scope="row"
                                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {Cookies.get('isStaff') === '0' ? (
                                                            <a href={`/dr-profile?username=${appointment.doctor}`} className={'text-blue-500'}>
                                                                Dr {doctorNames[appointment.doctor] || appointment.doctor}
                                                            </a>
                                                        ) : (
                                                            <a href={`/detailed-pt?username=${appointment.patient}`} className={'text-blue-500'}>
                                                                {appointment.patient}
                                                            </a>
                                                        )}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        {new Date(appointment.reservation_date).toLocaleTimeString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => handleCancel(appointment.id)} 
                                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                            Cancel
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button onClick={handleZoomClick} 
                                                                className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                                            Join
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        </tbody>
                                    </table>
                                </div>
                                {zoomMessage && (
                                    <div className="mt-4 p-4 bg-blue-100 text-blue-700 border border-blue-400 rounded">
                                        {zoomMessage}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomCalendar;
