# WhatsApp AI SaaS Platform

This project is a complete, professional, and extensible platform for creating and managing multiple autonomous WhatsApp agents based on AI. Each agent is linked to a distinct user (multi-client) and behaves like a human personal assistant.

## Features

- **Multi-Agent & Multi-Client**: Each client can connect their own WhatsApp account via QR Code. New agents can be added simply by editing the `.env` file.
- **Intelligent Behavior**: Agents introduce themselves, adopt a specific personality via system prompts, and handle conversations naturally.
- **Multi-LLM Support**: Easily switch between AI providers like Gemini (default), OpenAI, and DeepSeek.
- **Safety & Anti-Blocking**: Implements rate limiting and human-like delays to minimize the risk of being blocked by WhatsApp.
- **Human Handover**: Agents can detect when a user wants to speak to the owner and can trigger a handover process.
- **SaaS Ready**: Comes with a complete React dashboard for managing agents, viewing conversations, and checking stats.
- **API-Driven**: A Node.js/Express backend serves the frontend and manages the core WhatsApp logic.

## Architecture

The project is a monorepo composed of two main parts:

1.  **Backend (Node.js)**:
    -   **`src/core`**: Manages the WhatsApp connections using `@whiskeysockets/baileys`. The `AgentManager` orchestrates multiple `WhatsappClient` instances.
    -   **`src/ai`**: Handles interaction with Large Language Models (LLMs). The `llm-router` selects the appropriate provider, and the `MemoryManager` maintains conversation context.
    -   **`src/api`**: An Express.js server that provides a REST API for the frontend to interact with the agents (e.g., fetch QR codes, get status).
    -   **`sessions/`**: Directory where WhatsApp session data is stored, allowing agents to reconnect without re-scanning the QR code.

2.  **Frontend (React)**:
    -   **`dashboard/`**: A complete React application built with TypeScript and Tailwind CSS.
    -   **`pages/`**: Contains the main views like Login, Dashboard, and Agent Details.
    -   **`components/`**: Reusable UI components for displaying QR codes, stats, conversations, etc.
    -   **`services/mockApi.ts`**: A mock API is used for frontend development, simulating backend responses.

## Setup and Installation

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### 1. Backend Setup

1.  **Navigate to the backend directory and install dependencies:**
    ```bash
    # (From the project root)
    npm install
    ```

2.  **Create an environment file:**
    Copy the example file to create your own configuration.
    ```bash
    cp .env.example .env
    ```

3.  **Configure your agents and API keys:**
    Open the `.env` file and:
    -   Add your `GEMINI_API_KEY`.
    -   Configure the details for `AGENT_1`. You can add more agents (`AGENT_2`, `AGENT_3`, etc.) by following the same pattern.

4.  **Start the backend server:**
    ```bash
    npm run dev
    ```
    The server will start, and you will see logs indicating that it is trying to connect the agents. The first time you run it, you'll need to scan a QR code.

### 2. Frontend Setup

The frontend is self-contained within this project and requires no separate build step. Simply open `index.html` in a browser with a local web server, or use the integrated development environment.

### 3. Linking WhatsApp

1.  After starting the backend, the API is available at `http://localhost:3001`.
2.  The frontend dashboard is designed to call an endpoint like `http://localhost:3001/api/qr/agent-001` (where `agent-001` is the ID from your `.env` file).
3.  This endpoint will return a QR code image. Scan this code with your WhatsApp mobile app (`Settings > Linked Devices > Link a Device`).
4.  Once scanned, the backend will log that the agent is connected, and the session files will be saved in the `sessions/agent-001/` directory. The agent is now live!

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.
