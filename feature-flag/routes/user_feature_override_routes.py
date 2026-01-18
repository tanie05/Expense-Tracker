from flask import Blueprint, request, jsonify
from extensions import db
from models import UserFeatureOverride
from middlewares.service_auth import service_auth_required


user_feature_override_bp = Blueprint('user_feature_override', __name__)

@user_feature_override_bp.route('/flags/override', methods=['POST'])
@service_auth_required
def create_user_feature_override():
    data = request.json
    user_id = data.get('user_id')
    feature_name = data.get('feature_name')
    enabled = data.get('enabled')

    if not user_id or not feature_name or enabled is None:
        return jsonify({'error': 'User ID, feature name and enabled are required'}), 400

    user_feature_override = UserFeatureOverride.query.filter_by(user_id=user_id, feature_name=feature_name).first()
    if user_feature_override:
        user_feature_override.enabled = enabled
    else:
        user_feature_override = UserFeatureOverride(user_id=user_id, feature_name=feature_name, enabled=enabled)
        db.session.add(user_feature_override)
    
    db.session.commit()
    return jsonify({
        'message': 'User feature override created/updated successfully'
    }), 200


@user_feature_override_bp.route('/flags/override', methods=['DELETE'])
@service_auth_required
def delete_user_feature_override():
    data = request.json
    user_id = data.get('user_id')
    feature_name = data.get('feature_name')

    if not user_id or not feature_name:
        return jsonify({'error': 'User ID and feature name are required'}), 400
    
    user_feature_override = UserFeatureOverride.query.filter_by(user_id=user_id, feature_name=feature_name).first()
    if user_feature_override:
        db.session.delete(user_feature_override)
        db.session.commit()
        return jsonify({
            'message': 'User feature override deleted successfully'
        }), 200
    else:
        return jsonify({'error': 'User feature override not found'}), 404