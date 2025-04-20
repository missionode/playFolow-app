// Set the duration for the splash screen in milliseconds (e.g., 3000 for 3 seconds)
const splashDuration = 3000;

function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// Redirect to the dashboard after the specified duration
setTimeout(redirectToDashboard, splashDuration);