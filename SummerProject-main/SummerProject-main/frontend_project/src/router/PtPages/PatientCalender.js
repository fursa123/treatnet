import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../../component/NavBar';
import "../../css/calendar.css";
import CustomCalendar from "../../component/CustomCalendar";
import styled from 'styled-components';
import Heading from '../../component/Heading';
import BackButton from '../../component/BackButton';

const SuccessMessage = styled.div`
  margin-top: 20px;
  color: green;
  text-align: center;
`;

const ErrorMessage = styled.div`
  margin-top: 20px;
  color: red;
  text-align: center;
`;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PatientCalendar() {
  const query = useQuery();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const success = query.get('bookingSuccess');
    
    if (success === 'true') {
      setBookingSuccess(true);
    } else if (success === 'false') {
      setErrorMessage('Booking unsuccessful. Please try again.');
    }
  }, [query]);

  return (
    <div>
      <NavBar />
      <Heading title="Your Calendar" subtitle="View your appointments"/>
      <BackButton to="/patient-home" />
      <div className="bg-white">
        <div>
          <div className="text-center">
            {bookingSuccess && <SuccessMessage>Booking successful!</SuccessMessage>}
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          </div>
        </div>
        <CustomCalendar />
      </div>
    </div>
  );
}

export default PatientCalendar;
