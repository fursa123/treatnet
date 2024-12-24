import React, { useEffect, useState } from 'react';
import InfoBox from '../../component/InfoBox';
import NavBar from '../../component/NavBar';
import Footer from '../../component/Footer';
import Heading from '../../component/Heading';

const DietPlans = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <div>
            <NavBar />
            <Heading title={`Help`} />

            <InfoBox title="How to get started" backgroundColor="blue-500">
                <h2 className="intext">Step 1: </h2>
                <p className="para">- Enter new symptoms on patient home
                    <br></br>- Complete risk assessment on patient home 
                </p>
                <br></br>

                <h2 className="intext">Step 2: </h2>
                <p className="para">- Navigate to Contact a Doctor on patient home
                    <br></br>- Select a date and book a time with the available doctors 
                    <br></br>- On the day of your appointment the Doctor will send the meeting information 10 minutes in advance in your messages
                    <br></br>- Navigate to view appointments, select the day and 'Join' the appointment
                    <br></br>- Enter meeting details sent by the Doctor 
                </p>
                <br></br>

                <h2 className="intext">Step 3: </h2>
                <p className="para">- Once a diagnosis has been made you can now generate a personalised meal plan
                    <br></br>- Select 'Meal Plans' on patient home
                    <br></br>- Enter dietary preferences and submit
                    <br></br>- Wait for a nutritionist to approve
                    <br></br>- Once the nutritionist apporves the diet plan it will be available in the same location 
                </p>
                <br></br>

                <h2 className="intext">Step 4: </h2>
                <p className="para">- Once a diagnosis has been made you can now generate a personalised exercise plan
                    <br></br>- Select 'Exercise Plans' on patient home 
                </p>
            </InfoBox>

            <InfoBox title="Frequently Asked Questions" backgroundColor="blue-500">

                <h2 className="intext">1. What services do you offer? </h2>
                <p className="para">Our services include recording symptoms, analyzing cancer risk, making appointments, meeting online, and developing meal and exercise plans.</p>

                <br></br>
                <h2 className="intext">2. How to cancel my appointment? </h2>
                <p className="para">
                    - Navigate to 'View Appointments' on patient home
                    <br></br>- Choose the date you have an appointment
                    <br></br>- Find the appointment you want to cancel
                    <br></br>- Click on 'Cancel' in the ACTION column.
                </p>

                <br></br>
                <h2 className="intext">3. Can I see my cancer risk predictions?</h2>
                <p className="para">We do not currently support patients to view their own cancer risk predictions, you can contact our doctor to view the results for you.</p>

                <br></br>
                <h2 className="intext">4. How to update my personal profile?</h2>
                <p className="para">Click on your avatar on the navigate bar and select 'Your Profile'. Then you can update your height and weight records, allergies and contact information.</p>

                <br></br>
                <h2 className="intext">5. How to solve the technical problems?</h2>
                <p className="para">If you are experiencing technical problems, you can click on the staff below to report your problems via email.</p>
                
            </InfoBox>

            <InfoBox title="Contact us" backgroundColor="blue-500">
                <p className="para">
                    <a href={`mailto:pu20789@bristol.ac.uk`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Ahmed El Ashry </a>
                    <br /><a href={`mailto:uq23577@bristol.ac.uk`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Finn Lawton </a>
                    <br /><a href={`mailto:hannah.abedin.2020@bristol.ac.uk`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Hannah Abedin </a>
                    <br /><a href={`mailto:xh23666@bristol.ac.uk`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Yi Song </a>
                    <br /><a href={`mailto:py23518@bristol.ac.uk`} className="text-sm text-blue-600 dark:text-blue-500 hover:underline">Ziyuan Lu </a>
                </p>
            </InfoBox>

            <Footer />
        </div>
    );
};

export default DietPlans;
