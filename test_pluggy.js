const { PluggyClient } = require('pluggy-sdk');

async function test() {
    console.log('Testing with invalid credentials...');
    const client = new PluggyClient({
        clientId: '335a092c-e69a-4f59-a3cb-5a738c522eb8',
        clientSecret: 'invalid_secret_123'
    });

    try {
        await client.fetchAccounts('some-item-id');
    } catch (err) {
        console.error('Caught error:', err.message);
    }
}

test();
