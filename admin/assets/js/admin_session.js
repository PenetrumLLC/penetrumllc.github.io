(async function checkAdminSessionLoop() {
  let API_BASE_URL = "";

  async function initBaseUrl() {
    try {
      const res = await fetch("../data/env.json");
      const config = await res.json();
      const isDev = location.hostname.includes("localhost") || location.hostname === "127.0.0.1";
      API_BASE_URL = isDev ? config.dev : config.prod;
    } catch (e) {
      redirectToLogin();
    }
  }

  async function checkSession() {
    const raw = localStorage.getItem("adminSession");
    if (!raw) return redirectToLogin();

    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.token;

      if (!token) return redirectToLogin();

      const response = await fetch(`${API_BASE_URL}/admin/session/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      if (!result.success) redirectToLogin();
    } catch (err) {
      redirectToLogin();
    }
  }

  function redirectToLogin() {
    localStorage.removeItem("adminSession");
    window.location.href = "../index.html";
  }

  await initBaseUrl();
  await checkSession();
  setInterval(checkSession, 6000);
})();
