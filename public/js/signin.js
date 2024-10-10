const form_ = document.querySelector("form");
const emailError = document.querySelector(".email-error");
const passwordError = document.querySelector(".password-error");

form_.addEventListener("submit", async (e) => {
    e.preventDefault();

    //get the values
    const email = form_.email.value;
    const password = form_.password.value;


    try {
        const res = await fetch("/signin", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        console.log(data);
        if (data.errors) {
            if (data.errors.email) {
                emailError.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center email-error" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${data.errors.email}
                    </div>
                </div>
                `;
            } else {
                emailError.innerHTML = `<div class="email-error"></div>`;
            }

            if (data.errors.password) {
                passwordError.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center password-error" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${data.errors.password}
                    </div>
                </div>
                `;
            } else {
                passwordError.innerHTML = `<div class="password-error"></div>`;
            }
        }
        
        if (data.user) {
            location.assign("/account");
        }
    } catch (error) {
        console.log(error);
    }
});