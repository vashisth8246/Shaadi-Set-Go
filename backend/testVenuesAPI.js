const axios = require('axios');

axios.get('http://localhost:5000/api/venues')
  .then(res => {
    console.log('Success! Got', res.data.length, 'venues');
    console.log('First venue:', JSON.stringify(res.data[0], null, 2));
  })
  .catch(err => {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  });
