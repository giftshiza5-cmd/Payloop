const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('http://localhost:5000/api/users/register', {
      email: `test_user_${Date.now()}@example.com`,
      name: 'Test Runner',
      phone: '0711223344',
      pin: '123456',
      avatar: '👤',
      gender: 'Male',
      maritalStatus: 'Single',
      occupation: 'Developer',
      dob: '1995-01-01',
      county: 'Nairobi',
      bio: 'Testing user registration flow'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error registering:', error.response ? error.response.data : error.message);
  }
}

test();
