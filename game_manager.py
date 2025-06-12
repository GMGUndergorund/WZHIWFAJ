import json
import os
import uuid
from datetime import datetime

class GameManager:
    def __init__(self, data_file='data/games.json'):
        self.data_file = data_file
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        self.games = self._load_games()
    
    def _load_games(self):
        """Load games from JSON file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error loading games: {e}")
            return []
    
    def _save_games(self):
        """Save games to JSON file"""
        try:
            os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.games, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Error saving games: {e}")
    
    def add_game(self, game_data):
        """Add a new game"""
        game = {
            'id': str(uuid.uuid4()),
            'title': game_data['title'],
            'description': game_data['description'],
            'genre': game_data.get('genre', ''),
            'tags': game_data.get('tags', []),
            'download_link': game_data['download_link'],
            'logo': game_data.get('logo'),
            'upload_date': datetime.now().isoformat(),
            'downloads': 0
        }
        
        self.games.append(game)
        self._save_games()
        return game['id']
    
    def get_game(self, game_id):
        """Get a specific game by ID"""
        for game in self.games:
            if game['id'] == game_id:
                return game
        return None
    
    def get_all_games(self):
        """Get all games"""
        return self.games.copy()
    
    def update_game(self, game_id, updated_data):
        """Update an existing game"""
        for i, game in enumerate(self.games):
            if game['id'] == game_id:
                # Keep the original ID and upload date
                updated_data['id'] = game_id
                updated_data['upload_date'] = game.get('upload_date')
                updated_data['downloads'] = game.get('downloads', 0)
                self.games[i] = updated_data
                self._save_games()
                return True
        return False
    
    def delete_game(self, game_id):
        """Delete a game"""
        for i, game in enumerate(self.games):
            if game['id'] == game_id:
                del self.games[i]
                self._save_games()
                return True
        return False
    
    def increment_downloads(self, game_id):
        """Increment download count for a game"""
        for game in self.games:
            if game['id'] == game_id:
                game['downloads'] = game.get('downloads', 0) + 1
                self._save_games()
                return True
        return False
    
    def search_games(self, query):
        """Search games by title, description, or tags"""
        query = query.lower()
        results = []
        
        for game in self.games:
            if (query in game['title'].lower() or 
                query in game['description'].lower() or
                any(query in tag.lower() for tag in game.get('tags', []))):
                results.append(game)
        
        return results
    
    def get_games_by_genre(self, genre):
        """Get games by genre"""
        return [game for game in self.games if game.get('genre', '').lower() == genre.lower()]
    
    def get_genres(self):
        """Get all unique genres"""
        genres = set()
        for game in self.games:
            if game.get('genre'):
                genres.add(game['genre'])
        return sorted(list(genres))
