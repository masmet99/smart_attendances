import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(message)s"
)

logger = logging.getLogger("SMART_ATTENDANCE")


def log_checkin(
    user_id,
    similarity,
    threshold,
    status,
    latitude,
    longitude,
    geofence,
    distance,
    checkin_open,
    checkin_close,
    work_start,
    late_limit,
    current_time
):

    logger.info(f"""
==================== CHECK IN ====================

USER ID            : {user_id}

SIMILARITY         : {round(similarity,4)}

THRESHOLD          : {threshold}

STATUS             : {status}

--------------------------------------------------

LAT USER           : {latitude}

LNG USER           : {longitude}

LAT GEOFENCE       : {geofence.latitude}

LNG GEOFENCE       : {geofence.longitude}

DISTANCE           : {round(distance,2)} meter

RADIUS             : {geofence.radius_meter} meter

--------------------------------------------------

CHECK IN OPEN      : {checkin_open}

CHECK IN CLOSE     : {checkin_close}

WORK START         : {work_start}

LATE LIMIT         : {late_limit.time()}

CURRENT TIME       : {current_time.time()}

==================================================
""")


def log_checkout(
    user_id,
    latitude,
    longitude,
    geofence,
    distance,
    checkout_time
):

    logger.info(f"""
=================== CHECK OUT ====================

USER ID            : {user_id}

LAT USER           : {latitude}

LNG USER           : {longitude}

LAT GEOFENCE       : {geofence.latitude}

LNG GEOFENCE       : {geofence.longitude}

DISTANCE           : {round(distance,2)} meter

RADIUS             : {geofence.radius_meter} meter

CHECKOUT TIME      : {checkout_time}

==================================================
""")