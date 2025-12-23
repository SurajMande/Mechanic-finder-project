
const config = {
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || "http://localhost:5000",
  CLOUDINARY_UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
}

export default config
