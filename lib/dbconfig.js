import sql from "mssql";

const config = {
  user: "sa",
  password: "h220055b",
  server: "localhost", // SQL Server alias for local instance
  database: "DRAAS", // Corrected database name
  options: {
    encrypt: false,
    trustServerCertificate: true,
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
