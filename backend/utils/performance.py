import time


def start_timer():

    return time.perf_counter()


def end_timer(

    api_name: str,

    start_time: float

):

    elapsed = (

        time.perf_counter()

        - start_time

    ) * 1000

    elapsed = round(elapsed, 2)

    print("")
    print("========================================")
    print("API              :", api_name)
    print("PROCESSING TIME  :", elapsed, "ms")
    print("========================================")
    print("")

    return elapsed