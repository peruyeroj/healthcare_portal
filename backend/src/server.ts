// Import required modules and initialize environment variables
require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Web framework for handling HTTP requests
const path = require("path"); // Utility for handling file paths
const multer = require("multer"); // Middleware for handling file uploads
const fs = require("fs"); // File system module for working with files
const cors = require("cors"); // CORS middleware for cross-origin requests
const mongoose = require("mongoose"); // MongoDB ODM

// Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import authentication routes
import authRoutes from './routes/authRoutes';

// Define types for request and response
interface CustomRequest {
  body: { msg: string };
  file?: any;
  query?: { msg?: string };
}

interface CustomResponse {
  send: (data: any) => void;
  status: (code: number) => CustomResponse;
  json: (data: any) => void;
}

// Define type for inline image data
interface InlineImageData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

// Initialize Express app
const app = express();

// Set up Multer for file uploads. Uploaded files will be stored in "uploads/" directory.
const uploads = multer({ dest: "uploads/" });

// Check if the GEMINI_API_KEY is available in the environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error("Error: env file is missing the API KEY");
  process.exit(1); // Exit the process if the API key is not set
}

// Initialize Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware to parse URL-encoded and JSON payloads
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare_portal';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error: any) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Use authentication routes
app.use('/api/auth', authRoutes);

// Function to limit response to 4-5 sentences
const limitResponseLength = (text: string): string => {
  // Split text by sentence-ending punctuation followed by a space or end of string
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [];
  
  // If we have more than 5 sentences, limit to 5
  if (sentences.length > 5) {
    return sentences.slice(0, 5).join('').trim();
  }
  
  // If we have 4 or fewer sentences, return the original text
  return text;
};

// Function to check if a message is a medication query
const isMedicationQuery = (message: string): boolean => {
  const lowerMsg = message.toLowerCase();
  return (
    lowerMsg.includes("medication") || 
    lowerMsg.includes("drug") || 
    lowerMsg.includes("medicine") || 
    lowerMsg.includes("pill") ||
    lowerMsg.includes("tell me about") ||
    lowerMsg.includes("what is") ||
    lowerMsg.includes("information on")
  ) && (
    // Common medications
    lowerMsg.includes("lisinopril") ||
    lowerMsg.includes("metformin") ||
    lowerMsg.includes("atorvastatin") ||
    lowerMsg.includes("levothyroxine") ||
    // Add more medications as needed
    lowerMsg.includes("aspirin") ||
    lowerMsg.includes("ibuprofen") ||
    lowerMsg.includes("acetaminophen") ||
    lowerMsg.includes("tylenol") ||
    lowerMsg.includes("advil") ||
    lowerMsg.includes("lipitor") ||
    lowerMsg.includes("zocor") ||
    lowerMsg.includes("simvastatin") ||
    lowerMsg.includes("crestor") ||
    lowerMsg.includes("rosuvastatin") ||
    lowerMsg.includes("synthroid") ||
    lowerMsg.includes("prinivil") ||
    lowerMsg.includes("zestril") ||
    lowerMsg.includes("glucophage")
  );
};

// Enhanced medication prompt to guide the AI's responses for medication queries
const medicationPrompt = `
You are a helpful healthcare assistant providing information about medications. For each medication query, please structure your response to include:

1. Brief description of what the medication is and its primary use
2. Common side effects (mention only the most common ones)
3. Important precautions or warnings
4. When to consult a healthcare provider

Remember to:
- Keep your response concise (4-5 sentences maximum)
- Use simple, clear language
- Emphasize that this is general information and not medical advice
- Remind users to consult their healthcare provider for specific guidance
`;

// Health-specific system prompt to guide the AI's responses
const healthSystemPrompt = `You are a helpful healthcare assistant. Provide general health information, wellness tips, and guidance on healthy lifestyle choices. Remember to provide evidence-based information when possible, clarify that you're not a substitute for professional medical advice, be empathetic, respect privacy, avoid making definitive diagnoses, and suggest consulting healthcare professionals for specific medical concerns.`;

// General endpoint to handle user input and optional file upload
app.post("/get", uploads.single("file"), async (req: CustomRequest, res: CustomResponse) => {
  const userInput = req.body.msg; // User's text input
  const file = req.file; // Uploaded file (if any)

  try {
    // Get the Generative AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Initialize the prompt with user input
    let prompt: (string | InlineImageData)[] = [userInput];

    // If a file is uploaded, read its contents and prepare it as inline image data
    if (file) {
      const fileData = fs.readFileSync(file.path); // Read file from the temporary location
      const image: InlineImageData = {
        inlineData: {
          data: fileData.toString("base64"), // Convert file data to Base64
          mimeType: file.mimetype, // Specify the MIME type of the file
        },
      };
      prompt.push(image); // Append the image data to the prompt
    }

    // Generate content using the AI model
    const response = await model.generateContent(prompt);

    // Send the generated text response to the client
    res.send(response.response.text());
  } catch (error: any) {
    console.error("Error generating response: ", error); // Log any errors
    res.status(500).send("An error occurred while generating the response");
  } finally {
    // Cleanup: Delete the uploaded file to free up space
    if (file) {
      fs.unlinkSync(file.path);
    }
  }
});

// Health-specific endpoint for the health-bot
app.post("/health", uploads.single("file"), async (req: CustomRequest, res: CustomResponse) => {
  const userInput = req.body.msg; // User's text input
  const file = req.file; // Uploaded file (if any)

  try {
    // Get the Generative AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a chat session with the appropriate system prompt based on query type
    const isMedQuery = isMedicationQuery(userInput);
    const systemPrompt = isMedQuery ? medicationPrompt : healthSystemPrompt;
    
    const chat = model.startChat({
      generationConfig: { temperature: 0.7 },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    // Send an initial message to set the context
    await chat.sendMessage(systemPrompt + " Limit your responses to 4-5 sentences maximum.");

    // Initialize the prompt with user input
    let parts: (string | InlineImageData)[] = [userInput];

    // If a file is uploaded, read its contents and prepare it as inline image data
    if (file) {
      const fileData = fs.readFileSync(file.path); // Read file from the temporary location
      const image: InlineImageData = {
        inlineData: {
          data: fileData.toString("base64"), // Convert file data to Base64
          mimeType: file.mimetype, // Specify the MIME type of the file
        },
      };
      parts.push(image); // Append the image data to the prompt
    }

    // Generate content using the AI model in chat mode
    const response = await chat.sendMessage(parts);
    const responseText = response.response.text();

    // Limit response to 4-5 sentences
    const limitedResponse = limitResponseLength(responseText);

    // Send the limited text response to the client
    res.send(limitedResponse);
  } catch (error: any) {
    console.error("Error generating health response: ", error); // Log any errors
    
    // Provide more detailed error message
    let errorMessage = "An error occurred while generating the health response";
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    res.status(500).send(errorMessage);
  } finally {
    // Cleanup: Delete the uploaded file to free up space
    if (file) {
      fs.unlinkSync(file.path);
    }
  }
});

// GET endpoint for health queries (for easier testing in browsers)
app.get("/health", async (req: CustomRequest, res: CustomResponse) => {
  const userInput = req.query?.msg; // User's text input from query parameter
  
  if (!userInput) {
    return res.status(400).send("Please provide a 'msg' query parameter with your health question");
  }

  try {
    // Get the Generative AI model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a chat session with the appropriate system prompt based on query type
    const isMedQuery = isMedicationQuery(userInput as string);
    const systemPrompt = isMedQuery ? medicationPrompt : healthSystemPrompt;
    
    const chat = model.startChat({
      generationConfig: { temperature: 0.7 },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    });

    // Send an initial message to set the context
    await chat.sendMessage(systemPrompt + " Limit your responses to 4-5 sentences maximum.");

    // Generate content using the AI model in chat mode
    const response = await chat.sendMessage(userInput);
    const responseText = response.response.text();

    // Limit response to 4-5 sentences
    const limitedResponse = limitResponseLength(responseText);

    // Send the limited text response to the client
    res.send(limitedResponse);
  } catch (error: any) {
    console.error("Error generating health response: ", error); // Log any errors
    
    // Provide more detailed error message
    let errorMessage = "An error occurred while generating the health response";
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    res.status(500).send(errorMessage);
  }
});

// Test endpoint to verify server is running
app.get("/test", (req: CustomRequest, res: CustomResponse) => {
  res.json({ message: "Healthcare server is running correctly!" });
});

// Function to find an available port
const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
    
    server.on('error', () => {
      // Port is in use, try the next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
};

// Start the server on an available port
const startServer = async () => {
  const preferredPort = parseInt(process.env.PORT || '3000', 10);
  const PORT = await findAvailablePort(preferredPort);
  
  app.listen(PORT, () => {
    console.log(`Healthcare server running at http://localhost:${PORT}`);
    if (PORT !== preferredPort) {
      console.log(`Note: Port ${preferredPort} was in use, using port ${PORT} instead.`);
    }
  });
};

startServer();