import ollama from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const schema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string().describe("Analysis success status"),
  anomalies_detected: z.boolean(),
  anomaly_details: z.array(
    z.object({
      timestamp: z.string().datetime(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"])
    })
  )
  .optional(),
  recommendations: z.array(z.string()).optional()
});

const schemaJson = z.object({
  log: z.array(schema)
})

async function run(model: string) {
  const outputSchema = zodToJsonSchema(schemaJson);

  const response = await ollama.generate({
    model: "llama3.1:8b",
    format: outputSchema,
    prompt: `Analyze this network log entry and classify it. Determine if there are any security threats or anomalies and provide a detailed analysis in markdown format.`,
    options: {
      temperature: 0,
      top_p: 1,
      top_k: 0,
    }
  });

  try {
    const outputResponse = schemaJson.parse(response);
    console.log(outputResponse);
  } catch (error) {
    console.error("Error parsing response:", error);
  }
}

run("llama3.1:8b").catch(console.error);