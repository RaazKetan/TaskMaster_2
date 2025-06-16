// module.exports = {
//   plugins: [require("@tailwindcss/postcss"), require("autoprefixer")],
// };



// postcss.config.js
// module.exports = {
//   plugins: [
//     require('@tailwindcss/postcss'), // Use the specific package as indicated by the error
//     require('autoprefixer')
//   ],
// };


// postcss.config.js
module.exports = {


  plugins: [
    require('@tailwindcss/postcss'), // Use this for Tailwind CSS v4
    require('autoprefixer')
  ]
};


