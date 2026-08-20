"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import logo from "./images/logo.png";

const emptyForm = {
  title: "",
  artist: "",
  date: "",
  medium: "",
  classification: "",
  department: "",
  nationality: "",
  accessionNumber: "",
  imageUrl: "",
  momaUrl: "",
  heightCm: "",
  widthCm: "",
};

const sortOptions = [
  { value: "title_asc", label: "Title A - Z" },
  { value: "title_desc", label: "Title Z - A" },
  { value: "artist_asc", label: "Artist A - Z" },
  { value: "artist_desc", label: "Artist Z - A" },
  { value: "date_desc", label: "Date Newest First" },
  { value: "date_asc", label: "Date Oldest First" },
  { value: "classification_asc", label: "Classification A - Z" },
  { value: "department_asc", label: "Department A - Z" },
];

const currentYear = new Date().getFullYear();

const yearOptions = Array.from(
  { length: currentYear - 1599 },
  (_, index) => String(currentYear - index)
);

function extractYear(value) {
  const match = String(value || "").match(/\d{4}/);
  return match ? match[0] : "";
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

function buildDimensionsPreview(heightCm, widthCm) {
  const height = Number(heightCm);
  const width = Number(widthCm);

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(width) ||
    height <= 0 ||
    width <= 0
  ) {
    return "Enter height and width in centimetres to generate dimensions automatically.";
  }

  return `${cmToFractionalInches(height)} × ${cmToFractionalInches(width)}" (${height.toFixed(1)} × ${width.toFixed(1)} cm)`;
}

export default function HomePage() {
  const [artworks, setArtworks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    classifications: [],
  });

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [classification, setClassification] = useState("");
  const [hasImage, setHasImage] = useState("");
  const [sort, setSort] = useState("title_asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [formMode, setFormMode] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sort", sort);

    if (activeSearch) {
      params.set("search", activeSearch);
    }

    if (department) {
      params.set("department", department);
    }

    if (classification) {
      params.set("classification", classification);
    }

    if (hasImage) {
      params.set("hasImage", hasImage);
    }

    return params.toString();
  }, [activeSearch, department, classification, hasImage, limit, page, sort]);

  useEffect(() => {
    fetchArtworks();
  }, [queryString]);

  useEffect(() => {
    fetchStats();
    fetchFilterOptions();
  }, []);

  async function fetchArtworks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/artworks?${queryString}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed To Load Artworks!");
      }

      setArtworks(result.data);
      setPagination(result.pagination);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch("/api/stats");
      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
      }
    } catch {
      setStats(null);
    }
  }

  async function fetchFilterOptions() {
    try {
      const response = await fetch("/api/filters");
      const result = await response.json();

      if (response.ok && result.success) {
        setFilterOptions(result.data);
      }
    } catch {
      setFilterOptions({
        departments: [],
        classifications: [],
      });
    }
  }

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setActiveSearch("");
    setDepartment("");
    setClassification("");
    setHasImage("");
    setSort("title_asc");
    setPage(1);
    setLimit(12);
  }

  function openAddForm() {
    setFormMode("add");
    setFormData(emptyForm);
    setFormErrors({});
    setSelectedArtwork(null);
    setNotice("");
    setError("");
  }

  function openEditForm(artwork) {
    setFormMode("edit");
    setSelectedArtwork(artwork);
    setFormErrors({});
    setNotice("");
    setError("");

    setFormData({
      title: artwork.title || "",
      artist: artwork.artist || "",
      date: extractYear(artwork.date),
      medium: artwork.medium || "",
      classification: artwork.classification || "",
      department: artwork.department || "",
      nationality: artwork.nationality || "",
      accessionNumber: artwork.accessionNumber || "",
      imageUrl: artwork.imageUrl || "",
      momaUrl: artwork.momaUrl || "",
      heightCm: artwork.heightCm ?? "",
      widthCm: artwork.widthCm ?? "",
    });
  }

  function closeForm() {
    setFormMode(null);
    setSelectedArtwork(null);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function updateFormField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [field]: "",
    }));
  }

  async function submitArtworkForm(event) {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setNotice("");
      setFormErrors({});

      const url =
        formMode === "edit" && selectedArtwork
          ? `/api/artworks/${selectedArtwork._id}`
          : "/api/artworks";

      const method = formMode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (result.errors) {
          setFormErrors(result.errors);
        }

        throw new Error(result.message || "Error: Failed To Save Artwork!");
      }

      setNotice(result.message);
      closeForm();
      await fetchArtworks();
      await fetchStats();
      await fetchFilterOptions();
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteArtwork(artwork) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${artwork.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setNotice("");

      const response = await fetch(`/api/artworks/${artwork._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error: Failed To Delete Artwork!");
      }

      setNotice(result.message);
      setSelectedArtwork(null);
      await fetchArtworks();
      await fetchStats();
      await fetchFilterOptions();
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setActionLoading(false);
    }
  }

  function goToPreviousPage() {
    setPage((current) => Math.max(current - 1, 1));
  }

  function goToNextPage() {
    setPage((current) => Math.min(current + 1, pagination.totalPages || 1));
  }

  if (!isHydrated) {
    return (
      <main className="catalogue-shell">
        <section className="loading-panel">
          <div className="loader" />
          <p>Preparing catalogue interface...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="catalogue-shell">
      <header className="catalogue-header">
        <div>
          <Image src={logo} alt="MoMA catalogue logo" className="catalogue-logo" priority/>
          <p className="eyebrow">THE MUSEUM OF MODERN ART</p>
          <h1>INTERNAL CATALOGUE</h1>
        </div>
      </header>

      <section className="quick-actions-panel" aria-label="Primary catalogue actions">
        <Link href="/about" className="secondary-action dark">
          ABOUT THIS PAGE
        </Link>
      </section>

      {stats && (
        <section className="stats-grid" aria-label="Application statistics">
          <StatCard label="TOTAL ARTWORKS" value={stats.totalArtworks} />
          <StatCard label="IMAGES" value={stats.artworksWithImages} />
          <StatCard label="DEPARTMENTS" value={stats.totalDepartments} />
          <StatCard label="CLASSIFICATIONS" value={stats.totalClassifications} />
        </section>
      )}

      <section className="quick-actions-panel" aria-label="Primary catalogue actions">
        <button className="primary-action" onClick={openAddForm}>
          Add Artwork
        </button>
      </section>

      <section className="controls-panel">
        <form className="search-row" onSubmit={applySearch}>
          <label className="field field-wide">
            <span>Advanced Search</span>
            <input
              type="search"
              placeholder="Search by title, artist, medium, date, department..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>

          <button type="submit" className="primary-action">
            Search
          </button>
        </form>

        <div className="filter-grid">
          <label className="field">
            <span>Department</span>
            <select
              value={department}
              onChange={(event) => {
                setPage(1);
                setDepartment(event.target.value);
              }}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Classification</span>
            <select
              value={classification}
              onChange={(event) => {
                setPage(1);
                setClassification(event.target.value);
              }}
            >
              <option value="">All Classifications</option>
              {filterOptions.classifications.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Image Availability</span>
            <select
              value={hasImage}
              onChange={(event) => {
                setPage(1);
                setHasImage(event.target.value);
              }}
            >
              <option value="">All Artworks</option>
              <option value="true">Image Available</option>
              <option value="false">Image Unavailable</option>
            </select>
          </label>

          <label className="field">
            <span>Sort Results</span>
            <select
              value={sort}
              onChange={(event) => {
                setPage(1);
                setSort(event.target.value);
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Items Per Page</span>
            <select
              value={limit}
              onChange={(event) => {
                setPage(1);
                setLimit(Number(event.target.value));
              }}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
            </select>
          </label>

          <button className="ghost-action" onClick={resetFilters}>Reset Filters</button>
        </div>
      </section>

      {(notice || error) && (
        <section className="message-stack">
          {notice && <p className="success-message">{notice}</p>}
          {error && <p className="error-message">{error}</p>}
        </section>
      )}

      {loading ? (
        <section className="loading-panel">
          <div className="loader" />
          <p>Loading Artworks From MongoDB...</p>
        </section>
      ) : artworks.length === 0 ? (
        <section className="empty-panel">
          <h2>No Artworks Found!</h2>
          <p>Try Changing Search Term / Filters / Sorting Options</p>
          <button className="primary-action" onClick={resetFilters}>CLEAR SEARCH & FILTERS</button>
        </section>
      ) : (
        <section className="artwork-grid">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork._id}
              artwork={artwork}
              onView={setSelectedArtwork}
              onEdit={openEditForm}
              onDelete={deleteArtwork}
              disabled={actionLoading}
            />
          ))}
        </section>
      )}

      <section className="results-toolbar">
        <p>
          Showing Page <strong>{pagination.page}</strong> of{" "}
          <strong>{pagination.totalPages || 1}</strong> | {" "}
          <strong>{pagination.totalItems}</strong> Total Results
        </p>
      </section>

      <section className="pagination-bar">
        <button
          className="secondary-action dark"
          onClick={goToPreviousPage}
          disabled={Boolean(pagination.page <= 1 || loading)}
        >
          Previous
        </button>

        <span>
          Page {pagination.page} of {pagination.totalPages || 1}
        </span>

        <button
          className="secondary-action dark"
          onClick={goToNextPage}
          disabled={Boolean(pagination.page >= pagination.totalPages || loading)}
        >
          Next
        </button>
      </section>

      {selectedArtwork && !formMode && (
        <ArtworkDetailsModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onEdit={openEditForm}
          onDelete={deleteArtwork}
          disabled={actionLoading}
        />
      )}

      {formMode && (
        <ArtworkFormModal
          mode={formMode}
          formData={formData}
          formErrors={formErrors}
          actionLoading={actionLoading}
          onChange={updateFormField}
          onClose={closeForm}
          onSubmit={submitArtworkForm}
        />
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
    </article>
  );
}

function ArtworkCard({ artwork, onView, onEdit, onDelete, disabled }) {
  return (
    <article className="artwork-card">
      <div className="artwork-image-wrap">
        {artwork.imageUrl ? (
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="artwork-image"
            onError={(event) => {
              event.currentTarget.style.display = "none";
              event.currentTarget.nextElementSibling.style.display = "flex";
            }}
          />
        ) : null}

        <div
          className="image-fallback"
          style={{ display: artwork.imageUrl ? "none" : "flex" }}
        >
          N/A
        </div>
      </div>

      <div className="artwork-card-body">
        <p className="artwork-meta">{artwork.classification}</p>
        <h2>{artwork.title}</h2>
        <p className="artist-line">{artwork.artist}</p>

        <dl className="mini-details">
          <div>
            <dt>Date</dt>
            <dd>{artwork.date || "Unknown"}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{artwork.department || "Unassigned"}</dd>
          </div>
        </dl>

        <div className="card-actions">
          <button className="small-action view-action" onClick={() => onView(artwork)}>
            View
          </button>
          <button className="small-action edit-action" onClick={() => onEdit(artwork)}>
            Edit
          </button>
          <button
            className="small-action danger"
            onClick={() => onDelete(artwork)}
            disabled={disabled}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function ArtworkDetailsModal({ artwork, onClose, onEdit, onDelete, disabled }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-panel detail-modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <div className="detail-content">
          <p className="eyebrow">{artwork.classification}</p>
          <h2>{artwork.title}</h2>
          <p className="detail-artist">{artwork.artist}</p>

          <dl className="detail-list">
            <DetailItem label="Date" value={artwork.date} />
            <DetailItem label="Medium" value={artwork.medium} />
            <DetailItem label="Dimensions" value={artwork.dimensions} />
            <DetailItem label="Department" value={artwork.department} />
            <DetailItem label="Nationality" value={artwork.nationality} />
            <DetailItem label="Accession Number" value={artwork.accessionNumber} />
          </dl>

          <div className="detail-image-wrap full-width-image">
          {artwork.imageUrl ? (
            <img src={artwork.imageUrl} alt={artwork.title} />
          ) : (
            <div className="image-fallback large">Image Unavailable</div>
          )}
        </div>

          <div className="modal-actions modal-action-grid">
            {artwork.momaUrl ? (
              <a
                href={artwork.momaUrl}
                target="_blank"
                rel="noreferrer"
                className="small-action view-action"
              >
                View MoMA Record
              </a>
            ) : (
              <button className="small-action view-action" disabled>
                No MoMA Record
              </button>
            )}

            <button className="small-action edit-action" onClick={() => onEdit(artwork)}>
              Edit Artwork
            </button>

            <button
              className="small-action danger"
              onClick={() => onDelete(artwork)}
              disabled={disabled}
            >
              Delete Artwork
            </button>
          </div>
        </div>

        
      </section>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "Not specified"}</dd>
    </div>
  );
}

function ArtworkFormModal({
  mode,
  formData,
  formErrors,
  actionLoading,
  onChange,
  onClose,
  onSubmit,
}) {
  const title = mode === "add" ? "ADD NEW ARTWORK" : "UPDATE ARTWORK";
  const dimensionsPreview = buildDimensionsPreview(formData.heightCm, formData.widthCm);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-panel">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <h2>{title}</h2>

        <form className="artwork-form" onSubmit={onSubmit}>
          <FormField
            label="Title"
            field="title"
            value={formData.title}
            error={formErrors.title}
            required
            onChange={onChange}
          />

          <FormField
            label="Artist"
            field="artist"
            value={formData.artist}
            error={formErrors.artist}
            required
            onChange={onChange}
          />

          <YearSelectField
            label="Year"
            field="date"
            value={formData.date}
            error={formErrors.date}
            onChange={onChange}
          />

          <FormField
            label="Medium"
            field="medium"
            value={formData.medium}
            error={formErrors.medium}
            onChange={onChange}
          />

          <FormField
            label="Classification"
            field="classification"
            value={formData.classification}
            error={formErrors.classification}
            required
            onChange={onChange}
          />

          <FormField
            label="Department"
            field="department"
            value={formData.department}
            error={formErrors.department}
            required
            onChange={onChange}
          />

          <FormField
            label="Nationality"
            field="nationality"
            value={formData.nationality}
            error={formErrors.nationality}
            onChange={onChange}
          />

          <FormField
            label="Accession Number"
            field="accessionNumber"
            value={formData.accessionNumber}
            error={formErrors.accessionNumber}
            onChange={onChange}
          />

          <FormField
            label="Height (cm)"
            field="heightCm"
            type="number"
            step="0.1"
            min="0"
            value={formData.heightCm}
            error={formErrors.heightCm}
            onChange={onChange}
          />

          <FormField
            label="Width (cm)"
            field="widthCm"
            type="number"
            step="0.1"
            min="0"
            value={formData.widthCm}
            error={formErrors.widthCm}
            onChange={onChange}
          />

          <DimensionsPreview value={dimensionsPreview} />

          <FormField
            label="Image URL"
            field="imageUrl"
            value={formData.imageUrl}
            error={formErrors.imageUrl}
            onChange={onChange}
          />

          <FormField
            label="MoMA URL"
            field="momaUrl"
            value={formData.momaUrl}
            error={formErrors.momaUrl}
            onChange={onChange}
          />

          <div className="form-actions">
            <button type="button" className="secondary-action dark" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="primary-action" disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Artwork"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FormField({
  label,
  field,
  value,
  error,
  required = false,
  type = "text",
  step,
  min,
  onChange,
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        step={step}
        min={min}
        onChange={(event) => onChange(field, event.target.value)}
      />

      {error && <em className="field-error">{error}</em>}
    </label>
  );
}

function YearSelectField({ label, field, value, error, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>

      <select value={value} onChange={(event) => onChange(field, event.target.value)}>
        <option value="">Unknown Year</option>
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {error && <em className="field-error">{error}</em>}
    </label>
  );
}

function DimensionsPreview({ value }) {
  return (
    <div className="dimensions-preview">
      <span>Calculated Dimensions</span>
      <strong>{value}</strong>
    </div>
  );
}