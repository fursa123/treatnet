import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../../component/NavBar';
import BackButton from '../../component/BackButton';
import Cookies from 'js-cookie';
import { getPtProfile } from '../../api/Patient'; 
import Footer from '../../component/Footer';
import request from '../../utils/request';
import Loading from '../../component/Loading';
import Heading from '../../component/Heading';

const ExercisePlans = () => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [fullName, setFullName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [exercisePlansJson, setExercisePlansJson] = useState({});
  const [loading, setLoading] = useState(true); 
  const [isDoctor, setIsDoctor] = useState(Cookies.get('isStaff') === '0');
  const [hasDiagnosis, setHasDiagnosis] = useState(false); 
  const [errorFetching, setErrorFetching] = useState(false);
  const [plansAvailable, setPlansAvailable] = useState(false); 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    const username = new URLSearchParams(window.location.search).get('username'); 


    getPtProfile(token, {}).then(res => {
      if (res.status === 200) {
        setFullName(res.data.patient_profile.forename + " " + res.data.patient_profile.surname);

        // Extract the latest diagnosis
        const diagnosisArray = res.data.patient_profile.diagnosis || [];
        if (diagnosisArray.length > 0) {
          const latestDiagnosis = diagnosisArray.reduce((latest, current) => {
            return new Date(latest.generation_time) > new Date(current.generation_time) ? latest : current;
          });
          setDiagnosis(latestDiagnosis.diagnosis);
          setHasDiagnosis(true); // Set to true if diagnosis is available

          // Fetch existing exercise plans
          fetchExercisePlans();
        } else {
          setHasDiagnosis(false); // No diagnosis available
          setLoading(false); // Set loading to false
        }
      } else {
        console.error('Failed to fetch patient profile:', res.status);
        setLoading(false); // Set loading to false
      }
    }).catch(error => {
      console.error('Error fetching patient profile:', error);
      setLoading(false); 
    });
  }, [isDoctor]);

  const fetchExercisePlans = async () => {
    try {
      const response = await request.get(`/patient/patient/get_exercise_plan/${Cookies.get('token')}/`);
      if (response.status === 200 && response.data.data.length > 0) {
        // Process and format the data
        const plansByWeek = response.data.data.reduce((acc, plan) => {
          if (!acc[plan.week_num]) {
            acc[plan.week_num] = {};
          }
          const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][plan.day_num];
          acc[plan.week_num][dayName] = plan.exercise;
          return acc;
        }, {});

        setExercisePlansJson(plansByWeek);
        setPlansAvailable(true); 
        setErrorFetching(false); 
      } else {
        setExercisePlansJson({});
        setErrorFetching(true); 
      }
    } catch (error) {
      setExercisePlansJson({});
      setErrorFetching(true); 
    } finally {
      setLoading(false);
    }
  };

  const validateExercisePlans = (plans) => {
    if (Object.keys(plans).length !== 4) return false; // Ensure we have 4 weeks
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    for (const week in plans) {
      for (const day of days) {
        if (!plans[week][day] || plans[week][day].trim() === "") return false; // Check if day is present and not empty
      }
    }
    return true;
  };

  const handleGeneratePlans = async () => {
    if (!diagnosis) {
      alert('Please ensure a diagnosis is available before generating plans.');
      return;
    }
    setLoading(true);
    try {
      let newExercisePlansJson = [];
      let isValid = false;

      while (!isValid) {
        const responsePromises = [0, 1, 2, 3].map(week => {
          return axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{
              "role": "user",
              "content": `Provide a structured weekly exercise plan for the following diagnosis: ${diagnosis}. Format the exercise plan in a JSON object with keys for each day of the week and a single exercise for each day. Ensure the object formatting is consistent across all weeks, with the same structure and style.`
            }]
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer sk-proj-Vk0woAFAaoQH5sr6Ilk8T3BlbkFJPXSiuAbPD52FLsKkvEHO`
            }
          });
        });
    
        const responses = await Promise.all(responsePromises);

        newExercisePlansJson = responses.map((response, index) => {
          try {
            const plan = JSON.parse(response.data.choices[0].message.content.trim());
            return plan;
          } catch (e) {
            console.error(`Error parsing JSON response for week ${index + 1}:`, e);
            return {}; 
          }
        });
    
        isValid = validateExercisePlans(newExercisePlansJson);
        if (!isValid) {
        }
      }

      await request.post(`/patient/patient/save_exercise_plan/${Cookies.get('token')}/`, {
        exercisePlansJson: newExercisePlansJson
      });
  
      setExercisePlansJson(newExercisePlansJson);
      setCurrentWeek(0);
      setPlansAvailable(true); 
      setErrorFetching(false); 
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        alert("Failed to fetch exercise plans. Please try again later.");
      } else if (error.request) {
        console.error("Network Error:", error.request);
        alert("Network error. Please check your internet connection.");
      } else {
        console.error("Error:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const nextWeek = () => {
    if (currentWeek < Object.keys(exercisePlansJson).length - 1) {
      setCurrentWeek((prevWeek) => prevWeek + 1);
    }
  };

  const prevWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek((prevWeek) => prevWeek - 1);
    }
  };

  const formatExercises = (exercises) => {
    if (typeof exercises === 'object') {
      return Object.entries(exercises).map(([day, exercise]) => `${day}: ${exercise}`).join(', ');
    }
    return exercises;
  };

  const navLinks = [
    { text: 'Team', path: '/team' },
    { text: 'Projects', path: '/projects' },
    { text: 'Calendar', path: '/calendar' },
  ];

  return (
    <div>
      <NavBar navLinks={navLinks} />
      <div className="bg-white">
        {loading ? (
          <Loading />
        ) : (
          <div>
            <Heading
              title={`Exercise Plans for ${fullName}`}
              subtitle={hasDiagnosis ? 'Here are your tailored exercise plans.' : 'You need to be diagnosed by a doctor first.'}
            />
            <BackButton to="/patient-home" />
            <div>
              {!plansAvailable && hasDiagnosis && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleGeneratePlans}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate New Plans'}
                  </button>
                </div>
              )}
            </div>
            {Object.keys(exercisePlansJson).length > 0 && !errorFetching && (
              <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    className={`px-4 py-2 rounded-md ${currentWeek === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    onClick={prevWeek}
                    disabled={currentWeek === 0}
                  >
                    Previous Week
                  </button>
                  <h2 className="text-2xl font-bold">Week {currentWeek + 1}</h2>
                  <button
                    className={`px-4 py-2 rounded-md ${currentWeek === Object.keys(exercisePlansJson).length - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    onClick={nextWeek}
                    disabled={currentWeek === Object.keys(exercisePlansJson).length - 1}
                  >
                    Next Week
                  </button>
                </div>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Day</th>
                        <th scope="col" className="px-6 py-3">Exercises</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(exercisePlansJson[currentWeek] || {}).map(([day, exercise]) => (
                        <tr key={day} className="border-b border-gray-200 dark:border-gray-700">
                          <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{day}</th>
                          <td className="px-6 py-4">{exercise}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExercisePlans;
