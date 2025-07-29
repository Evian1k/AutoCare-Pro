#!/usr/bin/env node

const https = require('https');

const BACKEND_URL = 'https://autocare-pro-2.onrender.com';
const FRONTEND_URL = 'https://auto-care-pro-269h.vercel.app';

console.log('🔍 Testing AutoCare Pro Connection...\n');

// Test backend health
async function testBackend() {
  console.log('📡 Testing Backend...');
  
  try {
    const healthResponse = await makeRequest(`${BACKEND_URL}/health`);
    console.log('✅ Backend Health:', healthResponse.status);
    
    const apiResponse = await makeRequest(`${BACKEND_URL}/api/v1/payments/config`);
    console.log('✅ Backend API:', apiResponse.success ? 'Working' : 'Error');
    
    const rootResponse = await makeRequest(`${BACKEND_URL}/`);
    console.log('✅ Backend Root:', rootResponse.message);
    
  } catch (error) {
    console.log('❌ Backend Error:', error.message);
  }
}

// Test frontend
async function testFrontend() {
  console.log('\n🌐 Testing Frontend...');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log('✅ Frontend:', response.includes('AutoCare Pro') ? 'Working' : 'Error');
    
  } catch (error) {
    console.log('❌ Frontend Error:', error.message);
  }
}

// Test API connection from frontend perspective
async function testAPIConnection() {
  console.log('\n🔗 Testing API Connection...');
  
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/v1/payments/config`);
    if (response.success) {
      console.log('✅ API Connection: Working');
      console.log('   - Mode:', response.data.mode);
      console.log('   - Currency:', response.data.currency);
      console.log('   - Supported Currencies:', response.data.supportedCurrencies.join(', '));
    } else {
      console.log('❌ API Connection: Failed');
    }
  } catch (error) {
    console.log('❌ API Connection Error:', error.message);
  }
}

// Helper function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Run all tests
async function runTests() {
  await testBackend();
  await testFrontend();
  await testAPIConnection();
  
  console.log('\n🎉 Connection Test Complete!');
  console.log('\n📋 Summary:');
  console.log('Backend URL:', BACKEND_URL);
  console.log('Frontend URL:', FRONTEND_URL);
  console.log('API Endpoint:', `${BACKEND_URL}/api/v1`);
  console.log('\n🌐 Open your browser and go to:', FRONTEND_URL);
}

runTests().catch(console.error); 