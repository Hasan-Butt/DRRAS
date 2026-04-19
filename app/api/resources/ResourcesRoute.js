import { getConnection } from "@/lib/dbconfig";
import sql from "mssql";

/* GET /api/resources */
export async function getResources(req) {
  const pool = await getConnection();
  const result = await pool.request().query(
    "SELECT * FROM Resource ORDER BY ResourceName ASC"
  );
  return Response.json(result.recordset);
}

/* POST /api/resources */
export async function createResource(req) {
  const { ResourceName, ResourceType, TotalQuantity, AvailableQuantity, Units } = await req.json();
  if (!ResourceName || !ResourceType || TotalQuantity == null || AvailableQuantity == null || !Units) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pool = await getConnection();
  const result = await pool.request()
    .input("rn",  sql.VarChar(150), ResourceName)
    .input("rt",  sql.VarChar(50),  ResourceType)
    .input("tq",  sql.Int,          TotalQuantity)
    .input("aq",  sql.Int,          AvailableQuantity)
    .input("u",   sql.VarChar(50),  Units)
    .query(`INSERT INTO Resource (ResourceName, ResourceType, TotalQuantity, AvailableQuantity, Units)
            OUTPUT INSERTED.* VALUES (@rn, @rt, @tq, @aq, @u)`);
  return Response.json(result.recordset[0], { status: 201 });
}

/* PATCH /api/resources */
export async function updateResource(req) {
  const body = await req.json();
  const { ResourceID, TotalQuantity, AvailableQuantity } = body;
  if (!ResourceID) return Response.json({ error: "ResourceID required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request()
    .input("id", sql.Int, ResourceID)
    .input("tq", sql.Int, TotalQuantity)
    .input("aq", sql.Int, AvailableQuantity)
    .query("UPDATE Resource SET TotalQuantity=@tq, AvailableQuantity=@aq WHERE ResourceID=@id");
  return Response.json({ success: true });
}

/* DELETE /api/resources */
export async function deleteResource(req) {
  const { ResourceID } = await req.json();
  if (!ResourceID) return Response.json({ error: "ResourceID required" }, { status: 400 });
  const pool = await getConnection();
  await pool.request().input("id", sql.Int, ResourceID)
    .query("DELETE FROM Resource WHERE ResourceID=@id");
  return Response.json({ success: true });
}
