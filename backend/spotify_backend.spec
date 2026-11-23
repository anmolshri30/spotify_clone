# PyInstaller spec for Spotify Clone backend
# This builds a one‑file executable that includes ffmpeg.exe as a data file.
# Place ffmpeg.exe under backend/ffmpeg/ffmpeg.exe before building.

import sys
from PyInstaller.utils.hooks import collect_submodules

# Collect all submodules of yt_dlp that may be needed at runtime
hiddenimports = collect_submodules('yt_dlp')

# Data files – include ffmpeg binary
datas = [
    ('ffmpeg/ffmpeg.exe', '.')  # bundles ffmpeg.exe at the root of the exe
]

# Executable definition
exe = Analysis(
    ['backend/server.py'],
    pathex=['.'],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)
pyz = PYZ(exe.pure, exe.zipped_data, cipher=None)
exe = EXE(
    pyz,
    exe.scripts,
    exe.binaries,
    exe.zipfiles,
    exe.datas,
    name='spotify_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    icon=None,
)
coll = COLLECT(
    exe,
    name='spotify_backend',
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    exclude_binaries=False,
)
