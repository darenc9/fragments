// src/routes/api/delete.js
const response = require('../../response');
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug({ id }, `Inside DELETE /fragments/:id, id:`);
    const { user } = req;
   
    // Checks if fragment exists
    let fragment;

    try {
      fragment = await Fragment.byId(user, id);
    } catch (error) {
      logger.error(error);
    }

    if (!fragment) {
      return res.status(404).json(response.createErrorResponse(404, 'Fragment not found'));
    }

    // Delete the fragment
    await Fragment.delete(user, id);

    // Respond with success message
    res.status(200).json(response.createSuccessResponse({ status: 'ok' }));

  } catch (error) {
    res.status(500).json(response.createErrorResponse(500, 'Unable to delete fragments'));
  }

  };