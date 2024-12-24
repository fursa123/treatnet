import NavBar from "../../component/NavBar";
import '../../css/general.css'
import { useEffect, useState } from "react";
import { findPatientsByConditions } from "../../api/Doctor";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import Footer from '../../component/Footer'
import Heading from "../../component/Heading";

function NuFindPatient() {
    const [username, setUsername] = useState('');
    const [forenames, setForenames] = useState('');
    const [surname, setSurname] = useState('');
    const [fromAge, setFromAge] = useState('0');
    const [toAge, setToAge] = useState('999');
    const [gender, setGender] = useState('-1');

    const [searchData, setSearchData] = useState(null);
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    // check whether the nutritionist is authenticated
    const [is_authenticated, setIs_authenticated] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const clearData = () => {
        document.getElementById('username').value = ''
        document.getElementById('forenames').value = ''
        document.getElementById('surname').value = ''
        document.getElementById('fromAge').value = ''
        document.getElementById('toAge').value = ''
        document.getElementById('gender').value = '-1'
        setUsername('')
        setForenames('')
        setSurname('')
        setFromAge('0')
        setToAge('999')
        setGender('-1')
    }

    const submitForm = () => {
        let token = Cookies.get('token')
        findPatientsByConditions('patient/nutritionist/nufind_patient/' + token + '/', {
            'username': username,
            'forenames': forenames,
            'surname': surname,
            'fromAge': fromAge,
            'toAge': toAge,
            'gender': gender
        }).then(res => {
            if (res.status == 200) {
                setSearchData(res.data.results)
                setPrevPageUrl(res.data.previous)
                setNextPageUrl(res.data.next)
            } else if (res.status == 400) {
                setIs_authenticated(false)
            }
        })
    }

    const handleNextPage = () => {
        findPatientsByConditions(nextPageUrl, {
            'username': username,
            'forenames': forenames,
            'surname': surname,
            'fromAge': fromAge,
            'toAge': toAge,
            'gender': gender
        }).then(res => {
            if (res.status == 200) {
                setSearchData(res.data.results)
                setPrevPageUrl(res.data.previous)
                setNextPageUrl(res.data.next)
            } else if (res.status == 400) {
                setIs_authenticated(false)
            }
        })
    }

    const handlePrePage = () => {
        findPatientsByConditions(prevPageUrl, {
            'username': username,
            'forenames': forenames,
            'surname': surname,
            'fromAge': fromAge,
            'toAge': toAge,
            'gender': gender
        }).then(res => {
            if (res.status == 200) {
                setSearchData(res.data.results)
                setPrevPageUrl(res.data.previous)
                setNextPageUrl(res.data.next)
            } else if (res.status == 400) {
                setIs_authenticated(false)
            }
        })
    }

    return (
        <div onLoad={submitForm}>
            <NavBar />
            <Heading title="Find Patient"/>
            {/*searching area*/}
            <div className={'flex mx-36'}>
                <div>
                    <label htmlFor="username"
                        className="block text-sm font-medium leading-6 text-gray-900">Username</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input type="text" name="username" id="username"
                            className="block w-28 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="username" onChange={(e) => setUsername(e.target.value)} />

                    </div>
                </div>

                <div className={'ml-4'}>
                    <label htmlFor="forenames"
                        className="block text-sm font-medium leading-6 text-gray-900">forenames</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input type="text" name="forenames" id="forenames"
                            className="block w-28 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="forenames" onChange={(e) => setForenames(e.target.value)} />

                    </div>
                </div>

                <div className={'ml-4'}>
                    <label htmlFor="surname"
                        className="block text-sm font-medium leading-6 text-gray-900">surname</label>
                    <div className="relative mt-2 rounded-md shadow-sm">
                        <input type="text" name="surname" id="surname"
                            className="block w-28 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="surname" onChange={(e) => setSurname(e.target.value)} />

                    </div>
                </div>

                <div className={'ml-4'}>
                    <label htmlFor="age" className="block text-sm font-medium leading-6 text-gray-900">Age</label>
                    <div className="relative mt-2 rounded-md shadow-sm flex">
                        <input type="number" name="fromAge" id="fromAge"
                            className="block w-20 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="from" onChange={(e) => setFromAge(e.target.value)} />
                        <div className={'py-1.5'}>&nbsp;-&nbsp;</div>
                        <input type="number" name="toAge" id="toAge"
                            className="block w-20 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="to" onChange={(e) => setToAge(e.target.value)} />

                    </div>
                </div>

                <div className={'ml-4'}>
                    <label htmlFor="gender" className="block text-sm font-medium leading-6 text-gray-900">Gender</label>
                    <div className="relative mt-2 rounded-md shadow-sm flex">
                        <select name="gender" id="gender"
                            className="block w-20 h-9 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(e) => setGender(e.target.value)}>
                            <option value={-1}>All</option>
                            <option value={2}>Male</option>
                            <option value={3}>Female</option>
                            <option value={4}>Other</option>
                        </select>
                    </div>
                </div>

                <div className={'flex ml-8'}>
                    <button type="button" className="text-sm font-semibold leading-6 pt-7 text-gray-900"
                        onClick={clearData}>Clear
                    </button>
                    <button type="submit"
                        className="rounded-md bg-indigo-600 h-10 px-3 py-2 mt-7 ml-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        onClick={submitForm}>
                        Submit
                    </button>
                </div>
            </div>
            {/*table area*/}
            <div>
                <div class="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
                    <table className="w-full mb-5 text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Username
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Forenames
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Surname
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Age
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Gender
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Phone Number
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Detailed
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchData?.map((patient, index) => (
                                <tr key={index}
                                    class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {patient.Username}
                                    </th>
                                    <td className="px-6 py-4">
                                        {patient.Forenames}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.Surname}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.Age}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.Gender}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.Email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.Phone_Number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link to={"/nutritionist-pt?username=" + patient.Username}
                                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline">select</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div class="flex items-center justify-center mb-5">
                        {prevPageUrl && (<a href="#"
                            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            onClick={handlePrePage}>
                            Previous
                        </a>)}
                        {nextPageUrl && (<a href="#"
                            className="flex items-center justify-center px-3 h-8 ms-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            onClick={handleNextPage}>
                            Next
                        </a>)}
                    </div>

                </div>
                {/*spinner*/}
                {searchData === null && (<div role="status" className={'flex items-center justify-center w-full my-3'}>
                    <svg aria-hidden="true"
                        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor" />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill" />
                    </svg>
                    <span class="sr-only">Loading...</span>
                </div>)}

                {is_authenticated === false && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={{ margin: '0', fontSize: '1.5rem'  }}>You have not been authenticated yet.</h1> 
                        <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>Please contact the administrator.</p>
                    </div>)}
            </div>
            <Footer />
        </div>
    );
}

export default NuFindPatient;
