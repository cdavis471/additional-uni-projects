import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-panel">
        <Link href="/" className="return-link">RETURN</Link>

        <h1>BACKGROUND</h1>

        <p>
          This application was developed for my Enterprise Application Development assignment. It is an artwork catalogue system built with Next.js, React, Node.js and MongoDB (Memory Server). The application allows users to browse, search, filter, sort, add, update and delete artwork records from the Museum of Modern Art catalogue.
        </p>

        <h2>SYSTEM OVERVIEW</h2>

        <div className="system-diagram" aria-label="Application architecture diagram">
          <div className="diagram-box">React Catalogue Interface</div>
          <div className="diagram-arrow">↓ HTTP REQUESTS</div>
          <div className="diagram-box">Next.js Application Layer</div>
          <div className="diagram-arrow">↓ API ROUTE HANDLERS USING THE MONGODB NODE.JS DRIVER</div>
          <div className="diagram-box">MongoDB Memory Server Database</div>
          <div className="diagram-arrow">↓ SEEDED FROM</div>
          <div className="diagram-box">MoMA Artwork JSON Dataset</div>
        </div>

        <h2>TECHNOLOGIES USED</h2>

        <ul>
          <li>
            <strong>Next.js</strong> is used as the application framework. It provides the page structure for the catalogue and About page, and it provides the API route handlers used by the frontend.
          </li>
          <li>
            <strong>React</strong> is used to build the interactive catalogue interface, including the artwork cards, controls, forms and modals.
          </li>
          <li>
            <strong>Node.js</strong> provides the server-side JavaScript runtime used by the Next.js application.
          </li>
          <li>
            <strong>MongoDB</strong> stores the artwork records as document-style data.
          </li>
          <li>
            <strong>MongoDB Memory Server</strong> provides a local MongoDB database without requiring a separate MongoDB installation.
          </li>
          <li>
            <strong>CSS</strong> is used for the responsive layout, visual design, forms, buttons, modals and interaction states.
          </li>
        </ul>

        <h2>MAIN FUNCTIONALITY</h2>

        <ul>
          <li><strong>Browse</strong> artwork records in a card-based catalogue.</li>
          <li><strong>View</strong> individual artwork details in a modal.</li>
          <li><strong>Search</strong> artwork records using catalogue text fields.</li>
          <li><strong>Filter</strong> by department, classification and image availability.</li>
          <li><strong>Sort</strong> results by supported artwork fields.</li>
          <li><strong>Paginate</strong> results so that records are loaded in smaller groups.</li>
          <li><strong>Add</strong> new artwork records through a validated form.</li>
          <li><strong>Update</strong> existing artwork records.</li>
          <li><strong>Delete</strong> artwork records with confirmation.</li>
        </ul>

        <h2>LIMITATIONS & WEAKNESSES</h2>

        <p>MongoDB Memory Server is suitable for local testing, but the database can reset when the server process restarts. To handle this, the application seeds the database from the JSON dataset when the API is first used. Some artwork records have incomplete metadata and / or no image URL. The project does not include authentication, user permissions, image uploading (supports image URLs), cloud deployment or a persistent hosted database.</p>

        <h2>ALTERNATIVE APPROACHES</h2>

        <p>The application could have been built with a separate Express backend and React frontend instead of using Next.js in one project. MongoDB, without Memory Server, could have been used for more legitimate database operations. MongoDB Atlas could have also been used instead as a persistent cloud database. Authentication could also be added with a dedicated authentication service if user accounts were required.</p>

      </section>
    </main>
  );
}