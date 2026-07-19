const invitationService =
require("../services/invitation.service");

exports.create = async (req, res) => {

    try {

        const invitation =
            await invitationService.create(

                req.body,

                req.user

            );

        res.status(201).json({

            success: true,

            invitation

        });

    } catch (err) {

        console.error(err);

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.list = async (req, res) => {

    try {

        const invitations =
            await invitationService.list();

        res.json({

            success: true,

            invitations

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};

exports.verify = async (req, res) => {

    try {

        const invitation =
            await invitationService.verify(

                req.params.token

            );

        res.json({

            success: true,

            invitation

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.accept = async (req, res) => {

    try {

        const user =
            await invitationService.accept(

                req.body.token,

                req.body.password

            );

        res.json({

            success: true,

            user

        });

    } catch (err) {

        console.error(err);

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};

exports.cancel = async (req, res) => {

    try {

        await invitationService.cancel(

            req.params.id

        );

        res.json({

            success: true,

            message:
                "Invitation cancelled."

        });

    } catch (err) {

        res.status(400).json({

            success: false,

            message: err.message

        });

    }

};