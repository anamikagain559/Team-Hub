import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'anamikagain@gmail.com',
      password: 'password123' // Adjust if needed
    });
    console.log('Login Success:', response.data);
  } catch (error) {
    console.error('Login Failed:', error.response?.data || error.message);
  }
}

testLogin();
