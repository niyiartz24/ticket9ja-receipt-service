const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendReceipt = async ({ receipt, pdf }) => {

    try {

        const response = await resend.emails.send({

            from: process.env.FROM_EMAIL,

            to: receipt.email,

            subject: `Payment Receipt - ${receipt.receiptId}`,

            html: `
                <h2>Payment Successful</h2>

                <p>Hello ${receipt.payerName || "Customer"},</p>

                <p>Your payment has been received successfully.</p>

                <p>Your receipt is attached.</p>

                <p><strong>Receipt ID:</strong> ${receipt.receiptId}</p>

                <p><strong>Reference:</strong> ${receipt.reference}</p>

                <br>

                <p>Powered by Ticket9jaPay</p>
            `,

            attachments: [
                {
                    filename: `${receipt.receiptId}.pdf`,
                    content: pdf.toString("base64")
                }
            ]

        });

        console.log("Resend response:", response);

        if (response.error) {
            throw new Error(response.error.message);
        }

        return response;

    } catch (error) {

        console.error("Email Error:", error);

        throw error;

    }

};