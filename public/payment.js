document
.getElementById("paymentForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const payment = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        amount: Number(document.getElementById("amount").value)
    };

    const response = await fetch("/api/payments/initiate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(payment)

    });

    const data = await response.json();

    console.log(data);

});