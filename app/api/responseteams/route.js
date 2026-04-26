import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const pool = await getConnection();
  let query = `SELECT * FROM ResponseTeam`;
  if (status && status !== "All") query += ` WHERE AvailabilityStatus = '${status}'`;
  query += " ORDER BY TeamName ASC";

  const result = await pool.request().query(query);
  return Response.json(result.recordset);
}

export async function POST(req) {
  const { TeamName, Specialization, ContactInfo, AvailabilityStatus } = await req.json();
  if (!TeamName || !Specialization || !ContactInfo || !AvailabilityStatus) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("name", sql.VarChar(150), TeamName)
    .input("spec", sql.VarChar(100), Specialization)
    .input("contact", sql.VarChar(200), ContactInfo)
    .input("status", sql.VarChar(20), AvailabilityStatus)
    .query(`INSERT INTO ResponseTeam (TeamName, Specialization, ContactInfo, AvailabilityStatus)
            OUTPUT INSERTED.*
            VALUES (@name, @spec, @contact, @status)`);
  return Response.json(result.recordset[0], { status: 201 });
}

export async function PATCH(req) {
  const { TeamID, AvailabilityStatus } = await req.json();
  if (!TeamID || !AvailabilityStatus) return Response.json({ error: "TeamID and AvailabilityStatus required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request()
    .input("id", sql.Int, TeamID)
    .input("status", sql.VarChar(20), AvailabilityStatus)
    .query("UPDATE ResponseTeam SET AvailabilityStatus=@status WHERE TeamID=@id");
  return Response.json({ success: true });
}

export const dynamic = "force-dynamic";
