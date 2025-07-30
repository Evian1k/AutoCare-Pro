const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login...');
    
    const loginData = {
      email: 'emmanuel.evian@autocare.com',
      password: 'autocarpro12k@12k.wwc'
    };
    
    console.log('📤 Sending login request:', loginData);
    
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Response:', {
      success: response.data.success,
      message: response.data.message,
      user: {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        isAdmin: response.data.user.isAdmin
      }
    });
    
    // Test token validation
    const token = response.data.token;
    console.log('\n🔍 Testing token validation...');
    
    const validateResponse = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Token validation successful!');
    console.log('📋 Validated user:', {
      id: validateResponse.data.user.id,
      name: validateResponse.data.user.name,
      role: validateResponse.data.user.role,
      isAdmin: validateResponse.data.user.isAdmin
    });
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

// Start the test
testAdminLogin(); 