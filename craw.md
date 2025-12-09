# Domufi - Tokenized Real Estate Investment Platform

Domufi is a comprehensive web-based platform for tokenized real estate investments, featuring an AI-powered investment assistant, portfolio management, analytics dashboard, and marketplace.

## Features

- **Real Estate Investment Dashboard**: Track your tokenized property investments
- **AI Investment Assistant**: Get intelligent insights and recommendations
- **Portfolio Analytics**: Comprehensive performance tracking and visualization
- **Marketplace**: Browse and invest in tokenized properties
- **Advanced AI Service**: Self-learning AI system with continuous improvement
- **Responsive Web Application**: Works on all modern browsers

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/downloads/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/downloads)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd domufi
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Setup AI Service

#### Windows (PowerShell)
```powershell
cd ai_service
.\setup.ps1
```

#### Windows (Command Prompt)
```cmd
cd ai_service
start.bat
```

#### macOS/Linux
```bash
cd ai_service
chmod +x start.sh
./start.sh
```

Or manually:
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Application

### Development Mode

Start the React development server:
```bash
npm start
```

The application will automatically open in your default browser at `http://localhost:3000`

### Production Mode

First, build the React app:
```bash
npm run build
```

The built files will be in the `build/` directory. You can serve them with any static file server:

```bash
# Using serve (install with: npm install -g serve)
serve -s build

# Or using Python
cd build
python -m http.server 3000

# Or using Node.js http-server (install with: npm install -g http-server)
http-server build -p 3000
```

### Starting the AI Service

In a separate terminal, navigate to the `ai_service` directory and start the service:

```bash
cd ai_service
python main.py
```

The AI service will run on `http://localhost:8000`

**Note**: The AI service must be running for the AI Investment Assistant features to work.

## Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
domufi/
├── src/                    # React frontend source code
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # API and utility libraries
│   └── pages/             # Page components
├── ai_service/            # Python AI service backend
│   ├── ai_engine/        # AI engine modules
│   ├── utils/            # Utility functions
│   └── main.py           # FastAPI application entry point
├── public/               # Static assets
├── build/                # Production build output
└── package.json         # Node.js dependencies and scripts
```

## Pushing to GitHub

### Initial Setup

1. **Create a GitHub Repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Do NOT initialize with README, .gitignore, or license (we already have files)

2. **Initialize Git (if not already done)**
   ```bash
   git init
   ```

3. **Add Remote Repository**
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   ```

### Creating .gitignore

Create a `.gitignore` file in the root directory:

```
node_modules/
build/
.env
.env.local
*.log
.DS_Store
venv/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
ai_service/venv/
ai_service/logs/
ai_service/memory/
*.pkl
*.pth
*.h5
dist/
```

### Committing and Pushing

1. **Stage All Files**
   ```bash
   git add .
   ```

2. **Create Initial Commit**
   ```bash
   git commit -m "Initial commit: Domufi platform"
   ```

3. **Push to GitHub**
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Subsequent Updates

When making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Environment Variables

The AI service uses environment variables. Create a `.env` file in the `ai_service` directory:

```env
API_HOST=0.0.0.0
API_PORT=8000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
USE_LOCAL_MODELS=true
ENABLE_LEARNING=true
```

## Troubleshooting

### Port Already in Use

If port 3000 or 8000 is already in use:

**For React (port 3000):**
```bash
set PORT=3001 && npm start
```

**For AI Service (port 8000):**
Edit `ai_service/config.py` or set environment variable:
```bash
set API_PORT=8001
```

### Build Issues

- Clear cache and rebuild: `rm -rf node_modules build && npm install && npm run build`
- Check for port conflicts if the dev server won't start
- Ensure all dependencies are installed: `npm install`

### AI Service Not Responding

- Verify Python virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Check logs in `ai_service/logs/ai_service.log`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

