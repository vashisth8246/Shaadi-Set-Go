const fetch = global.fetch;
const base = 'http://127.0.0.1:5000';
const endpoints = [
  '/api/venues',
  '/api/photography',
  '/api/catering',
  '/api/decoration',
  '/api/djs',
  '/api/vendors?businessType=venue',
  '/api/vendors?businessType=catering',
  '/api/vendors?businessType=photography',
  '/api/vendors?businessType=dj',
  '/api/vendors?businessType=music',
  '/api/vendors?businessType=decoration'
];

(async () => {
  for (const ep of endpoints) {
    try {
      const res = await fetch(base + ep);
      const data = await res.json();
      console.log('ENDPOINT', ep, 'STATUS', res.status, 'LENGTH', Array.isArray(data) ? data.length : 'object');
      if (Array.isArray(data)) {
        console.log(JSON.stringify(data.slice(0, 3), null, 2));
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('ERROR', ep, err.message);
    }
    console.log('---');
  }
})();
