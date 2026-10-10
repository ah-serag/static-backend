require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsoptions");
const cors = require("cors");
const { createServer } = require("http");
const socketConfig = require("./config/socket.js");
const bookingSocketHandler = require("./sockets/booking.handle.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { status: 429, message: "Too many requests" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const server = createServer(app);
const io = socketConfig.init(server);

io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  bookingSocketHandler(io, socket);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// public


app.get("/", (_req, res) => res.status(200).json({ status: "Ahmed is ok " }));

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
