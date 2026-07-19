const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/*
|--------------------------------------------------------------------------
| Send Receipt
|--------------------------------------------------------------------------
*/

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

                <p>Powered by <strong>Ticket9jaPay</strong></p>
            `,

            attachments: [

                {

                    filename: `${receipt.receiptId}.pdf`,

                    content: pdf.toString("base64")

                }

            ]

        });

        if (response.error) {

            throw new Error(response.error.message);

        }

        return response;

    } catch (error) {

        console.error(error);

        throw error;

    }

};

/*
|--------------------------------------------------------------------------
| Send Invitation
|--------------------------------------------------------------------------
*/

exports.sendInvitation = async ({

    email,

    fullName,

    role,

    inviteLink

}) => {

    try {

        const response = await resend.emails.send({

            from: process.env.FROM_EMAIL,

            to: email,

            subject: "You've been invited to Ticket9jaPay",

            html: `

<div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:40px;">

<div style="max-width:600px;margin:auto;background:white;border-radius:12px;padding:40px;">

<h2 style="margin-top:0;color:#2563eb;">
Welcome to Ticket9jaPay
</h2>

<p>Hello <strong>${fullName}</strong>,</p>

<p>

You have been invited to join

<strong>Ticket9jaPay</strong>

as

<strong>${role.replace(/_/g," ")}</strong>.

</p>

<p>

Click the button below to activate your account.

</p>

<p style="text-align:center;margin:35px 0;">

<a href="${inviteLink}"

style="

background:#2563eb;

color:white;

padding:14px 28px;

text-decoration:none;

border-radius:8px;

display:inline-block;

font-weight:bold;

">

Accept Invitation

</a>

</p>

<p>

If the button doesn't work, copy this link:

</p>

<p>

${inviteLink}

</p>

<hr>

<p style="color:#666;font-size:13px;">

This invitation expires in 24 hours.

</p>

<p style="color:#666;font-size:13px;">

Powered by Ticket9jaPay

</p>

</div>

</div>

            `

        });

        if (response.error) {

            throw new Error(response.error.message);

        }

        return response;

    } catch (error) {

        console.error(error);

        throw error;

    }

};