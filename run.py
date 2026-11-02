import os
import sys
import webbrowser
import threading
import time

# Ensure dependencies are available
try:
    import flask
    import flask_cors
    import yt_dlp
    import requests
except ImportError:
    print("Installing backend dependencies...")
    os.system(f"{sys.executable} -m pip install flask flask-cors requests yt-dlp")

from backend.server import app

def open_browser():
    time.sleep(1.2)
    print("\n[Spotify Clone] Opening browser at http://127.0.0.1:5000 ...")
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == '__main__':
    print("=" * 60)
    print("         SPOTIFY CLONE (YOUTUBE AUDIO STREAMING)")
    print("=" * 60)
    print("-> Playing high-quality audio streams directly from YouTube")
    print("-> Pixel-perfect Spotify Dark Theme & Transitions")
    print("-> Synced Karaoke Lyrics, Playlists & Search")
    print("-> Web App available at: http://127.0.0.1:5000")
    print("=" * 60)
    
    # Auto-open browser in background thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)
