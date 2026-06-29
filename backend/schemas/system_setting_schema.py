from pydantic import BaseModel
from datetime import time


class SystemSettingUpdate(
    BaseModel
):

    work_start: time

    work_end: time

    late_tolerance: int

    similarity_threshold: float