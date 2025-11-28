#!/usr/bin/env python3
"""
Flask app to serve G-Task Manager mini app on Render
"""
import os
from flask import Flask, send_file, render_template_string

app = Flask(__name__, static_folder='.', static_url_path='')

# CORS-like headers for mini app
@app.after_request
def after_request(response):
    response.headers.add('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.add('Pragma', 'no-cache')
    response.headers.add('Expires', '0')
    return response

@app.route('/')
def index():
    """Serve the main mini app"""
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/style.css')
def css():
    """Serve stylesheet"""
    with open('style.css', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
