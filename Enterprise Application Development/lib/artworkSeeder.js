import fs from "fs/promises";
import path from "path";
import { getCollectionName, getDb } from "./mongodb";

function firstValue(value, fallback = "Unknown") {

  if (Array.isArray(value)) {

    const filtered = value.map((item) => String(item || "").trim()).filter(Boolean);
    return filtered.length > 0 ? filtered.join(", ") : fallback;

  }

  if (value === null || value === undefined || value === "") {

    return fallback;

  }

  return String(value).trim();

}

function numberOrNull(value) {

  const number = Number(value);
  return Number.isFinite(number) ? number : null;

}

function extractSortableYear(dateValue) {

  if (!dateValue) {

    return null;

  }

  const match = String(dateValue).match(/\d{4}/);
  return match ? Number(match[0]) : null;

}

function normaliseArtwork(rawArtwork) {

  const title = firstValue(rawArtwork.Title, "Untitled");
  const artist = firstValue(rawArtwork.Artist, "Unknown Artist");
  const medium = firstValue(rawArtwork.Medium, "Not specified");
  const classification = firstValue(rawArtwork.Classification, "Unclassified");
  const department = firstValue(rawArtwork.Department, "Unassigned");
  const imageUrl = firstValue(rawArtwork.ImageURL, "");
  const momaUrl = firstValue(rawArtwork.URL, "");

  return {

    objectId: numberOrNull(rawArtwork.ObjectID),
    title,
    artist,
    artistBio: firstValue(rawArtwork.ArtistBio, ""),
    nationality: firstValue(rawArtwork.Nationality, ""),
    date: firstValue(rawArtwork.Date, "Unknown date"),
    dateSort: extractSortableYear(rawArtwork.Date),
    medium,
    dimensions: firstValue(rawArtwork.Dimensions, ""),
    creditLine: firstValue(rawArtwork.CreditLine, ""),
    accessionNumber: firstValue(rawArtwork.AccessionNumber, ""),
    classification,
    department,
    dateAcquired: firstValue(rawArtwork.DateAcquired, ""),
    cataloged: firstValue(rawArtwork.Cataloged, ""),
    momaUrl,
    imageUrl,
    hasImage: Boolean(imageUrl),
    onView: firstValue(rawArtwork.OnView, ""),
    heightCm: numberOrNull(rawArtwork["Height (cm)"]),
    widthCm: numberOrNull(rawArtwork["Width (cm)"]),
    createdByApp: false,
    createdAt: new Date(),
    updatedAt: new Date(),

  };

}

async function readDataset() {

  const datasetFile = process.env.DATASET_FILE || "artworks_10000.json";
  const datasetLimit = Number(process.env.DATASET_LIMIT || 10000);
  const filePath = path.join(process.cwd(), "data", datasetFile);
  const fileContents = await fs.readFile(filePath, "utf8");
  const rawData = JSON.parse(fileContents);

  if (!Array.isArray(rawData)) {

    throw new Error("Error: The Artwork Dataset Must Be A JSON Array.");

  }

  return rawData.slice(0, datasetLimit).map(normaliseArtwork);

}

export async function ensureArtworksSeeded() {

  if (!globalThis.__artworksSeedPromise) {

    globalThis.__artworksSeedPromise = seedIfEmpty();

  }

  return globalThis.__artworksSeedPromise;

}

async function seedIfEmpty() {

  const db = await getDb();
  const collection = db.collection(getCollectionName());

  await collection.createIndex({
    title: 1,
    artist: 1,
    department: 1,
    classification: 1,
    dateSort: 1,
  });

  const existingCount = await collection.estimatedDocumentCount();

  if (existingCount > 0) {

    return {
      seeded: false,
      count: existingCount,
    };

  }

  const artworks = await readDataset();

  if (artworks.length === 0) {

    throw new Error("No artworks were found in the dataset.");

  }

  await collection.insertMany(artworks);

  return {

    seeded: true,
    count: artworks.length,

  };
  
}