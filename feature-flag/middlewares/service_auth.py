import os
from functools import wraps
from flask import request, jsonify

SERVICE_SECRET = os.getenv('FEATURE_FLAG_SECRET')

def service_auth_required(fn):
    @wraps(fn)

    def wrapper(*args, **kwargs):
        service_token = request.headers.get('X-Service-Token')
        print(service_token)
        if not service_token:
            return jsonify({'error': 'Service token is required'}), 401

        if service_token != SERVICE_SECRET:
            return jsonify({'error': 'Unauthorized'}), 401
        
        return fn(*args, **kwargs)

    return wrapper

