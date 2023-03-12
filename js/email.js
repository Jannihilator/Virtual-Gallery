emailjs.init("cR58JnQcg7hj5lCjX");
document
    .getElementById("myForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const serviceID = "service_cx7ak2e";
        const templateID = "template_1q9s27x";

        // send the email here
        emailjs.sendForm(serviceID, templateID, '#myForm').then(
            (response) => {
                console.log("SUCCESS!", response.status, response.text);
                alert("SUCCESS!");
            },
            (error) => {
                console.log("FAILED...", error);
                alert("FAILED...", error);
            }
        );
    });