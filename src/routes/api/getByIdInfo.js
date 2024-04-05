// src/routes/api/getByIdInfo.js
const response = require('../../response');
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
    const { id } = req.params;
    logger.debug(`Inside GET /fragments/:id/info, id: ${id}`);
    try {
        const fragment = await Fragment.byId(req.user, id);
        const metadata = {
            status: 'ok',
            fragment: {
                id: fragment.id,
                ownerId: fragment.ownerId,
                created: fragment.created,
                updated: fragment.updated,
                type: fragment.type,
                size: fragment.size,
            }
        };
        res.status(200).json(metadata);

    } catch (error) {
        logger.warn('Error fetching fragment by ID:', error);
        res.status(404).json(response.createErrorResponse(404, error.message));
    }
};
