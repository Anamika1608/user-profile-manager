import express from 'express';
import config from "./src/config"
import db from "./src/config/dbConnection";
import cors from "cors";
import helmet from 'helmet';
import { userRoutes } from "./src/modules/users/users.routes"
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.middleware';

const app = express();

const port = config.port

app.use(express.json());

app.use(helmet());

app.use(cors(
  {
    credentials: true,
    origin: config.frontendUrl
  }
));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

db.connect()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Database connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

app.use("/api/users", userRoutes)

app.use(notFoundHandler);

app.use(errorHandler);