import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";


/* GET /api/disasters  — list all disasters */
export async function getDisasters(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const severity = searchParams.get("severity");

  const pool = await getConnection();
  let query = "SELECT * FROM DISASTER";
  const conditions = [];
  if (status && status !== "All") conditions.push(`Status = '${status}'`);
  if (severity) conditions.push(`SeverityLevel = ${parseInt(severity)}`);
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY SeverityLevel DESC, StartDate DESC";

  const result = await pool.request().query(query);
  return Response.json(result.recordset);
}

/* POST /api/disasters  — create a new disaster */
export async function createDisaster(req) {
  const body = await req.json();
  const { Title, Type, SeverityLevel, StartDate, EndDate, Status, Description } = body;

  if (!Title || !Type || !SeverityLevel || !StartDate || !EndDate || !Status) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pool = await getConnection();
  const result = await pool.request()
    .input("Title",        sql.VarChar(200), Title)
    .input("Type",         sql.VarChar(50),  Type)
    .input("SeverityLevel",sql.Int,          SeverityLevel)
    .input("StartDate",    sql.DateTime2,    new Date(StartDate))
    .input("EndDate",      sql.DateTime2,    new Date(EndDate))
    .input("Status",       sql.VarChar(20),  Status)
    .input("Description",  sql.VarChar,      Description || null)
    .query(`INSERT INTO DISASTER (Title, Type, SeverityLevel, StartDate, EndDate, Status, Description)
            OUTPUT INSERTED.*
            VALUES (@Title, @Type, @SeverityLevel, @StartDate, @EndDate, @Status, @Description)`);

  return Response.json(result.recordset[0], { status: 201 });
}

/* PATCH /api/disasters  — update disaster (pass id in body) */
export async function updateDisaster(req) {
  const body = await req.json();
  const { DisasterID, Status, SeverityLevel, Title, Type, EndDate, Description } = body;
  if (!DisasterID) return Response.json({ error: "DisasterID required" }, { status: 400 });

  const pool = await getConnection();
  const fields = [];
  const request = pool.request().input("id", sql.Int, DisasterID);

  if (Status)        { fields.push("Status = @Status");               request.input("Status",        sql.VarChar(20),  Status); }
  if (SeverityLevel) { fields.push("SeverityLevel = @SeverityLevel"); request.input("SeverityLevel", sql.Int,          SeverityLevel); }
  if (Title)         { fields.push("Title = @Title");                 request.input("Title",         sql.VarChar(200), Title); }
  if (Type)          { fields.push("Type = @Type");                   request.input("Type",          sql.VarChar(50),  Type); }
  if (EndDate)       { fields.push("EndDate = @EndDate");             request.input("EndDate",       sql.DateTime2,    new Date(EndDate)); }
  if (Description !== undefined) { fields.push("Description = @Desc"); request.input("Desc",         sql.VarChar,      Description); }

  if (!fields.length) return Response.json({ error: "No fields to update" }, { status: 400 });

  await request.query(`UPDATE DISASTER SET ${fields.join(", ")} WHERE DisasterID = @id`);
  return Response.json({ success: true });
}

/* DELETE /api/disasters — delete disaster by id in body */
export async function deleteDisaster(req) {
  const { DisasterID } = await req.json();
  if (!DisasterID) return Response.json({ error: "DisasterID required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request().input("id", sql.Int, DisasterID)
    .query("DELETE FROM DISASTER WHERE DisasterID = @id");
  return Response.json({ success: true });
}

export {getDisasters as GET, createDisaster as POST , updateDisaster as PUT  , deleteDisaster as DELETE };