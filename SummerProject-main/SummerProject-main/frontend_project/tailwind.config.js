/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/index.html", "./src/**/*.{jsx,js}",
        './node_modules/flowbite-react/**/*.js'],
    theme: {
        extend: {},
    },
    plugins: [
        require('flowbite/plugin')
    ],
}

