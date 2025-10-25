// Test script để kiểm tra API đăng nhập
const axios = require('axios');

const API_BASE_URL = 'https://baitapnhom-laptrinhchothietbididong-omtc.onrender.com/api';

async function testLogin() {
    try {
        console.log('Testing login API...');

        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: 'admin',
            password: 'password'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Login Response Status:', response.status);
        console.log('Login Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Login Error:', error.response?.status);
        console.error('Login Error Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Full Error:', error.message);
    }
}

async function testLoginVariations() {
    const variations = [
        { username: 'admin', password: 'password' },
        { email: 'admin@movieticket.com', password: 'password' },
        { username: 'admin', password: 'admin' },
        { email: 'admin@movieticket.com', password: 'admin' },
        { username: 'admin', password: '123456' },
        { email: 'admin@movieticket.com', password: '123456' }
    ];

    for (const variation of variations) {
        try {
            console.log(`\nTesting login with:`, variation);
            const response = await axios.post(`${API_BASE_URL}/auth/login`, variation, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status:', response.status);
            console.log('Data:', JSON.stringify(response.data, null, 2));

            if (response.data.code === 200) {
                console.log('✅ LOGIN SUCCESS!');
                break;
            }

        } catch (error) {
            console.log('Status:', error.response?.status);
            console.log('Error:', error.response?.data?.message || error.message);
        }
    }
}

async function testMovies() {
    try {
        console.log('\nTesting movies API...');

        const response = await axios.get(`${API_BASE_URL}/movies`);

        console.log('Movies Response Status:', response.status);
        console.log('Movies Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Movies Error:', error.response?.status);
        console.error('Movies Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

async function testUsers() {
    try {
        console.log('\nTesting users API...');

        const response = await axios.get(`${API_BASE_URL}/users`);

        console.log('Users Response Status:', response.status);
        console.log('Users Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Users Error:', error.response?.status);
        console.error('Users Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

// Chạy tất cả tests
async function runTests() {
    await testLoginVariations();
    await testMovies();
    await testUsers();
}

runTests();
