const adminService = require("../services/admin.service");

exports.users = async (req, res) => {

    try {

        const result = await adminService.users(req.query);

        res.json({
            success: true,
            ...result
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};