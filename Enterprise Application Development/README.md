# Conor Davis - C20441826 - Enterprise Application Development Assignment

## Requirements

Install the following before running the application:

- Node.js LTS (Used For Development: Prebuilt x64 Windows Installer - v24.15.0)
- npm (Gotten with Node.js LTS)

This project does not require a separate MongoDB installation because it uses MongoDB Memory Server.

## Installation

This was verified on Windows 10.

Open a terminal in the project root folder:

```bash
cd c20441826-ead-assignment
```

Ensure you are inside 'c20441826-ead-assignment' with your terminal before continuing.

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm run build
npm start
```

Open:

http://localhost:3000

## Dataset

The project uses a reduced JSON dataset based on the Museum of Modern Art artwork catalogue.

The final version uses data/artworks_10000.json - this is the GitHub file cut down to 10k entries.

The database is seeded from this file into MongoDB Memory Server.