import { getCollectionName, getDb } from "../../../lib/mongodb";
import { ensureArtworksSeeded } from "../../../lib/artworkSeeder";

export const runtime = "nodejs";

export async function GET() {

  try {

    await ensureArtworksSeeded();

    const db = await getDb();
    const collection = db.collection(getCollectionName());

    const totalArtworks = await collection.countDocuments();
    const artworksWithImages = await collection.countDocuments({ hasImage: true });
    const departments = await collection.distinct("department");
    const classifications = await collection.distinct("classification");

    const topDepartments = await collection
      .aggregate([
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
        {
          $limit: 5,
        },
      ])
      .toArray();

    return Response.json({
      success: true,
      data: {
        totalArtworks,
        artworksWithImages,
        totalDepartments: departments.length,
        totalClassifications: classifications.length,
        topDepartments: topDepartments.map((department) => ({
          name: department._id || "Unassigned",
          count: department.count,
        })),
      },
    });
  } catch (error) {

    console.error("GET /api/stats Failed:", error);

    return Response.json(

      {
        success: false,
        message: "Error: Failed To Retrieve Application Statistics!",
      },
      { status: 500 }

    );

  }

}