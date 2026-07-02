from models.activity_log import ActivityLog


def save_activity(

    db,

    user_id,

    activity

):

    log = ActivityLog(

        user_id=user_id,

        activity=activity

    )

    db.add(log)

    db.commit()