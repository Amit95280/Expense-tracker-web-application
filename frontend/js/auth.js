/* =========================
   REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;

        const email = document.getElementById("email").value;

        const password = document.getElementById("password").value;

        try {

            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.detail ||
                    "Registration failed"
                );

                return;

            }

            alert(
                "Registration successful! Please login."
            );

            window.location.href = "login.html";

        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to backend."
            );

        }

    });

}


/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        try {

            const formData = new URLSearchParams();

            formData.append(
                "username",
                email
            );

            formData.append(
                "password",
                password
            );


            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok) {

                alert(
                    data.detail ||
                    "Invalid email or password"
                );

                return;

            }


            localStorage.setItem(
                "access_token",
                data.access_token
            );


            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(error);

            alert(
                "Cannot connect to backend."
            );

        }

    });

}