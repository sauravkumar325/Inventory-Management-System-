const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");

loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    let loginData = {
        email: username.value,
        password: password.value
    };

    try {
        let response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        let data = await response.json();
        console.log(data);

        if (response.ok) {
            alert("Login successful");
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = "../dashboard/dashboard.html";
        } else {
            alert(data.detail || "Login failed");
        }
    } catch (error) {
        console.log(error);
        alert("Server error");
    }
});