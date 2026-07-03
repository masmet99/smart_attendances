import time


class CheckOutPerformance:

    def __init__(self):

        self.total_start = time.perf_counter()
        self.last_checkpoint = self.total_start

        self.location_time = 0
        self.database_time = 0

    def location_done(self):

        now = time.perf_counter()

        self.location_time = round(
            (now - self.last_checkpoint) * 1000,
            2
        )

        self.last_checkpoint = now

    def database_done(self):

        now = time.perf_counter()

        self.database_time = round(
            (now - self.last_checkpoint) * 1000,
            2
        )

        self.last_checkpoint = now

    def print(self):

        total = round(
            (time.perf_counter() - self.total_start) * 1000,
            2
        )

        print("")
        print("========== CHECK OUT PERFORMANCE ==========")
        print(f"LOCATION VALIDATION : {self.location_time} ms")
        print(f"DATABASE            : {self.database_time} ms")
        print("-------------------------------------------")
        print(f"TOTAL CHECK OUT     : {total} ms")
        print("===========================================")