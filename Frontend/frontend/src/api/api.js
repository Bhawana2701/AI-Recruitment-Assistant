//api.js
import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-recruitment-assistant-9gvk.onrender.com"
});

export default api;