import express from 'express'
import cors from 'cors';
import ollama from 'ollama'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/*app.post('/api/analyze-log', (req, res) => {
  const logData = req.body.logData;
  // Perform analysis on logData
  const analysis = `Analysis of log data: ${logData}`;
  res.json({ analysis });
});*/

const systemPrompt = `
Analyse the input logs and generate the answer in the given json format
{
    status: "string",
    message: "string",
    anomalies_detected: "boolean",
    anomalies: "string",
    recommendations: "string"
}
`

app.post('/api/analyze-log', async (req, res) => {
    const log = req.body.logData;
    if (!log) {
        return res.status(400).json({ error: 'Log data is required'})
    }
    try {
        console.log('Received log:', log);
        console.log('Analyzing log...');
        const response = await ollama.generate({
            model: "log-analyser",
            system: systemPrompt,
            prompt: `${log}`,
            options: {
                temperature: 0
            },
            format: "json"
        });
        console.log('Response:', response.response);
        res.send(response.response);
    } catch (error) {
        console.error('Error during analysis:', error);
        res.status(500).json({ error: 'An error occurred while analyzing the log' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});