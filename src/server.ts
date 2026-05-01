import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes.ts";
import "./models/associations.ts";
import sequelize from "./configs/database.ts";
import { env } from "./configs/env.ts";

dotenv.config();

const PORT = env.db.port;

const app = express();

// sequelize.sync({ alter: true })  // Use alter: true for auto-alter without dropping tables
//     .then(() => {
//         console.log('Database synced successfully');
//     })
//     .catch((error) => {
//         console.error('Error syncing database:', error);
//     });


app.use(express.json());

app.use('/auth', authRoutes);
// app.use(`/user`, userRoutes);

app.listen(PORT, () => {
    console.log(`Server running on: ${PORT}`);
})
