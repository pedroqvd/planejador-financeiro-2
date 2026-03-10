const { PluggyClient } = require('pluggy-sdk');

async function test() {
    console.log('Testing with VALID credentials but INVALID item...');
    const client = new PluggyClient({
        clientId: '335a092c-e69a-4f59-a3cb-5a738c522eb8',
        clientSecret: '8681ca27-0624-4ade-a0c4-90aa4fa5e2a6'
    });

    try {
        await client.fetchAccounts('553250df-fbb2-4ccc-aa85-b3a1a511ff3f'); // fake uuid
    } catch (err) {
        console.error('Caught error for Fake Item:', err.message);
    }
}

test();
