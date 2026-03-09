const { PluggyClient } = require('pluggy-sdk');
const fetch = require('node-fetch'); // Next.js node context has native fetch

async function main() {
    const clientId = "80648f3d-68d0-4929-9d6d-054732317104";
    const clientSecret = "a38362a6-91c3-47e9-84b1-54e89dbc0e9e";

    // Authenticate and get API Token
    const resAuth = await fetch('https://api.pluggy.ai/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
    });
    const authData = await resAuth.json();
    const apiKey = authData.apiKey;

    try {
        console.log("Fetching all items from Pluggy via REST API...");
        const resItems = await fetch('https://api.pluggy.ai/items', {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
        const response = await resItems.json();

        console.log(`Found ${response.results?.length || 0} items on Pluggy side.`);

        if (response.results) {
            response.results.forEach(item => {
                console.log(`- Item ID: ${item.id} | Status: ${item.status} | ClientUserId: ${item.clientUserId}`);
            });
        }
    } catch (err) {
        console.error("Pluggy API Error:", err.message);
    }
}

main();
