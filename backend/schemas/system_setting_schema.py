from pydantic import BaseModel
from datetime import time


class SystemSettingUpdate(
    BaseModel
):

    work_start: time

    work_end: time

    checkin_open: time

    checkin_close: time

    late_tolerance: int

    similarity_threshold: float