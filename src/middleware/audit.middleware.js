const audit = require("../services/audit.service");

module.exports = (
    action,
    entity
) => {

    return async (req, res, next) => {

        req.audit = async (
            entityId = null,
            metadata = null
        ) => {

            await audit.log({

                user: req.user,

                action,

                entity,

                entityId,

                metadata,

                ipAddress: req.ip,

                userAgent: req.get("User-Agent")

            });

        };

        next();

    };

};