import sql from "mssql";

const config = {
  user: "sa",
  password: "12345678",
  server: "localhost", // Use localhost and specify instance in options
  database: "DRRAS",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: "SQLEXPRESS", // This is the key for SQLEXPRESS
  },
};

let pool;

export async function getConnection() {
  try {
    if (!pool) {
      console.log("Connecting to SQL Server (SQLEXPRESS) as sa...");
      pool = await sql.connect(config);
      console.log("Database connection established successfully.");
    }
    return pool;
  } catch (err) {
    console.error("Database Connection Error:");
    console.error("Message:", err.message);
    throw err;
  }
}
