import time


def start_timer():

    return time.perf_counter()


def log_processing(
    api_name,
    timer
):

    processing = round(

        (
            time.perf_counter() - timer
        ) * 1000,

        2

    )

    print("")
    print("========================================")
    print("API              :", api_name)
    print("PROCESSING TIME  :", processing, "ms")
    print("========================================")

    return processing