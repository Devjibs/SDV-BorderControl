export const environment = {
  production: true,
  apiUrl: process.env["NG_APP_API_URL"] || "https://your-api-domain.com/api",
  signalRUrl:
    process.env["NG_APP_SIGNALR_URL"] ||
    "https://your-api-domain.com/telemetryHub",
};
