const { generateQRCode } =
require("../utils/qrcode.util");

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
    }).format(amount);
};

const formatDate = (date) => {
    return new Date(date).toLocaleString("en-NG", {
        dateStyle: "long",
        timeStyle: "short"
    });
};

module.exports = async (receipt) => {

    const qrCode =
        await generateQRCode(receipt.receiptId);

    return `
        <!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<title>Ticket9ja Receipt</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:#f5f7fb;
padding:40px;
}

.container{
max-width:750px;
margin:auto;
background:white;
border-radius:12px;
overflow:hidden;
box-shadow:0 10px 30px rgba(0,0,0,.08);
}

.header{
background:#0f172a;
color:white;
padding:35px;
text-align:center;
}

.header h1{
font-size:30px;
margin-bottom:8px;
}

.success{
display:inline-block;
background:#16a34a;
padding:8px 18px;
border-radius:50px;
font-weight:bold;
margin-top:15px;
}

.section{
padding:30px;
}

.row{
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid #eee;
}

.label{
font-weight:bold;
color:#666;
}

.value{
font-weight:600;
}

.footer{
padding:25px;
text-align:center;
font-size:14px;
color:#777;
background:#fafafa;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>Ticket9ja</h1>

<p>Official Payment Receipt</p>

<div class="success">PAYMENT SUCCESSFUL</div>

</div>

<div class="section">

<div class="row">
<span class="label">Receipt ID</span>
<span class="value">${receipt.receiptId}</span>
</div>

<div class="row">
<span class="label">Reference</span>
<span class="value">${receipt.reference}</span>
</div>

<div class="row">
<span class="label">Customer</span>
<span class="value">${receipt.customerName || "N/A"}</span>
</div>

<div class="row">
<span class="label">Email</span>
<span class="value">${receipt.email}</span>
</div>

<div class="row">
<span class="label">Amount</span>
<span class="value">${formatCurrency(receipt.amount)}</span>
</div>

<div class="row">
<span class="label">Currency</span>
<span class="value">${receipt.currency}</span>
</div>

<div class="row">
<span class="label">Status</span>
<span class="value">${receipt.paymentStatus.toUpperCase()}</span>
</div>

<div class="row">
<span class="label">Date</span>
<span class="value">${formatDate(receipt.paymentDate)}</span>
</div>

</div>

<div class="footer">

This receipt was generated automatically by Ticket9ja.

</div>

<div style="text-align:center;margin-top:40px;">

<h3>Verify this Receipt</h3>

<img
src="${qrCode}"
width="170"
/>

<p style="margin-top:10px;">
Scan to verify authenticity
</p>

</div>

</div>


</body>

</html>
    `;

};