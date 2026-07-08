const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendReceipt = async ({
    receipt,
    pdf
}) => {

    return await resend.emails.send({

        from: process.env.FROM_EMAIL,

        to: receipt.email,

        subject: `Payment Receipt - ${receipt.receiptId}`,

        html: `
            <h2>Payment Successful</h2>

            <p>Hello ${receipt.customerName || "Customer"},</p>

            <p>
                Thank you for your payment.
            </p>

            <p>
                Your receipt is attached.
            </p>

            <p>
                Receipt ID:
                <strong>${receipt.receiptId}</strong>
            </p>

            <p>
                Reference:
                <strong>${receipt.reference}</strong>
            </p>

            <br>

            <p>
                Thank you for using Ticket9ja.
            </p>
        `,

        attachments: [

            {

                filename: `${receipt.receiptId}.pdf`,

                content: pdf.toString("base64")

            }

        ]

    });

};