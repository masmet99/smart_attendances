export async function measureApi(name, callback) {

    const start = performance.now();

    console.log("");
    console.log("========================================");
    console.log("API :", name);
    console.log(
        "START :",
        new Date().toLocaleTimeString()
    );

    try {

        const result = await callback();

        const end = performance.now();

        console.log(
            "END :",
            new Date().toLocaleTimeString()
        );

        console.log(
            "RESPONSE TIME :",
            (end - start).toFixed(2),
            "ms"
        );

        console.log("STATUS : SUCCESS");
        console.log("========================================");

        return result;

    } catch (err) {

        const end = performance.now();

        console.log(
            "END :",
            new Date().toLocaleTimeString()
        );

        console.log(
            "RESPONSE TIME :",
            (end - start).toFixed(2),
            "ms"
        );

        console.log("STATUS : FAILED");
        console.log("========================================");

        throw err;
    }

}