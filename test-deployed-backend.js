const axios = require('axios');

const DEPLOYED_URL = 'https://autocare-pro-2.onrender.com/api/v1';

async function testDeployedBackend() {
  try {
    console.log('🧪 Testing deployed backend...');
    
    // Test health endpoint
    console.log('🏥 Testing health endpoint...');
    const healthResponse = await axios.get(`${DEPLOYED_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test admin login
    console.log('\n🔐 Testing admin login...');
    const loginData = {
      email: 'emmanuel.evian@autocare.com',
      password: 'autocarpro12k@12k.wwc'
    };
    
    const loginResponse = await axios.post(`${DEPLOYED_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      success: loginResponse.data.success,
      message: loginResponse.data.message,
      user: {
        id: loginResponse.data.user.id,
        name: loginResponse.data.user.name,
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role,
        isAdmin: loginResponse.data.user.isAdmin
      }
    });
    
    // Test debug endpoint
    console.log('\n🔍 Testing debug endpoint...');
    const debugResponse = await axios.get(`${DEPLOYED_URL}/auth/debug-user/emmanuel.evian@autocare.com`);
    console.log('✅ Debug response:', debugResponse.data);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDeployedBackend(); 