import { getCollectionName, getDb } from "../../../lib/mongodb";
import { ensureArtworksSeeded } from "../../../lib/artworkSeeder";

export const runtime = "nodejs";

function cleanValues(values) {

  return values
    .filter((value) => value && value !== "Unknown" && value !== "Unassigned")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

}

export async function GET() {

  try {

    await ensureArtworksSeeded();

    const db = await getDb();
    const collection = db.collection(getCollectionName());
    const departments = cleanValues(await collection.distinct("department"));
    const classifications = cleanValues(await collection.distinct("classification"));

    return Response.json({
      success: true,
      data: {
        departments,
        classifications,
      },
    });

  } catch (error) {

    console.error("GET /api/filters Failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Retrieve Filter Options!",
      },
      { status: 500 }
    );

  }

}