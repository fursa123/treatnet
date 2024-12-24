import React, { useState, useEffect } from 'react';
import NavBar from '../../component/NavBar';
import BackButton from '../../component/BackButton';
import styled from 'styled-components';
import { addAppointment, searchAvailableBooking } from "../../api/Patient";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import '../../css/general.css';
import hostList from "../../utils/host";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import Heading from '../../component/Heading';

const RectangleContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100vw;
  margin-top: 10px;
`;

const Rectangle = styled.div`
  flex: 1;
  height: 550px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Background = styled(Rectangle)`
  width: 50%;
`;

const RightSection = styled(Rectangle)`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const NavyRectangle = styled.div`
  width: 90%;
  height: 90%;
  background-color: #003A9A;
  padding: 25px;
  border-radius: 10px;
  color: white;
`;

const DoctorList = styled.div`
  margin-top: 15px;
`;

const DoctorItem = styled.button`
  background-color: #ffffff;
  color: #003366;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BookButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 30px;
  border: none;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
`;

const SuccessMessage = styled.div`
  margin-top: 10px;
  color: green;
`;

const WarningMessage = styled.div`
  margin-top: 10px;
  color: red;
`;

const NoDoctorsMessage = styled.div`
  margin-top: 10px;
  color: red;
  text-align: center;
`;

const TimeGridContainer = styled.div`
  margin-top: 10px;
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
`;

const TimeButton = styled.button`
  background-color: #ffffff;
  color: #003366;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
`;

function ContactDr() {
  const [date, setDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableData, setAvailableData] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [doctorIndex, setDoctorIndex] = useState(0);
  const [time, setTime] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [noDoctorsAvailable, setNoDoctorsAvailable] = useState(false);

  let navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    findAvailableDr(new Date());
  }, []);

  const handleBook = () => {
    if (selectedDoctor && time) {
      const now = new Date();
      const dateStr = date.toString();
      const timeStr = time;
      const dateObj = new Date(dateStr);
      const [hours, minutes] = timeStr.split(':').map(Number);
      dateObj.setHours(hours);
      dateObj.setMinutes(minutes);
      dateObj.setSeconds(0);

      const isoFormat = dateObj.toISOString();

      if (dateObj < now) {
        setWarningMessage('Cannot book an appointment in the past');
        setBookingSuccess(false);
        return;
      }

      addAppointment('/patient/patient/add_appointment/' + Cookies.get('token') + '/', {
        'dr_user_id': selectedDoctor,
        'reservation_date': isoFormat
      }).then(res => {
        if (res.status === 200) {
            setBookingSuccess(true);
            setWarningMessage('');
            navigate('/patient-calendar?bookingSuccess=true');
          } else {
            setWarningMessage('Booking unsuccessful. Please try again.');
            setBookingSuccess(false);
            navigate('/patient-calendar?bookingSuccess=false');
          }          
      }).catch(err => {
        setWarningMessage('Failed to book appointment. Please try again.');
        setBookingSuccess(false);
      });
    } else {
      setWarningMessage('Please select a doctor and time to book');
      setBookingSuccess(false);
    }
  };

  const findAvailableDr = (e) => {
    setDate(e);
    const originalDate = new Date(e);
    originalDate.setHours(originalDate.getHours() + 1);
    searchAvailableBooking('/patient/doctor/find_available_booking/', { 'date': originalDate }).then(res => {
      if (res.data.length === 0) {
        setWarningMessage('No doctors available for the selected day');
        setAvailableData([]);
        setNoDoctorsAvailable(true);
      } else {
        const now = new Date();
        const availableTimes = res.data.map(doctor => {
          const uniqueTimes = Array.from(new Set(doctor.available_time.map(time => time.slice(0, 5)))); // Remove seconds and ensure uniqueness
          const sortedTimes = uniqueTimes.filter(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const appointmentTime = new Date(originalDate);
            appointmentTime.setHours(hours);
            appointmentTime.setMinutes(minutes);
            appointmentTime.setSeconds(0);
            return appointmentTime > now || appointmentTime.getDate() > now.getDate();
          }).sort((a, b) => {
            const [aHours, aMinutes] = a.split(':').map(Number);
            const [bHours, bMinutes] = b.split(':').map(Number);
            return aHours - bHours || aMinutes - bMinutes;
          });
  
          return {
            ...doctor,
            available_time: sortedTimes
          };
        });
  
        const noDoctors = availableTimes.every(doctor => doctor.available_time.length === 0);
  
        setAvailableData(availableTimes);
        setWarningMessage('');
        setNoDoctorsAvailable(noDoctors);
        setIsOpen(!noDoctors);
      }
    }).catch(err => {
      setWarningMessage('Failed to fetch available doctors. Please try again.');
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(e);
    selectedDate.setHours(0, 0, 0, 0);
  
    if (selectedDate < today) {
      setWarningMessage('No doctors available for the selected day');
      setAvailableData([]);
      setSelectedDoctor(null);
      setIsOpen(false);
      setNoDoctorsAvailable(true);
    } else {
      const originalDate = new Date(e);
      originalDate.setHours(originalDate.getHours() + 1);
      searchAvailableBooking('/patient/doctor/find_available_booking/', { 'date': originalDate }).then(res => {
        if (res.data.length === 0) {
          setWarningMessage('No doctors available for the selected day');
          setAvailableData([]);
          setSelectedDoctor(null);
          setIsOpen(false);
          setNoDoctorsAvailable(true);
        } else {
          const now = new Date();
          const availableTimes = res.data.map(doctor => {
            const uniqueTimes = Array.from(new Set(doctor.available_time.map(time => time.slice(0, 5)))); // Remove seconds and ensure uniqueness
            const sortedTimes = uniqueTimes.filter(time => {
              const [hours, minutes] = time.split(':').map(Number);
              const appointmentTime = new Date(originalDate);
              appointmentTime.setHours(hours);
              appointmentTime.setMinutes(minutes);
              appointmentTime.setSeconds(0);
              return appointmentTime > now || appointmentTime.getDate() > now.getDate();
            }).sort((a, b) => {
              const [aHours, aMinutes] = a.split(':').map(Number);
              const [bHours, bMinutes] = b.split(':').map(Number);
              return aHours - bHours || aMinutes - bMinutes;
            });
  
            return {
              ...doctor,
              available_time: sortedTimes
            };
          });
  
          const noDoctors = availableTimes.every(doctor => doctor.available_time.length === 0);
  
          setAvailableData(availableTimes);
          setWarningMessage('');
          setIsOpen(!noDoctors);
          setNoDoctorsAvailable(noDoctors);
        }
      }).catch(err => {
        setWarningMessage('Failed to fetch available doctors. Please try again.');
      });
    }
  };
  

  const toggleDropdown = () => {
    if (availableData.length > 0) {
      setIsOpen(!isOpen);
    } else {
      setWarningMessage('No doctors available to select');
    }
  };

  const changeDoctor = (e) => {
    let id = e.target.getAttribute('data-index');
    setDoctorIndex(id);
    setIsOpen(!isOpen);
    setSelectedDoctor(e.target.getAttribute('data-doctor-id'));
  };

  const decideTime = (e) => {
    setTime(e.target.innerText);
    const buttons = document.querySelectorAll('.time-button');
    buttons.forEach(button => button.style.backgroundColor = '#ffffff');
    e.target.style.backgroundColor = '#66B2FF';
  };

  return (
    <div>
      <NavBar />
      <BackButton to="/patient-home" />
      <Heading title="Contact an available doctor"/>
      <RectangleContainer>
        <Background>
          <div className="relative max-w-lg custom-calendar-container">
            <Calendar
              onChange={findAvailableDr}
              value={date}
              tileContent={() => null} 
              tileDisabled={({ date, view }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </div>
        </Background>
        <RightSection>
          <NavyRectangle>
            <h2>Available Doctors</h2>
            <div>
              {noDoctorsAvailable ? (
                <NoDoctorsMessage>No available doctors today</NoDoctorsMessage>
              ) : (
                <>
                  <div className="relative mt-2">
                    <button type="button"
                      className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6"
                      aria-haspopup="listbox" onClick={toggleDropdown} aria-expanded={isOpen}
                      aria-labelledby="listbox-label">
                      <span className="flex items-center">
                        <img
                          src={`http://${hostList.backend}/media/summer_project/default-avatar.jpeg`}
                          alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                        <span className="ml-3 block truncate">{selectedDoctor === null ? 'choose doctor first' : `${availableData[doctorIndex].dr_name} - ${availableData[doctorIndex].specialty} specialty`}</span>
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && (
                      <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" tabIndex="-1" role="listbox" aria-labelledby="listbox-label" aria-activedescendant="listbox-option-3">
                        {Array.isArray(availableData) && availableData.length > 0 ? availableData.map((doctor, index) => (
                          <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900" id="listbox-option-0" role="option" key={index}>
                            <div className="flex items-center">
                              {doctor.avatar===''?(<img src={`http://${hostList.backend}/media/summer_project/default-avatar.jpeg`} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />)
                                  :(<img src={doctor.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />)}

                              <span className="ml-3 block truncate font-normal" onClick={changeDoctor} data-doctor-id={doctor.dr_id} data-index={index}>{doctor.dr_name} - {doctor.specialty} specialty</span>
                            </div>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </li>
                        )) : (
                          <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900">
                            <div className="flex items-center">
                              <span className="ml-3 block truncate font-normal">No available doctors</span>
                            </div>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
            {selectedDoctor && (availableData[doctorIndex]?.available_time?.length === 0) && (
              <WarningMessage>Doctor is unavailable</WarningMessage>
            )}
            {selectedDoctor && (availableData[doctorIndex]?.available_time?.length > 0) && (
              <TimeGridContainer>
                <TimeGrid>
                  {availableData[doctorIndex]?.available_time?.map((time, index) => (
                    <TimeButton key={index} className="time-button" onClick={decideTime} value={time}>{time}</TimeButton>
                  ))}
                </TimeGrid>
              </TimeGridContainer>
            )}
            <BookButton onClick={handleBook}>Book</BookButton>
            {bookingSuccess && <SuccessMessage>Booking successful!</SuccessMessage>}
            {warningMessage && <WarningMessage>{warningMessage}</WarningMessage>}
          </NavyRectangle>
        </RightSection>
      </RectangleContainer>
    </div>
  );
}

export default ContactDr;
