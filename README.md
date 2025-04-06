# Seed Project

This project is a seed project that includes a TypeScript Express API and a TypeScript React front end. It serves as a starting point for building full-stack applications with these technologies.

## Features

- TypeScript for both front end and back end
- Express.js for building the API
- React with Vite for building the front end
- Basic project structure and sample code

## Getting Started

### Prerequisites

- Node.js (>=20.x)
- npm (>=6.x)

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/lennert-vangeert/seed.git
    cd seed
    ```

2. Install dependencies for both the server and client:
    ```sh
    cd api
    npm install
    cd ../app
    npm install
    ```

### Running the Project

1. Start the server:

    ```sh
    cd api
    npm run dev
    ```

2. Start the client:
    ```sh
    cd app
    npm run dev
    ```

The api will be running on `http://localhost:9000` and the app on `http://localhost:3000`.

## Project Structure

```
seed/
├── app/         # React front end
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── api/         # Express API
│   ├── src/
│   ├── package.json
│   └── ...
├── .gitignore
├── README.md
└── ...
```

## License

This project is licensed by me, Lennert :D
