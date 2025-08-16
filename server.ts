import express from 'express';
import { prisma } from "./src/lib/prisma"
import config from "./src/config"
import db from "./src/config/dbConnection";
import cors from "cors";

const app = express();

const port = config.port

// Get all users
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Get user by id
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
  });
  res.json(user);
});

// Create user
app.post('/api/users', async (req, res) => {
  const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,
      bio,
      avatarUrl,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      location,
    },
  });
  res.json(user);
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, email, phoneNumber, bio, avatarUrl, dateOfBirth, location } = req.body;
  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName,
      email,
      phoneNumber,
      bio,
      avatarUrl,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      location,
    },
  });
  res.json(user);
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id },
  });
  res.json({ message: 'User deleted successfully' });
});

app.use(express.json());

app.use(cors(
    {
        credentials: true,
        origin: config.frontendUrl
    }
));

db.connect()
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error("Database connection error:", err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
