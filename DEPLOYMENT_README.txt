# Game Hub - Deployment Package

## Quick Start

1. Extract this ZIP file to your deployment environment
2. Install Python 3.11+ 
3. Install dependencies: `pip install -r requirements.txt` (if not using pyproject.toml)
4. Set environment variable: SESSION_SECRET=your-secret-key
5. Run: `python main.py` or `gunicorn main:app`

## For Render.com Deployment

1. Connect your GitHub repository
2. Use the included render.yaml for automatic configuration
3. The app will be available at your-app.onrender.com

## For Heroku Deployment

1. Use the included Procfile
2. Set buildpack to Python
3. Add SESSION_SECRET environment variable

## Admin Credentials

- Username: Zipdaddy
- Password: Kareem.1707

## Features

- Game upload and management
- Search and filtering
- A-Z sorting by title
- Genre categorization
- Drag & drop logo upload
- Persistent data storage
- Responsive design

## File Structure

- app.py: Flask application configuration
- main.py: Application entry point
- routes.py: Web routes and handlers
- game_manager.py: Game data management
- templates/: HTML templates
- static/: CSS, JS, and assets
- data/: JSON data storage (created automatically)
- uploads/: Game logo storage (created automatically)
