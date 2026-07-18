const prisma = require("../config/prisma");

exports.log = async ({
    user,
    action,
    entity,
    entityId = null,
    metadata = null,
    ipAddress = null,
    userAgent = null
}) => {

    return prisma.auditLog.create({

        data: {

            userId: user?.id || null,

            userEmail: user?.email || null,

            role: user?.role || null,

            organizationId:
                user?.organizationId || null,

            collegeId:
                user?.collegeId || null,

            departmentId:
                user?.departmentId || null,

            action,

            entity,

            entityId,

            metadata,

            ipAddress,

            userAgent

        }

    });

};