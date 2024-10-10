const form = document.querySelector("form");
const emailError = document.querySelector(".email-error");
const passwordError = document.querySelector(".password-error");
const nameError = document.querySelector(".name-error");
const surnameError = document.querySelector(".surname-error");
const phoneError = document.querySelector(".phone-error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //get the values
    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value;
    const surname = form.surname.value;
    const phone = form.phone.value;

    try {
        const res = await fetch("/signup", {
            method: "POST",
            body: JSON.stringify({ email, password, name, surname, phone }),
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
            
            if (data.errors.name) {
                nameError.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center name-error" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${data.errors.name}
                    </div>
                </div>
                `;
            } else {
                nameError.innerHTML = `<div class="name-error"></div>`;
            }

            if (data.errors.surname) {
                surnameError.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center surname-error" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${data.errors.surname}
                    </div>
                </div>
                `;
            } else {
                surnameError.innerHTML = `<div class="surname-error"></div>`;
            }

            if (data.errors.phone) {
                phoneError.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center phone-error" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
                    <div>
                        ${data.errors.phone}
                    </div>
                </div>
                `;
            } else {
                phoneError.innerHTML = `<div class="phone-error"></div>`;
            }
        }
        
        if (data.user) {
            location.assign("/account");
        }
    } catch (error) {
        console.log(error);
    }
});