window.CSKA_PROXY_URL = "";
window.CSKA_DATA_API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
	? "/api/data"
	: "https://cska-explorer.vercel.app/api/data";
