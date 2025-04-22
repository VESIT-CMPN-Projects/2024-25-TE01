export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { logData } = req.body;
  
      try {
        const response = await fetch('http://localhost:5000/api/analyze-log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logData }),
        });
  
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        console.error('Error connecting to backend API:', error);
        res.status(500).json({ error: 'Error connecting to backend API' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }