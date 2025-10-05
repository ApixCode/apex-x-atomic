document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Replace this with your actual Render API URL
    const API_BASE_URL = 'https://my-apex-api.onrender.com';

    // Check which page we are on
    if (document.getElementById('loginButton')) {
        handleLoginPage();
    } else {
        handleDashboardPage();
    }

    function handleLoginPage() {
        const loginButton = document.getElementById('loginButton');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const loginError = document.getElementById('loginError');

        loginButton.addEventListener('click', async () => {
            const apiKey = apiKeyInput.value;
            if (!apiKey) {
                loginError.textContent = "Please enter an API key.";
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/apex/key-info`, {
                    headers: { 'registered-key': apiKey }
                });

                if (response.ok) {
                    localStorage.setItem('apiKey', apiKey);
                    window.location.href = 'dashboard.html';
                } else {
                    loginError.textContent = "Invalid API Key.";
                }
            } catch (error) {
                loginError.textContent = "Error connecting to API.";
            }
        });
    }

    function handleDashboardPage() {
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey) {
            window.location.href = 'index.html';
            return;
        }

        // DOM Elements
        const ownerName = document.getElementById('ownerName');
        const requestsLeft = document.getElementById('requestsLeft');
        const successfulBypasses = document.getElementById('successfulBypasses');
        const failedBypasses = document.getElementById('failedBypasses');
        const lastUrl = document.getElementById('lastUrl');
        const testApiButton = document.getElementById('testApiButton');
        const urlToTest = document.getElementById('urlToTest');
        const testResult = document.getElementById('testResult');
        const submitSuggestion = document.getElementById('submitSuggestion');
        const suggestionText = document.getElementById('suggestionText');
        const suggestionStatus = document.getElementById('suggestionStatus');
        const logoutButton = document.getElementById('logoutButton');


        // Fetch and display data
        async function loadDashboardData() {
            // Fetch key-specific info
            fetch(`${API_BASE_URL}/apex/key-info`, { headers: { 'registered-key': apiKey } })
                .then(res => res.json())
                .then(data => {
                    ownerName.textContent = data.owner;
                    if(data.requests === 'permanent') {
                        requestsLeft.textContent = 'Permanent';
                    } else {
                        requestsLeft.textContent = data.requests - data.requests_used;
                    }
                });

            // Fetch global status info
            fetch(`${API_BASE_URL}/apex/status`)
                .then(res => res.json())
                .then(data => {
                    successfulBypasses.textContent = data.successful_bypasses;
                    failedBypasses.textContent = data.failed_bypasses;
                    lastUrl.textContent = data.last_bypassed_url;
                });
        }

        // Test API Endpoint
        testApiButton.addEventListener('click', async () => {
            const url = urlToTest.value;
            if (!url) {
                testResult.textContent = "Please enter a URL to test.";
                return;
            }
            testResult.textContent = "Testing...";
            try {
                 const response = await fetch(`${API_BASE_URL}/apex/bypass?url=${encodeURIComponent(url)}`, {
                    headers: { 'registered-key': apiKey }
                });
                const data = await response.json();
                testResult.textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                testResult.textContent = `Error: ${error.message}`;
            }
            loadDashboardData(); // Refresh data after test
        });

        // Suggestion Box
        submitSuggestion.addEventListener('click', () => {
             // IMPORTANT: Replace this with your Discord Webhook URL
            const webhookURL = 'YOUR_DISCORD_WEBHOOK_URL';
            const suggestion = suggestionText.value;
            if(!suggestion) return;

            fetch(webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `New Suggestion: ${suggestion}` })
            }).then(response => {
                if(response.ok) {
                    suggestionStatus.textContent = "Suggestion sent! Thank you!";
                    suggestionText.value = '';
                } else {
                    suggestionStatus.textContent = "Failed to send suggestion.";
                }
            });
        });

        // Logout
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('apiKey');
            window.location.href = 'index.html';
        });

        // Initial load
        loadDashboardData();
    }
});
