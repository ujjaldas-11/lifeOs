import { Pool } from "pg";
import dotenv from 'dotenv';

dotenv.config();


export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
.then(()=> console.log("datbase connection successfull!"))
.catch((err) => console.error('Database connection error', err));