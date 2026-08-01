const auditLogService = require("../services/auditLog.service");

exports.list = async (req, res) => {
    try {
        const result =
            await auditLogService.getAll(req.query);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Audit log list error:", error);

        res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load audit logs."
        });
    }
};