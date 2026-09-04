/* =========================
   LOGIN
========================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value.trim();


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            /*
                TEMPORARY FRONT-END LOGIN

                Later this will become:

                login.php
                    ↓
                MySQL users table
            */

            alert(
                "Login successful!"
            );


            /*
                After login,
                send customer to home page.
            */

            window.location.href =
                "../Home/home.html";

        }
    );

}


/* =========================
   SIGN UP
========================= */

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            if (password.length < 8) {

                alert(
                    "Password must be at least 8 characters."
                );

                return;
            }


            alert(
                "Account created successfully!"
            );


            /*
                Send user to Login
            */

            window.location.href =
                "login.html";

        }
    );

}


/* =========================
   SHOW / HIDE PASSWORD
========================= */

const showPassword =
    document.getElementById(
        "showPassword"
    );


if (showPassword) {

    showPassword.addEventListener(
        "click",
        function() {

            const password =
                document.getElementById(
                    "password"
                );


            if (
                password.type ===
                "password"
            ) {

                password.type =
                    "text";

                showPassword.textContent =
                    "🙈";

            } else {

                password.type =
                    "password";

                showPassword.textContent =
                    "👁";

            }

        }
    );

}


/* =========================
   GO HOME
========================= */

function goHome() {

    window.location.href =
        "../Home/home.html";

}