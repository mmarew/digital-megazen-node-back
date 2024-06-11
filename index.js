const http = require("http");
const cors = require("cors");
const express = require("express");
require("dotenv").config();
const Routes = require("./Routes/index.js");
const { updateTables } = require("./Database.js");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const WebSocket = require("ws");
const {
  getPasswordResetPin,
  verifyPhoneNumberOfPinSender,
} = require("./Services/login.service.js");

// Create an Express server
const server = express();

// Trust the proxy
server.set("trust proxy", 1); // Adjust according to your proxy setup

// Configure CORS
const corsOptions = {
  origin: process.env.ALLOWED_CLIENTS.split(","),
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
server.use(cors(corsOptions));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply security modules
server.use(helmet());

// Implement rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
server.use(limiter);

const Databases = require("./Database.js");
Databases.createBasicTables();

server.post("/", (req, res) => {
  res.end(
    "<h1><center>This server is running well in post methods.</center></h1>"
  );
});

server.get("/", async (req, res) => {
  res.json({ data: "it is working well" });
});
updateTables();

// Input validation and sanitization
server.post(
  "/path",
  [
    // Validate and sanitize fields
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 5 }).trim(),
  ],
  (req, res) => {
    // Handle the request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Proceed with the request handling
    // Add your logic here
  }
);

server.use(Routes);

// Create an HTTP server
const httpServer = http.createServer(server);

// Create a WebSocket server using the HTTP server
const wss = new WebSocket.Server({ server: httpServer });

let sendersWS = "";
wss.on("connection", function connection(ws) {
  ws.on("message", async function incoming(message) {
    // Handle received message from the client
    try {
      console.log("message.toString()", message.toString());
      let data = JSON.parse(message.toString());
      let { flag } = data;
      if (flag == "sendMyPinViaSMS") {
        let result = await getPasswordResetPin(message.toString());
        console.log("result", result);
        // Respond to the client
        sendersWS.send(JSON.stringify(result));
        ws.send("success");
      } else if (flag == "getUsersPinToSendSMS") {
        let { plainSecretkey, plainPhoneNumber } = data;
        let result = await verifyPhoneNumberOfPinSender({
          plainSecretkey,
          plainPhoneNumber,
        });
        let { Message } = result;
        console.log("Message", Message);
        if (Message == "Success") {
          sendersWS = ws;
          ws.send("connection created");
          return;
        }
        ws.send("connection can't be created");
      }
    } catch (error) {
      console.log("error", error);
      ws.send("error occurred");
    }
  });

  ws.on("close", function close() {
    // Connection closed
  });
});

// Start the HTTP server
const port = process.env.SERVER_PORT || 2020;
httpServer.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
