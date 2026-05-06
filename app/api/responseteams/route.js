import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

export const dynamic = "force-dynamic";

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
  const { TeamName, Specialization, ContactInfo, AvailabilityStatus, Latitude, Longitude } = await req.json();
  if (!TeamName || !Specialization || !ContactInfo || !AvailabilityStatus) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("name",    sql.VarChar(150), TeamName)
    .input("spec",    sql.VarChar(100), Specialization)
    .input("contact", sql.VarChar(200), ContactInfo)
    .input("status",  sql.VarChar(20),  AvailabilityStatus)
    .input("lat",     sql.Decimal(9,6), Latitude  || null)
    .input("lng",     sql.Decimal(9,6), Longitude || null)
    .query(`INSERT INTO ResponseTeam (TeamName, Specialization, ContactInfo, AvailabilityStatus, Latitude, Longitude)
            OUTPUT INSERTED.*
            VALUES (@name, @spec, @contact, @status, @lat, @lng)`);
  return Response.json(result.recordset[0], { status: 201 });
}

export async function PATCH(req) {
  const { TeamID, AvailabilityStatus, Latitude, Longitude } = await req.json();
  if (!TeamID) return Response.json({ error: "TeamID required" }, { status: 400 });
  const pool = await getConnection();
  const fields = [];
  const request = pool.request().input("id", sql.Int, TeamID);
  if (AvailabilityStatus) { fields.push("AvailabilityStatus=@status"); request.input("status", sql.VarChar(20), AvailabilityStatus); }
  if (Latitude  != null)  { fields.push("Latitude=@lat");              request.input("lat",    sql.Decimal(9,6), Latitude); }
  if (Longitude != null)  { fields.push("Longitude=@lng");             request.input("lng",    sql.Decimal(9,6), Longitude); }
  if (!fields.length) return Response.json({ error: "Nothing to update" }, { status: 400 });
  await request.query(`UPDATE ResponseTeam SET ${fields.join(",")} WHERE TeamID=@id`);
  return Response.json({ success: true });
}