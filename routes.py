import os
import uuid
from flask import render_template, request, redirect, url_for, session, flash, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from app import app
from game_manager import GameManager

# Initialize game manager
game_manager = GameManager()

# Admin credentials
ADMIN_USERNAME = "Zipdaddy"
ADMIN_PASSWORD = "Kareem.1707"

def is_admin_logged_in():
    return session.get('admin_logged_in', False)

@app.route('/')
def index():
    # Get search parameters
    search = request.args.get('search', '')
    genre = request.args.get('genre', '')
    sort_by = request.args.get('sort', 'title')
    page = int(request.args.get('page', 1))
    
    # Get all games and apply filters
    games = game_manager.get_all_games()
    
    # Apply search filter
    if search:
        games = [game for game in games if 
                search.lower() in game['title'].lower() or 
                search.lower() in game['description'].lower() or
                search.lower() in ' '.join(game.get('tags', [])).lower()]
    
    # Apply genre filter
    if genre:
        games = [game for game in games if game.get('genre', '').lower() == genre.lower()]
    
    # Apply sorting
    if sort_by == 'title':
        games.sort(key=lambda x: x['title'].lower())
    elif sort_by == 'title_desc':
        games.sort(key=lambda x: x['title'].lower(), reverse=True)
    elif sort_by == 'date':
        games.sort(key=lambda x: x.get('upload_date', ''), reverse=True)
    
    # Pagination
    per_page = 12
    total_games = len(games)
    start = (page - 1) * per_page
    end = start + per_page
    games_page = games[start:end]
    
    total_pages = (total_games + per_page - 1) // per_page
    
    # Get unique genres for filter dropdown
    all_genres = list(set(game.get('genre', '') for game in game_manager.get_all_games() if game.get('genre')))
    all_genres.sort()
    
    return render_template('index.html', 
                         games=games_page,
                         search=search,
                         genre=genre,
                         sort_by=sort_by,
                         page=page,
                         total_pages=total_pages,
                         all_genres=all_genres,
                         total_games=total_games)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('Successfully logged in!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials!', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    flash('Logged out successfully!', 'info')
    return redirect(url_for('index'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if not is_admin_logged_in():
        return redirect(url_for('admin_login'))
    
    games = game_manager.get_all_games()
    return render_template('admin_dashboard.html', games=games)

@app.route('/admin/upload', methods=['GET', 'POST'])
def upload_game():
    if not is_admin_logged_in():
        return redirect(url_for('admin_login'))
    
    if request.method == 'POST':
        try:
            # Get form data
            title = request.form['title']
            description = request.form['description']
            genre = request.form['genre']
            tags = [tag.strip() for tag in request.form['tags'].split(',') if tag.strip()]
            download_link = request.form['download_link']
            
            # Handle logo upload
            logo_filename = None
            if 'logo' in request.files:
                logo_file = request.files['logo']
                if logo_file and logo_file.filename:
                    # Generate unique filename
                    file_ext = os.path.splitext(logo_file.filename)[1]
                    logo_filename = f"{uuid.uuid4()}{file_ext}"
                    logo_path = os.path.join(app.config['UPLOAD_FOLDER'], logo_filename)
                    logo_file.save(logo_path)
            
            # Create game data
            game_data = {
                'title': title,
                'description': description,
                'genre': genre,
                'tags': tags,
                'download_link': download_link,
                'logo': logo_filename
            }
            
            # Add game to storage
            game_manager.add_game(game_data)
            flash('Game uploaded successfully!', 'success')
            return redirect(url_for('admin_dashboard'))
            
        except Exception as e:
            flash(f'Error uploading game: {str(e)}', 'error')
    
    return render_template('upload_game.html')

@app.route('/admin/edit/<game_id>', methods=['GET', 'POST'])
def edit_game(game_id):
    if not is_admin_logged_in():
        return redirect(url_for('admin_login'))
    
    game = game_manager.get_game(game_id)
    if not game:
        flash('Game not found!', 'error')
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        try:
            # Update game data
            game['title'] = request.form['title']
            game['description'] = request.form['description']
            game['genre'] = request.form['genre']
            game['tags'] = [tag.strip() for tag in request.form['tags'].split(',') if tag.strip()]
            game['download_link'] = request.form['download_link']
            
            # Handle new logo upload
            if 'logo' in request.files:
                logo_file = request.files['logo']
                if logo_file and logo_file.filename:
                    # Delete old logo if exists
                    if game.get('logo'):
                        old_logo_path = os.path.join(app.config['UPLOAD_FOLDER'], game['logo'])
                        if os.path.exists(old_logo_path):
                            os.remove(old_logo_path)
                    
                    # Save new logo
                    file_ext = os.path.splitext(logo_file.filename)[1]
                    logo_filename = f"{uuid.uuid4()}{file_ext}"
                    logo_path = os.path.join(app.config['UPLOAD_FOLDER'], logo_filename)
                    logo_file.save(logo_path)
                    game['logo'] = logo_filename
            
            game_manager.update_game(game_id, game)
            flash('Game updated successfully!', 'success')
            return redirect(url_for('admin_dashboard'))
            
        except Exception as e:
            flash(f'Error updating game: {str(e)}', 'error')
    
    return render_template('edit_game.html', game=game)

@app.route('/admin/delete/<game_id>')
def delete_game(game_id):
    if not is_admin_logged_in():
        return redirect(url_for('admin_login'))
    
    game = game_manager.get_game(game_id)
    if game:
        # Delete logo file if exists
        if game.get('logo'):
            logo_path = os.path.join(app.config['UPLOAD_FOLDER'], game['logo'])
            if os.path.exists(logo_path):
                os.remove(logo_path)
        
        game_manager.delete_game(game_id)
        flash('Game deleted successfully!', 'success')
    else:
        flash('Game not found!', 'error')
    
    return redirect(url_for('admin_dashboard'))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/game/<game_id>')
def game_detail(game_id):
    game = game_manager.get_game(game_id)
    if not game:
        flash('Game not found!', 'error')
        return redirect(url_for('index'))
    
    return render_template('game_detail.html', game=game)

@app.route('/api/track-download/<game_id>', methods=['POST'])
def track_download(game_id):
    """Track download count for analytics"""
    success = game_manager.increment_downloads(game_id)
    if success:
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Game not found'}), 404

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500
