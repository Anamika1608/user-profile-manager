import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const db = new pg.Client({connectionString});

export default db;