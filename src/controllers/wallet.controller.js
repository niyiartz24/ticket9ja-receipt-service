const organizationWallet = require("../services/organizationWallet.service");
const collegeWallet = require("../services/collegeWallet.service");
const departmentWallet = require("../services/departmentWallet.service");

exports.getWallet = async (req, res) => {

    try {

        let wallet;

        switch (req.user.role) {

            case "ORGANIZATION_ADMIN":

                wallet = await organizationWallet.details(
                    req.user.organizationId
                );

                break;

            case "COLLEGE_ADMIN":

                wallet = await collegeWallet.details(
                    req.user.collegeId
                );

                break;

            case "DEPARTMENT_ADMIN":

                wallet = await departmentWallet.details(
                    req.user.departmentId
                );

                break;

            default:

                throw new Error("Unsupported role.");

        }

        res.json({

            success: true,

            balance: Number(wallet.availableBalance),

            pending: Number(wallet.pendingBalance),

            reserved: Number(wallet.reservedBalance),

            withdrawn: Number(wallet.withdrawnBalance),

            totalRevenue: Number(wallet.totalRevenue),

            lastPayoutAt: wallet.updatedAt

        });

    }

    catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};