import { ObjectId } from "mongodb";
import { getCollectionName, getDb } from "../../../../lib/mongodb";
import { ensureArtworksSeeded } from "../../../../lib/artworkSeeder";
import { validateArtworkPayload } from "../../../../lib/validation";

export const runtime = "nodejs";

function serialiseArtwork(artwork) {

  return {
    ...artwork,
    _id: artwork._id.toString(),
  };

}

function invalidIdResponse() {

  return Response.json(
    {
      success: false,
      message: "Error: Invalid Artwork ID!",
    },
    { status: 400 }
  );

}

export async function GET(request, { params }) {

  try {

    await ensureArtworksSeeded();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {

      return invalidIdResponse();

    }

    const db = await getDb();
    const collection = db.collection(getCollectionName());
    const artwork = await collection.findOne({
      _id: new ObjectId(id),
    });

    if (!artwork) {

      return Response.json(
        {
          success: false,
          message: "Error: Artwork Not Found!",
        },
        { status: 404 }
      );

    }

    return Response.json({
      success: true,
      data: serialiseArtwork(artwork),
    });
  } catch (error) {

    console.error("GET /api/artworks/[id] failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Retrieve Artwork!",
      },
      { status: 500 }
    );
    
  }

}

export async function PUT(request, { params }) {

  try {

    await ensureArtworksSeeded();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {

      return invalidIdResponse();

    }

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

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: validation.data,
      },
      {
        returnDocument: "after",
      }
    );

    if (!result) {
      return Response.json(
        {
          success: false,
          message: "Error: Artwork Not Found!",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "Artwork Updated Successfully!",
      data: serialiseArtwork(result),
    });
  } catch (error) {
    
    console.error("PUT /api/artworks/[id] failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Update Artwork!",
      },
      { status: 500 }
    );

  }

}

export async function DELETE(request, { params }) {

  try {

    await ensureArtworksSeeded();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {

      return invalidIdResponse();

    }

    const db = await getDb();
    const collection = db.collection(getCollectionName());

    const result = await collection.deleteOne({

      _id: new ObjectId(id),

    });

    if (result.deletedCount === 0) {

      return Response.json(
        {
          success: false,
          message: "Error: Artwork Not Found!",
        },
        { status: 404 }
      );

    }

    return Response.json({
      success: true,
      message: "Artwork Deleted Successfully!",
    });
  } catch (error) {

    console.error("DELETE /api/artworks/[id] failed:", error);

    return Response.json(
      {
        success: false,
        message: "Error: Failed To Delete Artwork!",
      },
      { status: 500 }
    );
    
  }

}