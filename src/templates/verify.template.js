module.exports = (receipt) => `

<!DOCTYPE html>

<html>

<head>

<title>Receipt Verification</title>

<style>

body{

font-family:Arial;

background:#f4f7fb;

display:flex;

justify-content:center;

padding:60px;

}

.card{

background:white;

padding:40px;

border-radius:12px;

width:500px;

box-shadow:0 10px 30px rgba(0,0,0,.08);

}

.success{

color:#16a34a;

font-size:28px;

font-weight:bold;

margin-bottom:30px;

}

.row{

display:flex;

justify-content:space-between;

margin:15px 0;

}

</style>

</head>

<body>

<div class="card">

<div class="success">

✓ VERIFIED

</div>

<div class="row">

<span>Receipt ID</span>

<strong>${receipt.receiptId}</strong>

</div>

<div class="row">

<span>Reference</span>

<strong>${receipt.reference}</strong>

</div>

<div class="row">

<span>Email</span>

<strong>${receipt.email}</strong>

</div>

<div class="row">

<span>Status</span>

<strong>${receipt.paymentStatus}</strong>

</div>

<div class="row">

<span>Amount</span>

<strong>₦${receipt.amount.toLocaleString()}</strong>

</div>

<div class="row">

<span>Date</span>

<strong>${new Date(receipt.paymentDate).toLocaleString()}</strong>

</div>

</div>

</body>

</html>

`;