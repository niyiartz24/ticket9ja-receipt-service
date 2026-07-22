const prisma = require("../config/prisma");
const crypto = require("crypto");
const { hashPassword } = require("../auth/password");
const notificationService = require("./notification.service");
const emailService = require("./email.service");



exports.create = async (data, invitedBy) => {

    if (!data.fullName)
    throw new Error("Full name is required.");

if (!data.email)
    throw new Error("Email is required.");

if (!data.role)
    throw new Error("Role is required.");

    const existingUser =
        await prisma.user.findUnique({
            where: {
                email: data.email.toLowerCase()
            }
        });

    if (existingUser) {
        throw new Error("User already exists.");
    }

    const existingInvitation =
        await prisma.invitation.findFirst({

            where: {

                email: data.email.toLowerCase(),

                accepted: false,

                expiresAt: {
                    gt: new Date()
                }

            }

        });

    if (existingInvitation) {
        throw new Error(
            "An active invitation already exists."
        );
    }

    /*
|--------------------------------------------------------------------------
| Role Restrictions
|--------------------------------------------------------------------------
*/

switch (invitedBy.role) {

    case "SUPER_ADMIN":

    if (![
        "ORGANIZATION_ADMIN",
        "COLLEGE_ADMIN",
        "DEPARTMENT_ADMIN",
        "FINANCE_OFFICER",
        "VIEWER"
    ].includes(data.role)) {

        throw new Error("Invalid role.");

    }

    break;

    case "ORGANIZATION_ADMIN":

        if (
            ![
                "COLLEGE_ADMIN",
                "DEPARTMENT_ADMIN",
                "FINANCE_OFFICER",
                "VIEWER"
            ].includes(data.role)
        ) {

            throw new Error(
                "You are not allowed to invite this role."
            );

        }

        data.organizationId =
            invitedBy.organizationId;

        break;

    case "COLLEGE_ADMIN":

        if (
            ![
                "DEPARTMENT_ADMIN",
                "FINANCE_OFFICER",
                "VIEWER"
            ].includes(data.role)
        ) {

            throw new Error(
                "You are not allowed to invite this role."
            );

        }

        data.organizationId =
            invitedBy.organizationId;

        data.collegeId =
            invitedBy.collegeId;

        break;

    default:

        throw new Error(
            "You are not authorized to invite users."
        );

}



const rawToken =
    crypto.randomBytes(32).toString("hex");

const token =
    crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    const expires =
        new Date(
            Date.now() +
            1000 * 60 * 60 * 24
        );

    const invitation =
        await prisma.invitation.create({

            data: {

                fullName:
                    data.fullName,

                email:
                    data.email.toLowerCase(),

                role:
                    data.role,

                organizationId:
                    data.organizationId || null,

                collegeId:
                    data.collegeId || null,

                departmentId:
                    data.departmentId || null,

                token,

                expiresAt:
                    expires

            }

        });

    const inviteLink =
`${process.env.FRONTEND_URL}/accept-invitation.html?token=${rawToken}`;

    await emailService.sendInvitation({

        email: data.email,

        fullName: data.fullName,

        role: data.role,

        inviteLink

    });

    await notificationService.create({

        type: "INFO",

        title: "Invitation Sent",

        message:
            `${data.fullName} has been invited as ${data.role}.`

    });

    return invitation;

};

exports.verify = async (token) => {

    const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const invitation =
        await prisma.invitation.findUnique({

            where: {
                token: hashedToken
            }

        });

    if (!invitation) {

        throw new Error("Invalid invitation.");

    }

    if (invitation.accepted) {

        throw new Error("Invitation already used.");

    }

    if (
        invitation.expiresAt < new Date()
    ) {

        throw new Error("Invitation expired.");

    }

    return invitation;

};

exports.accept = async (

    token,

    password

) => {

    const invitation =
        await exports.verify(token);

    const hashed =
        await hashPassword(password);

    const user =
        await prisma.user.create({

            data: {

                fullName:
                    invitation.fullName,

                email:
                    invitation.email,

                password:
                    hashed,

                role:
                    invitation.role,

                organizationId:
                    invitation.organizationId,

                collegeId:
                    invitation.collegeId,

                departmentId:
                    invitation.departmentId

            }

        });

        await notificationService.create({

    type: "SUCCESS",

    title: "New User Joined",

    message: `${user.fullName} accepted the invitation.`,

    organizationId: user.organizationId,

    collegeId: user.collegeId,

    departmentId: user.departmentId

});

    await prisma.invitation.update({

        where: {

            id: invitation.id

        },

        data: {

            accepted: true

        }

    });

    await notificationService.create({

        type: "SUCCESS",

        title: "Invitation Accepted",

        message:
`${user.fullName} joined the platform.`

    });

    return user;

};

exports.list = async () => {

    return prisma.invitation.findMany({

        orderBy: {

            createdAt: "desc"

        }

    });

};

exports.cancel = async (id) => {

    return prisma.invitation.delete({

        where: {

            id

        }

    });

};