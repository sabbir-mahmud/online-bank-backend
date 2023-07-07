import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import requestIp from "request-ip";
import connectDBs from "./src/config/dbConnect.js";
import useRouter from "./src/routes/userRoute.js";
const app = express();
dotenv.config();
app.use(requestIp.mw());
app.use(cors());
app.use(express.json());
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
const DATABASE_URL =
  "mongodb+srv://Server:At2iFdOIejX34zty@cluster0.idug5ne.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "Server";
connectDBs(DATABASE_URL, DATABASE_NAME);

// Routes
app.use("/server", useRouter);
app.get("/", (req, res) => {
  res.status(200).send("Server Running...");
});

// listen to port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Running Server Done", port);
});
