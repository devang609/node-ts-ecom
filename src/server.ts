import dotenv from "dotenv";
import express from "express";
import authRoutes from './routes'

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.use(`/auth`, authRoutes);
// app.use(`/user`, userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on: ${PORT}`);
})
