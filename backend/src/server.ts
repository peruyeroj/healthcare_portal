// Import required modules and initialize environment variables
require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Web framework for handling HTTP requests
const path = require("path"); // Utility for handling file paths
const multer = require("multer"); // Middleware for handling file uploads
const fs = require("fs"); // File system module for working with files
const cors = require("cors"); // CORS middleware for cross-origin requests

// Import Google Generative AI SDK
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    
    // Create a chat session with the health system prompt
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
    await chat.sendMessage("You are a helpful healthcare assistant. Please provide accurate health information and remember you're not a substitute for professional medical advice.");

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

    // Send the generated text response to the client
    res.send(responseText);
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
    
    // Create a chat session with the health system prompt
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
    await chat.sendMessage("You are a helpful healthcare assistant. Please provide accurate health information and remember you're not a substitute for professional medical advice.");

    // Generate content using the AI model in chat mode
    const response = await chat.sendMessage(userInput);
    const responseText = response.response.text();

    // Send the generated text response to the client
    res.send(responseText);
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