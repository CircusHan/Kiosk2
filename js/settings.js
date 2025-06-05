document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('geminiApiKey');
    const saveButton = document.getElementById('saveApiKeyButton');
    const saveStatus = document.getElementById('saveStatus');

    // Load saved API key if it exists
    const currentApiKey = localStorage.getItem('geminiApiKey');
    if (currentApiKey) {
        apiKeyInput.value = currentApiKey;
    }

    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            saveStatus.textContent = 'API Key saved successfully!';
            saveStatus.style.color = 'green';
        } else {
            saveStatus.textContent = 'Please enter an API Key.';
            saveStatus.style.color = 'red';
        }
        setTimeout(() => {
            saveStatus.textContent = '';
        }, 3000);
    });
});
