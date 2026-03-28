#!/usr/bin/env python3
"""
Simple HTTP server to preview the Sinornis Alert System UI
Serves the dashboard templates with proper static file handling
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)
    
    def guess_type(self, path):
        # Ensure CSS files are served with correct content type
        if path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.js'):
            return 'application/javascript'
        return super().guess_type(path)
    
    def do_GET(self):
        # Route handling for dashboard pages
        if self.path == '/' or self.path == '/dashboard':
            self.path = '/src/dashboard/templates/dashboard.html'
        elif self.path == '/alerts':
            self.path = '/src/dashboard/templates/alerts.html'
        elif self.path.startswith('/static/'):
            # Serve static files from the correct location
            self.path = '/src/dashboard/static' + self.path[7:]
        
        return super().do_GET()

def start_preview_server(port=8080):
    """Start the preview server"""
    try:
        with socketserver.TCPServer(("", port), DashboardHandler) as httpd:
            print(f"\n🚀 Sinornis Alert System Preview Server")
            print(f"📍 Server running at: http://localhost:{port}")
            print(f"🎯 Dashboard: http://localhost:{port}/dashboard")
            print(f"🚨 Alerts: http://localhost:{port}/alerts")
            print(f"\n💡 Press Ctrl+C to stop the server\n")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{port}/alerts')
                print("🌐 Browser opened automatically")
            except Exception as e:
                print(f"⚠️  Could not open browser automatically: {e}")
                print("   Please open the URL manually in your browser")
            
            # Start serving
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {port} is already in use. Trying port {port + 1}...")
            start_preview_server(port + 1)
        else:
            print(f"❌ Error starting server: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")

if __name__ == "__main__":
    start_preview_server()