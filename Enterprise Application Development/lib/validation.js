function cleanString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function isValidOptionalUrl(value) {
  const cleaned = cleanString(value);

  if (!cleaned) {
    return true;
  }

  try {
    const url = new URL(cleaned);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function extractSortableYear(dateValue) {
  if (!dateValue) {
    return null;
  }

  const match = String(dateValue).match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function cmToFractionalInches(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  const totalEighths = Math.round((number / 2.54) * 8);
  const whole = Math.floor(totalEighths / 8);
  const remainder = totalEighths % 8;

  if (remainder === 0) {
    return String(whole);
  }

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(remainder, 8);
  const numerator = remainder / divisor;
  const denominator = 8 / divisor;

  if (whole === 0) {
    return `${numerator}/${denominator}`;
  }

  return `${whole} ${numerator}/${denominator}`;
}

function buildDimensions(heightCm, widthCm) {
  if (heightCm === null || widthCm === null) {
    return "";
  }

  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(widthCm) ||
    heightCm <= 0 ||
    widthCm <= 0
  ) {
    return "";
  }

  return `${cmToFractionalInches(heightCm)} × ${cmToFractionalInches(widthCm)}" (${heightCm.toFixed(1)} × ${widthCm.toFixed(1)} cm)`;
}

export function validateArtworkPayload(payload) {
  const errors = {};

  const title = cleanString(payload.title);
  const artist = cleanString(payload.artist);
  const date = cleanString(payload.date);
  const medium = cleanString(payload.medium);
  const classification = cleanString(payload.classification);
  const department = cleanString(payload.department);
  const nationality = cleanString(payload.nationality);
  const accessionNumber = cleanString(payload.accessionNumber);
  const imageUrl = cleanString(payload.imageUrl);
  const momaUrl = cleanString(payload.momaUrl);

  const heightCm = optionalNumber(payload.heightCm);
  const widthCm = optionalNumber(payload.widthCm);
  const dateSort = extractSortableYear(date);

  if (!title) {
    errors.title = "Error! Title Is Required!";
  }

  if (!artist) {
    errors.artist = "Error! Artist Is Required!";
  }

  if (date && !dateSort) {
    errors.date = "Error! Year Must Be A Valid Four Digit Year!";
  }

  if (!classification) {
    errors.classification = "Error! Classification Is Required!";
  }

  if (!department) {
    errors.department = "Error! Department Is Required!";
  }

  if (!isValidOptionalUrl(imageUrl)) {
    errors.imageUrl = "Error! Image URL Must Be A Valid HTTP or HTTPS URL!";
  }

  if (!isValidOptionalUrl(momaUrl)) {
    errors.momaUrl = "Error! MoMA URL Must Be A Valid HTTP or HTTPS URL!";
  }

  if (Number.isNaN(heightCm)) {
    errors.heightCm = "Error! Height Must Be A Valid Number!";
  }

  if (Number.isNaN(widthCm)) {
    errors.widthCm = "Error! Width Must Be A Valid Number!";
  }

  if ((heightCm === null && widthCm !== null) || (heightCm !== null && widthCm === null)) {
    errors.heightCm = "Error! Height And Width Must Both Be Provided To Calculate Dimensions!";
    errors.widthCm = "Error! Height And Width Must Both Be Provided To Calculate Dimensions!";
  }

  const dimensions = buildDimensions(heightCm, widthCm);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      title,
      artist,
      date: date || "Unknown date",
      dateSort,
      medium: medium || "Not specified",
      classification,
      department,
      nationality,
      accessionNumber,
      imageUrl,
      hasImage: Boolean(imageUrl),
      momaUrl,
      dimensions,
      heightCm,
      widthCm,
      createdByApp: true,
      updatedAt: new Date(),
    },
  };
}