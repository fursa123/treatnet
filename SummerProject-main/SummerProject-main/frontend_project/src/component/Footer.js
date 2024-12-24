import React from 'react';
//import {Link} from "react-router-dom";
import logo from '../static/savoirlogo.png'

function Footer(props) {
    return (
        <div>
            <footer class="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
                <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                    <div class="sm:flex sm:items-center sm:justify-between">
                        <a href='#'
                           className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src={logo} className="h-8" alt="Flowbite Logo"/>
                            <span
                                class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Qi-CT</span>
                        </a>

                    </div>
                    <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8"/>
                    <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 <a
                        href="https://github.com/ahmedcoolestman/SummerProject"
                        className="hover:underline">Teams of Ahmed, Finn, Hannah, Yi, Ziyuan</a>. All Rights Reserved.</span>
                </div>
            </footer>
        </div>
    );
}

export default Footer;