(async function checkSessionLoop() {
    let base_url = "";

    try {
        const res = await fetch("../data/env.json");
        const config = await res.json();

        const isDev = location.hostname.includes("localhost") || location.hostname === "127.0.0.1";
        base_url = isDev ? config.dev : config.prod;

        setInterval(async () => {
            const raw = localStorage.getItem("dashboardData");
            if (!raw) return;

            try {
                const parsed = JSON.parse(raw);
                const token = parsed?.data?.token;

                if (!token) {
                    localStorage.removeItem("dashboardData");
                    return redirect();
                }

                const res = await fetch(`${base_url}/user/session/check`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                });

                const data = await res.json();

                if (!data.success) {
                    localStorage.removeItem("dashboardData");
                    return redirect();
                }

            } catch (err) {
                console.error("Session check failed", err);
                localStorage.removeItem("dashboardData");
                redirect();
            }
        }, 60000);

    } catch (err) {
        console.error("Error loading config or starting session check", err);
        redirect();
    }

    function redirect() {
        window.location = "login.html";
    }
})();
