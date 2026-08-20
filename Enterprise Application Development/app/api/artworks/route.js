import { getCollectionName, getDb } from "../../../lib/mongodb";
import { ensureArtworksSeeded } from "../../../lib/artworkSeeder";
import { validateArtworkPayload } from "../../../lib/validation";

export const runtime = "nodejs";

function escapeRegex(value) {

  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

function serialiseArtwork(artwork) {

  return {

    ...artwork,
    _id: artwork._id.toString(),

  };

}

function getPagination(searchParams) {

  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get("limit") || 12), 1), 60);

  return {

    page,
    limit,
    skip: (page - 1) * limit,

  };

}

function getSort(sortValue) {

  const options = {

    title_asc: { title: 1 },
    title_desc: { title: -1 },
    artist_asc: { artist: 1 },
    artist_desc: { artist: -1 },
    date_asc: { dateSort: 1 },
    date_desc: { dateSort: -1 },
    classification_asc: { classification: 1 },
    department_asc: { department: 1 },

  };

  return options[sortValue] || { title: 1 };

}

function buildQuery(searchParams) {

  const query = {};
  const search = searchParams.get("search")?.trim();
  const department = searchParams.get("department")?.trim();
  const classification = searchParams.get("classification")?.trim();
  const hasImage = searchParams.get("hasImage");

  if (search) {

    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { title: regex },
      { artist: regex },
      { medium: regex },
      { department: regex },
      { classification: regex },
      { date: regex },
    ];

  }

  if (department) {

    query.department = department;

  }

  if (classification) {

    query.classification = classification;

  }

  if (hasImage === "true") {

    query.hasImage = true;

  }

  if (hasImage === "false") {

    query.hasImage = false;

  }

  return query;

}

export async function GET(request) {

  try {

    await ensureArtworksSeeded();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const db = await getDb();
    const collection = db.collection(getCollectionName());
    const query = buildQuery(searchParams);
    const sort = getSort(searchParams.get("sort"));
    const totalItems = await collection.countDocuments(query);
    const artworks = await collection.find(query).sort(sort).skip(skip).limit(limit).toArray();

    return Response.json({

      success: true,
      data: artworks.map(serialiseArtwork),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },

    });
  } catch (error) {

    console.error("GET /api/artworks Failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Retrieve Artworks!",
      },
      { status: 500 }
    );

  }
}

export async function POST(request) {

  try {

    await ensureArtworksSeeded();
    const body = await request.json();
    const validation = validateArtworkPayload(body);

    if (!validation.isValid) {

      return Response.json(
        {
          success: false,
          message: "Error: Artwork Validation Failed!",
          errors: validation.errors,
        },
        { status: 400 }
      );

    }

    const db = await getDb();
    const collection = db.collection(getCollectionName());
    const newArtwork = {

      ...validation.data,
      objectId: Date.now(),
      artistBio: "",
      creditLine: "",
      cataloged: "App",
      onView: "",
      createdAt: new Date(),
      
    };

    const result = await collection.insertOne(newArtwork);

    return Response.json(
      {
        success: true,
        message: "Artwork Added Successfully!",
        data: serialiseArtwork({
          ...newArtwork,
          _id: result.insertedId,
        }),
      },
      { status: 201 }
    );
  } catch (error) {

    console.error("POST /api/artworks failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Add Artwork!",
      },
      { status: 500 }
    );
    
  }
}