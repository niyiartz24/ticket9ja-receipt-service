const prisma = require("../config/prisma");

exports.log = async ({
    userId = null,
    action,
    entity,
    entityId = null,
    metadata = {}
}) => {
    try {
        return await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                metadata
            }
        });
    } catch (error) {
        console.error("Audit log failed:", error.message);
        return null;
    }
};

exports.fromRequest = async ({
    req,
    action,
    entity,
    entityId = null,
    metadata = {}
}) => {
    return exports.log({
        userId: req.user?.id || null,
        action,
        entity,
        entityId,
        metadata: {
            ...metadata,
            ip: req.ip,
            userAgent: req.get("user-agent") || null
        }
    });
};

exports.getAll = async (query) => {
    const page = Math.max(Number(query.page) || 1, 1);

    const pageSize = Math.min(
        Math.max(Number(query.pageSize) || 10, 1),
        100
    );

    const skip = (page - 1) * pageSize;

    const where = {};

    if (query.action) {
        where.action = query.action;
    }

    if (query.entity) {
        where.entity = query.entity;
    }

    if (query.search) {
    const search = query.search.trim();

    const matchingUsers = await prisma.user.findMany({
        where: {
            OR: [
                {
                    fullName: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        },
        select: {
            id: true
        }
    });

    const matchingUserIds = matchingUsers.map(user => user.id);

    where.OR = [
        {
            action: {
                contains: search,
                mode: "insensitive"
            }
        },
        {
            entity: {
                contains: search,
                mode: "insensitive"
            }
        },
        {
            entityId: {
                contains: search,
                mode: "insensitive"
            }
        }
    ];

    if (matchingUserIds.length) {
        where.OR.push({
            userId: {
                in: matchingUserIds
            }
        });
    }
}

    const sortDir =
        String(query.sortDir).toLowerCase() === "asc"
            ? "asc"
            : "desc";

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: sortDir
            }
        }),

        prisma.auditLog.count({
            where
        })
    ]);

    const userIds = [
        ...new Set(
            logs
                .map(log => log.userId)
                .filter(Boolean)
        )
    ];

    const users = userIds.length
        ? await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                fullName: true,
                email: true,
                role: true
            }
        })
        : [];

    const userMap = new Map(
        users.map(user => [user.id, user])
    );

    const data = logs.map(log => {
        const user = log.userId
            ? userMap.get(log.userId)
            : null;

        const metadata =
            log.metadata &&
            typeof log.metadata === "object"
                ? log.metadata
                : {};

        return {
            id: log.id,

            actorName:
                user?.fullName ||
                user?.email ||
                "System",

            actorRole:
                user?.role ||
                "SYSTEM",

            action: log.action,

            entity: log.entity,

            entityId: log.entityId,

            target:
                metadata.target ||
                metadata.targetName ||
                log.entityId ||
                log.entity ||
                "—",

            ip:
                metadata.ip ||
                metadata.ipAddress ||
                "—",

            metadata,

            createdAt: log.createdAt
        };
    });

    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
};