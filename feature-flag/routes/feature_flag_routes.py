from flask import Blueprint, request, jsonify
from extensions import db
from models import FeatureFlag, UserFeatureOverride
from middlewares.service_auth import service_auth_required


feature_flag_bp = Blueprint('feature_flag', __name__)


@feature_flag_bp.route('/flags', methods=['POST'])
@service_auth_required
def create_feature_flag():
    data = request.json
    name = data.get('name')
    enabled = data.get('enabled')
    description = data.get('description')

    if not name or enabled is None:
        return jsonify({'error': 'Name and enabled are required'}), 400

    feature_flag = FeatureFlag(name=name, enabled=enabled, description=description)
    db.session.add(feature_flag)
    db.session.commit()
    return jsonify({'message': 'Feature flag created successfully'}), 201


@feature_flag_bp.route('/flags/evaluate', methods=['GET'])
@service_auth_required
def evaluate_feature_flag():
    user_id = request.args.get('user_id')
    feature_name = request.args.get('feature_name')

    if not user_id or not feature_name:
        return jsonify({'error': 'User ID and feature name are required'}), 400

    # first we check the override table
    user_feature_override = UserFeatureOverride.query.filter_by(user_id=user_id, feature_name=feature_name).first()
    if user_feature_override:
        return jsonify({
            'feature_key': feature_name,
            'enabled': user_feature_override.enabled,
            'source': 'override'
        }), 200
    
    # if no override, we check the feature flag table
    feature_flag = FeatureFlag.query.filter_by(name=feature_name).first()
    if feature_flag:
        return jsonify({
            'feature_key': feature_name,
            'enabled': feature_flag.enabled,
            'source': 'feature_flag'
        }), 200
    
    return jsonify({
        'feature_key': feature_name,
        'enabled': False,
        'source': 'default'
    }), 200