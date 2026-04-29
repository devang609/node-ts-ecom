import config from 'dotenv/config.js';
import { Sequelize } from 'sequelize';


const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.PG_HOST as string,         // e.g., 'db.neon.tech' or 'db.supabase.io'
  port: 5432,                        // Default PostgreSQL port
  database: process.env.PG_DB as string,       // Your database name
  username: process.env.PG_USER as string,     // Your database username
  password: process.env.PG_PASSWORD as string, // Your database password
  logging: true,                    // Disable Sequelize logging for production
});

export default sequelize;