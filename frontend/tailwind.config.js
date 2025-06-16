// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }




/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stitch-dark-text': '#0c151d', // For main text
        'stitch-border': '#cddcea',    // For input borders
        'stitch-bg-input': '#f8fafc',  // For input background (slate-50 equivalent from HTML)
        'stitch-placeholder': '#4574a1', // For placeholder text
        'stitch-primary': '#359dff',   // For primary button background
        'stitch-secondary-bg': '#e6edf4', // For secondary button background
        'stitch-gray-text': '#4574a1', // For secondary text/icons
      },
      // You can also extend font sizes, spacing, etc. if needed
      // fontSize: {
      //   '32px': '32px', // If you want to use text-32px
      // },
      // spacing: {
      //   '15px': '15px', // For p-[15px]
      // },
    },
  },
  plugins: [],
}