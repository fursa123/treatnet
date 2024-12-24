import React, {useState, useEffect} from 'react';
import NavBar from "../../component/NavBar";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {getPatientDetailedInfo, submitPatientDiagnosis} from "../../api/Doctor";
import Cookies from "js-cookie";
import {startContactUser} from "../../api/Home";
import Heading from '../../component/Heading';
import Loading from '../../component/Loading';

function DrDetailedPatient() {
    const [userData, setUserData] = useState({});
    const [cancerRisks, setCancerRisks] = useState({});
    const location = useLocation();
    const [chart, setChart] = useState(null);
    const [ifShowModal, setIfShowModal] = useState(false);
    const [diagnosisInput, setDiagnosisInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [singleData, setSingleData] = useState(null);
    const nav = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        loadInfo();
    }, []);

    const loadInfo = async () => {
        setIsLoading(true); // Start loading
        try {
            const queryParams = new URLSearchParams(location.search);
            const username = queryParams.get('username');
            let token = Cookies.get('token');
            const res = await getPatientDetailedInfo('patient/doctor/get_patient_information/' + token + '/', {'username': username});
            if (res.status === 200) {
                setUserData(res.data.patient_information);
                setCancerRisks(res.data.patient_information.cancer_risks);
                if (res.data.chart != null) {
                    setChart(res.data.chart);
                } else {
                    let jsonData = res.data.data[0]
                    setSingleData(jsonData);
                }
                setIsAuthenticated(true);
            } else if (res.status === 400) {
                setIsAuthenticated(false);
            } else if (res.status === 404) {
                nav('/404')
            }
        } catch (error) {
            console.error('Error loading information:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskDetails = (riskLevel) => {
        let color, message;

        switch (riskLevel.toLowerCase()) {
            case 'low':
                color = 'text-green-600';
                message = 'Low risk. Maintain a healthy lifestyle.';
                break;
            case 'medium':
                color = 'text-yellow-600';
                message = 'Moderate risk. Regular check-ups are recommended.';
                break;
            case 'high':
                color = 'text-red-600';
                message = 'High risk. Immediate medical consultation advised.';
                break;
            default:
                color = 'text-gray-600';
                message = 'Risk not available.';
        }

        return {color, message};
    };

    const submitDiagnosis = (e) => {
        e.preventDefault();
        let token = Cookies.get('token');
        submitPatientDiagnosis('patient/patient/save_patient_diagnosis/' + token + '/', {
            'diagnosis': diagnosisInput,
            'username': userData.username
        }).then(res => {
            loadInfo();
            setDiagnosisInput('');
        });
    }

    const contactUser = () => {
        startContactUser({'target_username': userData.username}, Cookies.get('token')).then(res => {
            if (res.status === 200) {
                nav('/message')
            }
        })
    }

    if (isLoading) {
        return (
            <div>
                <NavBar/>
                <Loading/>
            </div>

        );
    }

    return (
        <div>
            <NavBar/>
            <div className='float-left ml-5 mt-5'>
                <button type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                    <Link to={'/findpatient'}>Go back</Link>
                </button>
            </div>

            {isAuthenticated ? (
                <div>
                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Patient
                                        Information: {userData.forename} {userData.surname} </h3>
                                </div>
                                <button type="button" onClick={contactUser}
                                        className="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800">
                                    Contact Patient
                                </button>
                            </div>
                            <div className="border-t border-gray-200">
                                <div className="px-4 py-5 sm:p-6">
                                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Forename</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.forename}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Surname</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.surname}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.gender}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Birthday</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.dob}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Blood Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.blood_type}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Allergy</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.allergy || 'No known allergies'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Past Surgeries</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.past_surgeries || 'None reported'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Patient Status</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{userData.patient_status}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Unspecified Symptoms</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {userData.unspecified_symptoms && typeof userData.unspecified_symptoms === 'object' ? (
                                                    <ul className="list-disc list-inside">
                                                        {Object.entries(userData.unspecified_symptoms).map(([key, value]) =>
                                                            key==='other_symptom'?(value!==''&&<li key={key}>{value}</li>):
                                                                ((value.toString()==='true'&&value!=='')&&<li key={key}>
                                                                <strong>{key}</strong>
                                                            </li>)

                                                        )}
                                                    </ul>
                                                ) : 'None reported'}
                                            </dd>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                            <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                                            <p className="mt-1 text-sm text-gray-900">{userData.phone_Number}</p>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Allergies</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Array.isArray(userData.allergies) && userData.allergies.map((allergy, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full">
                                            {allergy}
                                        </span>
                                    ))}
                                    {Array.isArray(userData.allergies) && userData.allergies.length === 0 && userData.other_allergies === '' && (
                                        <span
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full">
                                            None
                                        </span>
                                    )}
                                    {userData.other_allergies !== '' && (
                                        <span
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-200 text-gray-800 text-sm rounded-full">
                                            {userData.other_allergies}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Body info</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {chart != null &&
                                        <img src={'data:image/png;base64,' + chart} alt={'Table for body info'}/>}
                                    {singleData != null && <div>Weight: {singleData.weight}<br/> Height: {singleData.height}<br/> Created time: {singleData.date_changed.split('T')[0]}</div>}
                                    {chart == null && singleData == null && <div>No data here</div>}
                                </div>
                                {chart != null && <button type="button" onClick={() => setIfShowModal(true)}
                                                          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
                                    Zoom in
                                </button>}

                            </div>
                        </div>
                    </div>

                    {ifShowModal && (
                        <div id="default-modal" tabIndex="-1" aria-hidden="true"
                             className="overflow-y-auto overflow-x-hidden fixed z-50 items-center justify-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                            <div className="relative p-4 w-full">
                                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                    <div
                                        className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                            Chart (Zoomed in)
                                        </h3>
                                        <button type="button" onClick={() => setIfShowModal(false)}
                                                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                                data-modal-hide="default-modal">
                                            <svg className="w-3 h-3" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 fill="none" viewBox="0 0 14 14">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                      strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                            </svg>
                                            <span className="sr-only">Close modal</span>
                                        </button>
                                    </div>
                                    <div className="p-4 md:p-5 space-y-4">
                                        <img src={'data:image/png;base64,' + chart} alt={'Table for body info'}/>
                                    </div>
                                    <div
                                        className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                        <button data-modal-hide="default-modal" type="button"
                                                onClick={() => setIfShowModal(false)}
                                                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Cancer Risk Prediction Section */}
                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">AI Cancer Risk
                                    Prediction</h3>
                                <div className="mt-4 space-y-4">
                                    {Object.keys(cancerRisks).map((cancerType, index) => {
                                        const {color, message} = getRiskDetails(cancerRisks[cancerType]);
                                        return (
                                            <div key={index} className={`p-4 rounded-lg ${color}`}>
                                                <h4 className="text-sm font-medium">{cancerType.replace('_', ' ')}</h4>
                                                <p className="mt-1 text-sm">{cancerRisks[cancerType]}</p>
                                                <p className="mt-1 text-xs italic">{message}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">

                                <div className="mt-4 space-y-4">
                                    <h4 className="text-md leading-6 font-medium text-gray-900">Diagnosis History</h4>
                                    {userData.diagnosis && userData.diagnosis.map((diag, index) => (
                                        <div key={index} className="border p-4 rounded-lg bg-gray-50">
                                            <p><strong>Diagnosis:</strong> {diag.diagnosis}</p>
                                            <p><strong>Generation Time:</strong> {diag.generation_time}</p>
                                            <p><strong>Diagnosed By:</strong> Dr. {diag.diagnosed_dr_full_name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl mt-8 px-4 sm:px-6 lg:px-8 pb-8">
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Diagnosis</h3>
                                <form onSubmit={submitDiagnosis}>
                                    <textarea value={diagnosisInput} onChange={(e) => setDiagnosisInput(e.target.value)}
                                              className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                              rows="5"
                                              placeholder="Enter diagnosis information..."></textarea>
                                    <div className="mt-4 flex justify-end">
                                        <button type="submit"
                                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                                            Save Diagnosis
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='ml-5 mt-5'>
                    <Heading text="Authentication Failed"/>
                    <p className='text-lg'>You are not authorized to view this page.</p>
                </div>
            )}
        </div>
    );
}

export default DrDetailedPatient;
