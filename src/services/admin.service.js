const prisma = require("../config/prisma");

exports.users = async (query) => {

    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 10);

    const skip = (page - 1) * pageSize;

    const sortDir =
        query.sortDir === "desc"
            ? "desc"
            : "asc";

    const where = {};

    if (query.search) {

        where.OR = [

            {
                fullName: {
                    contains: query.search,
                    mode: "insensitive"
                }
            },

            {
                email: {
                    contains: query.search,
                    mode: "insensitive"
                }
            }

        ];

    }

    const [users, total] =
        await Promise.all([

            prisma.user.findMany({

                where,

                skip,

                take: pageSize,

                include: {

                    organization: true,

                    college: true,

                    department: true

                },

                orderBy: {

                    fullName: sortDir

                }

            }),

            prisma.user.count({

                where

            })

        ]);

    return {

        users,

        pagination: {

            page,

            pageSize,

            total,

            totalPages:
                Math.ceil(total / pageSize)

        }

    };

};