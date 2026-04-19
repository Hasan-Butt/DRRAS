import { getConnection } from "@/lib/dbconfig";

export const dynamic = "force-dynamic";

export async function GET() {
  const pool = await getConnection();

  const [disasters, resources, requests, severity] = await Promise.all([
    pool.request().query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN Status='Active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN SeverityLevel=5 AND Status='Active' THEN 1 ELSE 0 END) AS critical,
        SUM(CASE WHEN SeverityLevel>=4 AND Status='Active' THEN 1 ELSE 0 END) AS high
      FROM DISASTER
    `),
    pool.request().query(`
      SELECT
        SUM(TotalQuantity) AS total,
        SUM(TotalQuantity - AvailableQuantity) AS deployed,
        SUM(AvailableQuantity) AS available
      FROM Resource
    `),
    pool.request().query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN Status='Pending' THEN 1 ELSE 0 END) AS pending
      FROM ResourceRequest
    `),
    pool.request().query(`
      SELECT SeverityLevel, COUNT(*) AS cnt
      FROM DISASTER
      GROUP BY SeverityLevel
      ORDER BY SeverityLevel
    `),
  ]);

  return Response.json({
    disasters: disasters.recordset[0],
    resources: resources.recordset[0],
    requests:  requests.recordset[0],
    severityDistribution: severity.recordset,
  });
}
