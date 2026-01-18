from datetime import datetime
from extensions import db

class UserFeatureOverride(db.Model):
    __tablename__ = 'user_feature_overrides'

    # External reference (from MERN app)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=False, index=True)
    feature_name = db.Column(
        db.String(100),
        nullable=False,
        index=True
    )
    enabled = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    

    __table_args__ = (
        db.UniqueConstraint('user_id', 'feature_name', name='uix_user_feature'),
    )


    def __repr__(self):
        return f"<UserFeatureOverride {self.user_id} {self.feature_name} {self.enabled}>"

