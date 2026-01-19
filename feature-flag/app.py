from flask import Flask
from extensions import db
from config import Config
from models import FeatureFlag, UserFeatureOverride
from routes.feature_flag_routes import feature_flag_bp
from middlewares.service_auth import service_auth_required
from routes.user_feature_override_routes import user_feature_override_bp

app = Flask(__name__)
app.config.from_object(Config)


db.init_app(app)


app.register_blueprint(feature_flag_bp)
app.register_blueprint(user_feature_override_bp)

# Initialize database with retry logic
def init_db():
    import time
    max_retries = 5
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            with app.app_context():
                db.create_all()
                print("Database initialized successfully")
                return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Database connection failed (attempt {attempt + 1}/{max_retries}): {e}")
                print(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                print(f"Failed to initialize database after {max_retries} attempts: {e}")
                raise

init_db()

# test route to tes the middleware
@app.route('/test-middleware', methods=['GET'])
@service_auth_required
def test_middleware():
    return 'Hello, World!'


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5001)
