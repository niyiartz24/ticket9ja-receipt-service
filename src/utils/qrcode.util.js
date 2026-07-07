const QRCode = require("qrcode");

exports.generateQRCode = async (receiptId) => {

    const url =
        `${process.env.BASE_URL}/verify/${receiptId}`;

    return await QRCode.toDataURL(url);

};