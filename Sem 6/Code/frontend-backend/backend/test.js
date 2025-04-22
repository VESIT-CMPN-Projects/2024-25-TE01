import ollama from 'ollama';

const logData = `
Date: 2023-10-01
Time: 14:32:45
Event: Unauthorized access detected
Source IP: 192.168.1.100
Destination IP: 10.0.0.5
Protocol: SSH
Details: Multiple failed login attempts followed by a successful login. Suspicious activity detected on the server.
`

async function run() {
    try { 
        console.log('Analyzing log data:', logData);
        console.log('Analyzing log...');
        const response = await ollama.generate({
            model: "log-analyser",
            prompt: `Analyse the log data: ${logData}`
        })
        con
        const output = response.response;
        console.log('Analysis:', output);
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

run();