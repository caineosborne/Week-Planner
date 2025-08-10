// frontend/postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},  // <-- use this, not "tailwindcss": {}
    autoprefixer: {},
  },
}
