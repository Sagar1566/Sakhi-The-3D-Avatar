# Sakhi - The 3D Avatar 🤖

An advanced AI-powered 3D avatar platform with real-time voice interaction, AR capabilities, and intelligent conversation features powered by Google Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)

## 🌟 Features

- **🎭 3D Avatar Interaction**: Realistic 3D avatar with lip-sync and facial animations
- **🎤 Voice Recognition**: Real-time speech-to-text using Web Speech API
- **🔊 Text-to-Speech**: Natural voice synthesis for avatar responses
- **🤖 AI-Powered**: Intelligent conversations using Google Gemini AI
- **📱 AR Support**: View your avatar in augmented reality using your device camera
- **💬 Real-time Communication**: WebSocket-based bidirectional communication
- **📝 Reminder System**: Set and manage reminders with natural language
- **🔐 Authentication**: Secure user authentication and session management
- **🎨 Modern UI**: Beautiful, responsive interface with glassmorphism effects
- **🐳 Docker Ready**: Fully containerized for easy deployment

## 🏗️ Architecture

This is a monorepo project built with:

### Frontend (Client)
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with custom animations
- **UI Components**: Radix UI primitives
- **3D Rendering**: Ready Player Me avatars with model-viewer
- **State Management**: React Context API
- **Type Safety**: TypeScript

### Backend (Server)
- **Framework**: FastAPI (Python)
- **AI Engine**: Google Gemini AI
- **Package Manager**: UV (ultra-fast Python package manager)
- **WebSocket**: Real-time bidirectional communication
- **Image Processing**: Base64 encoding for avatar screenshots

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20 or higher
- **pnpm**: v8 or higher (install with `npm install -g pnpm`)
- **Python**: 3.11 or higher
- **UV**: Python package manager (install from https://astral.sh/uv)
- **Docker** (optional): For containerized deployment

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Sagar1566/Sakhi-The-3D-Avatar.git
cd Sakhi-The-3D-Avatar
```

### 2. Environment Setup

Copy the environment example file and configure your variables:

```bash
# Root level
cp .env.example .env

# Edit .env and add your GEMINI_API_KEY
# Get your API key from: https://makersuite.google.com/app/apikey
```

### 3. Install Dependencies

```bash
# Install all dependencies for both client and server
pnpm monorepo-setup
```

This command will:
- Install Node.js dependencies using pnpm
- Set up Python virtual environment using UV
- Install all Python dependencies

### 4. Development Mode

Start both client and server in development mode:

```bash
pnpm dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

Or run them separately:

```bash
# Terminal 1 - Start client
pnpm dev:client

# Terminal 2 - Start server
pnpm dev:server
```

## 🏭 Production Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Build and start all services
pnpm docker:build
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

### Option 2: Manual Production Build

```bash
# Build both applications
pnpm build

# Start in production mode
pnpm start
```

### Option 3: Deploy to Cloud Platforms

#### Deploy Client to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_WS_URL`
   - `NEXT_PUBLIC_API_URL`
4. Deploy

#### Deploy Server to Render/Railway

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `uv sync`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `GEMINI_API_KEY`
   - `CORS_ORIGINS`
   - `ENVIRONMENT=production`

## 📁 Project Structure

```
Sakhi-The-3D-Avatar/
├── apps/
│   ├── client/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── contexts/      # React contexts
│   │   │   └── types/         # TypeScript types
│   │   ├── public/            # Static assets
│   │   ├── Dockerfile         # Client Docker config
│   │   └── next.config.js     # Next.js configuration
│   │
│   └── server/                # FastAPI backend
│       ├── main.py            # FastAPI application
│       ├── pyproject.toml     # Python dependencies
│       ├── Dockerfile         # Server Docker config
│       └── received_images/   # Avatar screenshots
│
├── .github/
│   └── workflows/             # CI/CD pipelines
├── docker-compose.yml         # Docker orchestration
├── pnpm-workspace.yaml        # Monorepo configuration
└── package.json               # Root package.json

```

## 🔧 Available Scripts

### Root Level

```bash
pnpm monorepo-setup    # Install all dependencies
pnpm dev               # Start both client and server
pnpm build             # Build both applications
pnpm start             # Start both in production mode
pnpm format            # Format all code
pnpm lint              # Lint client code
pnpm clean             # Clean all build artifacts
```

### Client Scripts

```bash
pnpm dev:client        # Start Next.js dev server
pnpm build:client      # Build Next.js for production
pnpm start:client      # Start Next.js production server
pnpm lint              # Run ESLint
pnpm format:client     # Format client code
```

### Server Scripts

```bash
pnpm dev:server        # Start FastAPI with hot reload
pnpm start:server      # Start FastAPI in production
pnpm format:server     # Format Python code with Black
```

### Docker Scripts

```bash
pnpm docker:build      # Build Docker images
pnpm docker:up         # Start containers
pnpm docker:down       # Stop containers
pnpm docker:logs       # View container logs
```

## 🔑 Environment Variables

### Required

- `GEMINI_API_KEY`: Your Google Gemini API key (get from https://makersuite.google.com/app/apikey)

### Optional

- `NEXT_PUBLIC_WS_URL`: WebSocket URL (default: ws://localhost:8000/ws/test-client)
- `NEXT_PUBLIC_API_URL`: API URL (default: http://localhost:8000)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `CORS_ORIGINS`: Allowed CORS origins (default: http://localhost:3000)
- `ENVIRONMENT`: Environment mode (development/production)

See `.env.example` for complete configuration.

## 🎯 Key Features Explained

### 1. AI Conversation
The avatar uses Google Gemini AI to provide intelligent, context-aware responses. It maintains conversation history and can handle complex queries.

### 2. Voice Interaction
- **Speech Recognition**: Uses browser's Web Speech API for real-time voice input
- **Text-to-Speech**: Converts AI responses to natural speech
- **Lip Sync**: Avatar's mouth movements sync with speech using visemes

### 3. AR Mode
View the 3D avatar in your physical space using WebXR and AR Quick Look:
- **Android**: Uses Scene Viewer
- **iOS**: Uses AR Quick Look
- **Desktop**: 3D preview with camera controls

### 4. Reminder System
Set reminders using natural language:
- "Remind me to call John tomorrow at 3 PM"
- "Set a reminder for my meeting in 2 hours"
- Persistent storage using localStorage

### 5. Real-time Communication
WebSocket connection provides:
- Instant message delivery
- Audio streaming with timing data
- Automatic reconnection with exponential backoff
- Connection status indicators

## 🛡️ Security Features

- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against abuse
- **Environment Isolation**: Separate dev/prod configurations
- **No Telemetry**: Next.js telemetry disabled by default

## 🎨 UI/UX Features

- **Glassmorphism**: Modern frosted glass effects
- **Dark Mode**: Eye-friendly dark theme
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Micro-interactions for better UX
- **Loading States**: Clear feedback for all actions
- **Error Handling**: User-friendly error messages

## 📊 Performance Optimizations

- **Code Splitting**: Automatic chunk splitting for faster loads
- **Image Optimization**: Next.js Image component with AVIF/WebP
- **Bundle Optimization**: Webpack optimizations for smaller bundles
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Aggressive caching strategies
- **Standalone Output**: Minimal Docker images

## 🧪 Testing

```bash
# Run linting
pnpm lint

# Format check
pnpm format:check

# Build test (ensures production build works)
pnpm build
```

## 🐛 Troubleshooting

### WebSocket Connection Failed

1. Ensure server is running on port 8000
2. Check CORS_ORIGINS includes your client URL
3. Verify NEXT_PUBLIC_WS_URL is correct

### Model Not Loading

1. Check internet connection (models load from CDN)
2. Verify Ready Player Me URL is accessible
3. Check browser console for errors

### Gemini API Errors

1. Verify GEMINI_API_KEY is set correctly
2. Check API quota at https://makersuite.google.com
3. Ensure API key has proper permissions

### Build Errors

1. Clear build cache: `pnpm clean`
2. Reinstall dependencies: `rm -rf node_modules && pnpm install`
3. Check Node.js version: `node --version` (should be v20+)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Google Gemini AI**: For the powerful AI engine
- **Ready Player Me**: For 3D avatar models
- **Vercel**: For Next.js framework
- **FastAPI**: For the excellent Python framework
- **Radix UI**: For accessible UI primitives

## 📧 Support

For support, email support@example.com or open an issue in the GitHub repository.

## 🔗 Links

- **Documentation**: [Coming Soon]
- **Demo**: [Coming Soon]
- **API Docs**: http://localhost:8000/docs (when running locally)

---

Made with ❤️ by the Sakhi Team
