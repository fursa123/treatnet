import React from 'react';
import Calendar from "react-calendar";
import "../css/calendar.css";
// import 'react-calendar/dist/Calendar.css'

const CalendarComponent = (props) => {
  const { setDate, date } = props;

  return (
    <div className="calendar-container">
      <Calendar onChange={setDate} value={date} selectRange={false} minDate={new Date()}/>
    </div>
  );
};

export default CalendarComponent;

// Code source
//https://codesandbox.io/p/sandbox/calendar-bdmhy8?file=%2Fsrc%2Fcomponents%2FCalendar%2FPartials%2FCalendar.tsx%3A1%2C1-25%2C1
