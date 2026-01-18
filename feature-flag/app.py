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
with app.app_context():
    db.create_all()

# test route to tes the middleware
@app.route('/test-middleware', methods=['GET'])
@service_auth_required
def test_middleware():
    return 'Hello, World!'


if __name__ == "__main__":
    app.run(debug=True, port=5001)
