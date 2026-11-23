import os
import re
import time
import json
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify, Response, stream_with_context, send_from_directory
from flask_cors import CORS
import requests
import yt_dlp

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
app = Flask(__name__, static_folder=frontend_dist)
CORS(app)

# In-memory stream URL and info cache
CACHE = {}
CACHE_TTL = 7200  # 2 hours
executor = ThreadPoolExecutor(max_workers=8)

# Pre-curated Spotify playlists with verified high quality audio tracks
CURATED_PLAYLISTS = [
    {
        "id": "todays-top-hits",
        "title": "Today's Top Hits",
        "description": "Sabrina Carpenter is on top of the Hottest 50!",
        "cover": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
        "color": "#1e3264",
        "followers": "34,912,481",
        "tracks": [
            {"id": "eVli-tstM5E", "title": "Espresso", "artist": "Sabrina Carpenter", "album": "Short n' Sweet", "duration": 175, "thumbnail": "https://i.ytimg.com/vi/eVli-tstM5E/hqdefault.jpg"},
            {"id": "q3zqJs7JUCQ", "title": "Fortnight (feat. Post Malone)", "artist": "Taylor Swift", "album": "THE TORTURED POETS DEPARTMENT", "duration": 228, "thumbnail": "https://i.ytimg.com/vi/q3zqJs7JUCQ/hqdefault.jpg"},
            {"id": "fJ9rUzIMcZQ", "title": "Bohemian Rhapsody", "artist": "Queen", "album": "A Night at the Opera", "duration": 359, "thumbnail": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"},
            {"id": "4NRXx6U8ABQ", "title": "Blinding Lights", "artist": "The Weeknd", "album": "After Hours", "duration": 200, "thumbnail": "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg"},
            {"id": "TUVcZfQe-Kw", "title": "Levitating", "artist": "Dua Lipa", "album": "Future Nostalgia", "duration": 203, "thumbnail": "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg"},
            {"id": "V1Pl8CzNzCw", "title": "BIRDS OF A FEATHER", "artist": "Billie Eilish", "album": "HIT ME HARD AND SOFT", "duration": 194, "thumbnail": "https://i.ytimg.com/vi/V1Pl8CzNzCw/hqdefault.jpg"},
            {"id": "JGwWNGJdvx8", "title": "Shape of You", "artist": "Ed Sheeran", "album": "÷ (Divide)", "duration": 233, "thumbnail": "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg"},
            {"id": "kPa7bsKwL-8", "title": "Die With A Smile", "artist": "Lady Gaga & Bruno Mars", "album": "Die With A Smile", "duration": 251, "thumbnail": "https://i.ytimg.com/vi/kPa7bsKwL-8/hqdefault.jpg"}
        ]
    },
    {
        "id": "rap-caviar",
        "title": "RapCaviar",
        "description": "New music from Kendrick Lamar, Drake, Travis Scott and Future.",
        "cover": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
        "color": "#8d0f19",
        "followers": "15,820,314",
        "tracks": [
            {"id": "T6eK-2OQtew", "title": "Not Like Us", "artist": "Kendrick Lamar", "album": "Not Like Us", "duration": 274, "thumbnail": "https://i.ytimg.com/vi/T6eK-2OQtew/hqdefault.jpg"},
            {"id": "34Na4j8AVgA", "title": "Starboy", "artist": "The Weeknd ft. Daft Punk", "album": "Starboy", "duration": 230, "thumbnail": "https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg"},
            {"id": "U9BwWKXjVaI", "title": "SICKO MODE", "artist": "Travis Scott", "album": "ASTROWORLD", "duration": 312, "thumbnail": "https://i.ytimg.com/vi/U9BwWKXjVaI/hqdefault.jpg"},
            {"id": "09R8_2nJtjg", "title": "God's Plan", "artist": "Drake", "album": "Scorpion", "duration": 198, "thumbnail": "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg"},
            {"id": "WcIcVapfqXw", "title": "Like That", "artist": "Future, Metro Boomin, Kendrick Lamar", "album": "WE DON'T TRUST YOU", "duration": 267, "thumbnail": "https://i.ytimg.com/vi/WcIcVapfqXw/hqdefault.jpg"},
            {"id": "hB8S6oKGsT0", "title": "HUMBLE.", "artist": "Kendrick Lamar", "album": "DAMN.", "duration": 177, "thumbnail": "https://i.ytimg.com/vi/hB8S6oKGsT0/hqdefault.jpg"}
        ]
    },
    {
        "id": "rock-classics",
        "title": "Rock Classics",
        "description": "Rock legends & epic songs that continue to inspire generations.",
        "cover": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80",
        "color": "#e91429",
        "followers": "11,432,190",
        "tracks": [
            {"id": "fJ9rUzIMcZQ", "title": "Bohemian Rhapsody", "artist": "Queen", "album": "A Night at the Opera", "duration": 359, "thumbnail": "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"},
            {"id": "htwNVMMj588", "title": "Smells Like Teen Spirit", "artist": "Nirvana", "album": "Nevermind", "duration": 301, "thumbnail": "https://i.ytimg.com/vi/htwNVMMj588/hqdefault.jpg"},
            {"id": "1w7OgIMMRc4", "title": "Sweet Child O' Mine", "artist": "Guns N' Roses", "album": "Appetite for Destruction", "duration": 356, "thumbnail": "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg"},
            {"id": "v2AC41dglnM", "title": "Thunderstruck", "artist": "AC/DC", "album": "The Razors Edge", "duration": 292, "thumbnail": "https://i.ytimg.com/vi/v2AC41dglnM/hqdefault.jpg"},
            {"id": "tlYcUqEPN58", "title": "Back In Black", "artist": "AC/DC", "album": "Back in Black", "duration": 255, "thumbnail": "https://i.ytimg.com/vi/tlYcUqEPN58/hqdefault.jpg"},
            {"id": "BcL---4xQYA", "title": "Stairway to Heaven", "artist": "Led Zeppelin", "album": "Led Zeppelin IV", "duration": 482, "thumbnail": "https://i.ytimg.com/vi/BcL---4xQYA/hqdefault.jpg"}
        ]
    },
    {
        "id": "chill-vibes",
        "title": "Chill Hits",
        "description": "Kick back to the best new and recent chill hits.",
        "cover": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
        "color": "#477d95",
        "followers": "7,314,890",
        "tracks": [
            {"id": "H5v3kku4y6Q", "title": "As It Was", "artist": "Harry Styles", "album": "Harry's House", "duration": 167, "thumbnail": "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg"},
            {"id": "SQnc1Q3iFSU", "title": "Snooze", "artist": "SZA", "album": "SOS", "duration": 201, "thumbnail": "https://i.ytimg.com/vi/SQnc1Q3iFSU/hqdefault.jpg"},
            {"id": "b1kbLwvqugk", "title": "golden hour", "artist": "JVKE", "album": "this is what ____ feels like", "duration": 209, "thumbnail": "https://i.ytimg.com/vi/b1kbLwvqugk/hqdefault.jpg"},
            {"id": "D9G1VoFL36U", "title": "Ghost", "artist": "Justin Bieber", "album": "Justice", "duration": 153, "thumbnail": "https://i.ytimg.com/vi/D9G1VoFL36U/hqdefault.jpg"},
            {"id": "K3Qzzggn--s", "title": "drivers license", "artist": "Olivia Rodrigo", "album": "SOUR", "duration": 242, "thumbnail": "https://i.ytimg.com/vi/K3Qzzggn--s/hqdefault.jpg"}
        ]
    },
    {
        "id": "lofi-beats",
        "title": "Lo-Fi Beats",
        "description": "Beats to relax, study, and code to. Pure peaceful vibes.",
        "cover": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        "color": "#4b3b6b",
        "followers": "5,690,120",
        "tracks": [
            {"id": "jfKfPfyJRdk", "title": "beats to relax/study to", "artist": "Lofi Girl", "album": "Lofi Hip Hop Radio", "duration": 180, "thumbnail": "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"},
            {"id": "TURbeWK2wwg", "title": "Coffee Breath", "artist": "Kupla", "album": "Kingdom in Blue", "duration": 145, "thumbnail": "https://i.ytimg.com/vi/TURbeWK2wwg/hqdefault.jpg"},
            {"id": "wKhRNqQc12w", "title": "Snowman", "artist": "WYS", "album": "1 AM Study Session", "duration": 184, "thumbnail": "https://i.ytimg.com/vi/wKhRNqQc12w/hqdefault.jpg"},
            {"id": "Xg3s6C1-60g", "title": "Rainy Days", "artist": "Idealism", "album": "Rainy Days EP", "duration": 162, "thumbnail": "https://i.ytimg.com/vi/Xg3s6C1-60g/hqdefault.jpg"}
        ]
    },
    {
        "id": "all-out-2010s",
        "title": "All Out 2010s",
        "description": "The biggest songs of the 2010s.",
        "cover": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
        "color": "#bc5900",
        "followers": "12,980,450",
        "tracks": [
            {"id": "IcrbM1l_BoI", "title": "Wake Me Up", "artist": "Avicii", "album": "True", "duration": 247, "thumbnail": "https://i.ytimg.com/vi/IcrbM1l_BoI/hqdefault.jpg"},
            {"id": "kTHNpusq654", "title": "Counting Stars", "artist": "OneRepublic", "album": "Native", "duration": 257, "thumbnail": "https://i.ytimg.com/vi/kTHNpusq654/hqdefault.jpg"},
            {"id": "hT_nvWreIhg", "title": "Counting Stars", "artist": "OneRepublic", "album": "Native", "duration": 257, "thumbnail": "https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg"},
            {"id": "0KSOMA3QBU0", "title": "Dark Horse", "artist": "Katy Perry ft. Juicy J", "album": "PRISM", "duration": 215, "thumbnail": "https://i.ytimg.com/vi/0KSOMA3QBU0/hqdefault.jpg"},
            {"id": "ebXbLfLAC34", "title": "Summer", "artist": "Calvin Harris", "album": "Motion", "duration": 222, "thumbnail": "https://i.ytimg.com/vi/ebXbLfLAC34/hqdefault.jpg"}
        ]
    }
]

GENRE_CATEGORIES = [
    {"id": "pop", "name": "Pop", "color": "#8c67ac", "img": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"},
    {"id": "hiphop", "name": "Hip-Hop", "color": "#ba5d07", "img": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80"},
    {"id": "rock", "name": "Rock", "color": "#e91429", "img": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80"},
    {"id": "dance", "name": "Dance/Electronic", "color": "#1e3264", "img": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80"},
    {"id": "chill", "name": "Chill", "color": "#477d95", "img": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=80"},
    {"id": "lofi", "name": "Lo-Fi & Study", "color": "#503750", "img": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80"},
    {"id": "rnb", "name": "R&B", "color": "#dc148c", "img": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80"},
    {"id": "indie", "name": "Indie", "color": "#608108", "img": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80"},
    {"id": "workout", "name": "Workout", "color": "#777777", "img": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80"},
    {"id": "mood", "name": "Mood", "color": "#e1118c", "img": "https://images.unsplash.com/photo-1445985543468-79082488f746?w=300&auto=format&fit=crop&q=80"},
    {"id": "focus", "name": "Focus", "color": "#509bf5", "img": "https://images.unsplash.com/photo-1507842229451-7f01be8610ce?w=300&auto=format&fit=crop&q=80"},
    {"id": "gaming", "name": "Gaming", "color": "#e8115b", "img": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80"}
]

def clean_title_and_artist(raw_title, uploader):
    """Parses a YouTube title into a clean song title and artist."""
    # Clean noise like [Official Video], (Audio), (Lyrics), (Official Music Video 4K), etc.
    cleaned = re.sub(r'\[.*?\]|\(.*?\)|\|.*$', '', raw_title).strip()
    cleaned = re.sub(r'(?i)(official music video|official video|official audio|visualizer|remastered|lyric video|lyrics|ft\..*|feat\..*)', '', cleaned).strip()
    
    parts = cleaned.split(' - ')
    if len(parts) >= 2:
        artist = parts[0].strip()
        title = ' - '.join(parts[1:]).strip()
    else:
        title = cleaned if cleaned else raw_title
        artist = uploader.replace(' - Topic', '').replace('VEVO', '').strip() if uploader else "Unknown Artist"
    
    return title, artist

def extract_audio_info(video_id):
    """Extracts direct audio URL and metadata using yt_dlp."""
    now = time.time()
    if video_id in CACHE:
        cached = CACHE[video_id]
        if now - cached['timestamp'] < CACHE_TTL:
            return cached['data']
            
    ydl_opts = {
        'format': 'bestaudio/best',
        'noplaylist': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_id, download=False)
        audio_url = info.get('url')
        
        # If the primary url isn't direct or is m3u8, find best audio format
        if not audio_url or '.m3u8' in audio_url:
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none']
            if audio_formats:
                audio_formats.sort(key=lambda x: x.get('abr') or 0, reverse=True)
                audio_url = audio_formats[0].get('url')
        
        title, artist = clean_title_and_artist(info.get('title', ''), info.get('uploader', ''))
        
        thumbnails = info.get('thumbnails', [])
        thumb_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if thumbnails:
            thumb_url = thumbnails[-1].get('url', thumb_url)
            
        data = {
            'id': video_id,
            'title': title,
            'artist': artist,
            'original_title': info.get('title'),
            'duration': info.get('duration') or 0,
            'audio_url': audio_url,
            'thumbnail': thumb_url,
            'album': f"{title} - Single",
            'views': info.get('view_count', 0),
            'timestamp': now
        }
        
        CACHE[video_id] = {'data': data, 'timestamp': now}
        return data

@app.route('/api/playlists', methods=['GET'])
def get_playlists():
    return jsonify({
        'playlists': CURATED_PLAYLISTS,
        'categories': GENRE_CATEGORIES
    })

@app.route('/api/playlist/<playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    for pl in CURATED_PLAYLISTS:
        if pl['id'] == playlist_id:
            return jsonify(pl)
    return jsonify({'error': 'Playlist not found'}), 404

@app.route('/api/search', methods=['GET'])
def search_tracks():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({'results': []})
        
    limit = int(request.args.get('limit', 15))
    search_query = f"ytsearch{limit}:{query}"
    
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            res = ydl.extract_info(search_query, download=False)
            entries = res.get('entries', []) or []
            
            tracks = []
            for item in entries:
                if not item or not item.get('id'):
                    continue
                v_id = item.get('id')
                raw_title = item.get('title', 'Unknown')
                uploader = item.get('uploader') or item.get('channel') or ''
                clean_t, clean_a = clean_title_and_artist(raw_title, uploader)
                
                duration = item.get('duration') or 0
                thumb = item.get('thumbnail') or f"https://i.ytimg.com/vi/{v_id}/hqdefault.jpg"
                
                tracks.append({
                    'id': v_id,
                    'title': clean_t,
                    'artist': clean_a,
                    'original_title': raw_title,
                    'album': f"{clean_t} - Single",
                    'duration': duration,
                    'thumbnail': thumb,
                    'views': item.get('view_count', 0)
                })
                
            return jsonify({'results': tracks})
    except Exception as e:
        return jsonify({'error': str(e), 'results': []}), 500

@app.route('/api/info/<video_id>', methods=['GET'])
def get_track_info(video_id):
    try:
        data = extract_audio_info(video_id)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stream/<video_id>')
def stream_audio(video_id):
    """
    Proxies the pure audio stream from YouTube directly to the browser.
    Supports HTTP 206 Partial Content for instant seeking and scrubbing!
    """
    try:
        data = extract_audio_info(video_id)
        audio_url = data.get('audio_url')
        if not audio_url:
            return "Audio stream not found", 404
            
        req_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
        
        # Forward Range header if present
        range_header = request.headers.get('Range')
        if range_header:
            req_headers['Range'] = range_header

        # Request chunked stream from Google Video CDN
        r = requests.get(audio_url, headers=req_headers, stream=True, timeout=15)
        
        # Build proxy response headers
        headers = {}
        for h in ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Type']:
            if h in r.headers:
                headers[h] = r.headers[h]
        if 'Content-Type' not in headers:
            headers['Content-Type'] = 'audio/webm'

        return Response(
            stream_with_context(r.iter_content(chunk_size=65536)),
            status=r.status_code,
            headers=headers
        )
    except Exception as e:
        return str(e), 500

@app.route('/api/lyrics', methods=['GET'])
def get_lyrics():
    track = request.args.get('track', '').strip()
    artist = request.args.get('artist', '').strip()
    
    if not track:
        return jsonify({'lyrics': None, 'synced': None})

    # Try LRCLIB API first
    try:
        clean_track = re.sub(r'\(.*?\)|\[.*?\]', '', track).strip()
        params = {'track_name': clean_track}
        if artist and artist.lower() != 'unknown artist':
            clean_artist = artist.split(',')[0].split('&')[0].strip()
            params['artist_name'] = clean_artist
            
        url = f"https://lrclib.net/api/get?{urllib.parse.urlencode(params)}"
        resp = requests.get(url, headers={'User-Agent': 'SpotifyCloneApp/1.0'}, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            synced = data.get('syncedLyrics')
            plain = data.get('plainLyrics')
            if synced or plain:
                return jsonify({
                    'synced': synced,
                    'plain': plain,
                    'source': 'LRCLIB'
                })
    except Exception:
        pass

    # Generic fallback lyrics format
    return jsonify({
        'synced': None,
        'plain': f"♪ Enjoying {track} by {artist} ♪\n(No synchronized lyrics available for this track)",
        'source': 'fallback'
    })

# Serve Frontend static assets and SPA routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(frontend_dist, path)):
        return send_from_directory(frontend_dist, path)
    if os.path.exists(os.path.join(frontend_dist, 'index.html')):
        return send_from_directory(frontend_dist, 'index.html')
    return "Spotify Clone Frontend not built yet. Run 'npm run build' inside frontend/.", 404

if __name__ == '__main__':
    # Allow port override via environment for packaging scenarios
    port = int(os.getenv('SPOTIFY_BACKEND_PORT', '5000'))
    print(f"Spotify Clone Audio Backend running on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
