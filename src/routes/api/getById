// src/routes/api/getById.js
const response = require('../../response');
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
    const { id } = req.params;
    logger.debug(`Inside GET /fragments/:id, id: $(id)`);
  try {
    const fragment = await Fragment.byId(req.user, id);
    res.setHeader('Content-Type', fragment.type);
    const fragmentData = await fragment.getData();
    logger.debug("Fragment's data: ", fragmentData);

    res.status(200).send(fragmentData);

  } catch (error) {
    logger.warn('Error fetching fragment by ID:', error);
    res.status(404).json(response.createErrorResponse(404, error.message));
  }
};
