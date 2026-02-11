// function sendContactsForm() {
//     "use strict";

//     const input = document.querySelector("#formTel");
//     const form = document.getElementById("form");

//     const iti = intlTelInput(input, {
//         initialCountry: "lv",
//         separateDialCode: true,
//         preferredCountries: ["lv", "en", "ru"],
//         utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
//     });

//     form.addEventListener("submit", async function (e) {
//         e.preventDefault();

//         // Вставляем полный номер в value
//         input.value = iti.getNumber();

//         let error = formValidate(form);

//         if (error === 0) {
//             // Проверяем reCAPTCHA
//             if (typeof grecaptcha !== "undefined" && grecaptcha.getResponse().length === 0) {
//                 alert("Подтвердите, что вы не робот");
//                 return;
//             }

//             let formData = new FormData(form);
//             // Добавляем токен reCAPTCHA
//             if (typeof grecaptcha !== "undefined") {
//                 formData.append("g-recaptcha-response", grecaptcha.getResponse());
//             }

//             form.classList.add("_sending");
//             try {
//                 let response = await fetch("sendmail.php", {
//                     method: "POST",
//                     body: formData
//                 });

//                 if (response.ok) {
//                     let result = await response.json();
//                     alert(result.message);
//                     form.reset();
//                     if (typeof grecaptcha !== "undefined") {
//                         grecaptcha.reset(); // сбрасываем капчу
//                     }
//                 } else {
//                     alert("Ошибка сервера!");
//                 }
//             } catch (err) {
//                 alert("Ошибка при отправке формы");
//                 console.error(err);
//             }
//             form.classList.remove("_sending");
//         } else {
//             alert("Заполните обязательные поля");
//         }
//     });

//     function formValidate(form) {
//         let error = 0;
//         let formReq = form.querySelectorAll("._req");

//         for (let input of formReq) {
//             formRemoveError(input);

//             if (input.classList.contains("_email")) {
//                 if (emailTest(input)) {
//                     formAddError(input);
//                     error++;
//                 }
//             } else if (input.type === "checkbox" && !input.checked) {
//                 formAddError(input);
//                 error++;
//             } else if (input.value.trim() === "") {
//                 formAddError(input);
//                 error++;
//             }
//         }
//         return error;
//     }

//     function formAddError(input) {
//         input.parentElement.classList.add("_error");
//         input.classList.add("_error");
//     }

//     function formRemoveError(input) {
//         input.parentElement.classList.remove("_error");
//         input.classList.remove("_error");
//     }

//     function emailTest(input) {
//         return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(input.value);
//     }
// }

// export default sendContactsForm;

function sendContactsForm() {
    "use strict";

    const input = document.querySelector("#formTel");
    const form = document.getElementById("form");

    const iti = intlTelInput(input, {
        initialCountry: "lv",
        separateDialCode: true,
        preferredCountries: ["lv", "en", "ru"],
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Вставляем полный номер в value
        input.value = iti.getNumber();

        let error = formValidate(form);

        if (error === 0) {
            // Проверяем reCAPTCHA
            if (typeof grecaptcha !== "undefined" && grecaptcha.getResponse().length === 0) {
                alert("Please confirm that you are not a robot");
                return;
            }

            // Проверка корректности номера телефона
            if (!iti.isValidNumber()) {
                alert("Please enter a valid phone number");
                return;
            }

            let formData = new FormData(form);
            // Добавляем токен reCAPTCHA
            if (typeof grecaptcha !== "undefined") {
                formData.append("g-recaptcha-response", grecaptcha.getResponse());
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            form.classList.add("_sending");
            submitBtn.disabled = true;

            try {
                let response = await fetch("sendmail.php", {
                    method: "POST",
                    body: formData
                });

                let result = await response.json();

                if (result.success) {
                    alert(result.message);
                    form.reset();
                    if (typeof grecaptcha !== "undefined") {
                        grecaptcha.reset();
                    }
                } else {
                    // 👇 вот ключевое отличие — корректный вывод ошибок из PHP
                    alert(result.errors ? result.errors.join("\n") : "Form submission failed.");
                }
            } catch (err) {
                alert("Error while sending the form");
                console.error(err);
            }

            form.classList.remove("_sending");
            submitBtn.disabled = false;

        } else {
            alert("Please fill in all required fields correctly");
        }
    });

    function formValidate(form) {
        let error = 0;
        let formReq = form.querySelectorAll("._req");

        for (let input of formReq) {
            formRemoveError(input);

            if (input.classList.contains("_email")) {
                if (emailTest(input)) {
                    formAddError(input);
                    error++;
                }
            } else if (input.type === "checkbox" && !input.checked) {
                formAddError(input);
                error++;
            } else if (input.value.trim() === "") {
                formAddError(input);
                error++;
            }
        }
        return error;
    }

    function formAddError(input) {
        input.parentElement.classList.add("_error");
        input.classList.add("_error");
    }

    function formRemoveError(input) {
        input.parentElement.classList.remove("_error");
        input.classList.remove("_error");
    }

    function emailTest(input) {
        // обновлённая версия, поддерживает user+alias@gmail.com
        return !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(input.value);
    }
}

export default sendContactsForm;
