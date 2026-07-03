from datetime import datetime

from utils.geofence import calculate_distance


def is_movement_valid(

    last_lat,
    last_lng,
    last_time,

    current_lat,
    current_lng,
    current_time,

    max_speed_kmh=120

):

    if (

        last_lat is None or
        last_lng is None or
        last_time is None

    ):

        return True, 0, 0

    distance_meter = calculate_distance(

        float(last_lat),
        float(last_lng),

        float(current_lat),
        float(current_lng)

    )

    hours = (

        current_time - last_time

    ).total_seconds() / 3600

    if hours <= 0:

        return True, distance_meter, 0

    speed = (

        distance_meter / 1000

    ) / hours

    return (

        speed <= max_speed_kmh,

        distance_meter,

        speed

    )