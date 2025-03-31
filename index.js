const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Define the expected schema
const webhookSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  emailText: Joi.string().required(),
  visuals: Joi.array().items(Joi.string().uri()).optional()
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  // Validate the request body
  const { error, value } = webhookSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request format',
      details: error.details.map(detail => detail.message),
      expectedFormat: {
        title: "string (required)",
        description: "string (required)",
        emailText: "string (required)",
        visuals: "array of URLs (optional)"
      }
    });
  }

  console.log('Webhook received:', {
    timestamp: new Date().toISOString(),
    body: value,
    headers: req.headers
  });

  // Send a detailed success response
  res.status(200).json({
    status: 'success',
    message: 'Webhook processed successfully',
    receivedData: {
      title: value.title,
      description: value.description,
      emailText: value.emailText,
      visuals: value.visuals || []
    },
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || null
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});