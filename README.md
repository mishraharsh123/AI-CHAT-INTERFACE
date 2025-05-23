# AI Chat Interface

An AI-powered chat interface built with **Next.js**, **TypeScript**, and **Tailwind CSS**, featuring a modular plugin system for scalability and customization.

---

## 🚀 Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
# or
npm install

Start Development Server
bash
Copy
Edit
pnpm dev
# or
npm run dev


Build for Production
bash
Copy
Edit
pnpm build
# or
npm run build

Start Production Server
bash
Copy
Edit
pnpm start
# or
npm run start


🧩 Plugin Architecture & Parsing Logic:
This project uses a plugin-based architecture for handling different chat features dynamically.

How It Works:
Each plugin defines:

A trigger or keyword

Optional parsing logic

API interaction or custom response logic

The parser:

Detects relevant triggers in user input

Routes the query to the corresponding plugin

Returns structured responses from plugins

Easy to Extend:

Drop a new plugin in the plugin folder and register it.

🔌 Plugins Implemented & APIs Used
Plugin Name	Functionality	API/Logic Source
Weather Plugin	Real-time weather	OpenWeatherMap API
News Plugin	Latest news headlines	NewsAPI
Joke Plugin	Programming jokes	JokeAPI
Calculator Plugin	Basic math operations	Custom JS logic


📦 Tech Stack:

Next.js (React + TypeScript)

Tailwind CSS for styling

Radix UI for components

Zod & React Hook Form for validation

Recharts for data visualization


🤝 Contributing
Contributions are welcome!
Please fork the repo, make your changes, and open a pull request.



📄 License
This project is licensed under the MIT License.
