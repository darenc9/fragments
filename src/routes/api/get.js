// src/routes/api/get.js
const response = require('../../response');
const logger = require('../..//logger')
const { Fragment } = require('../../model/fragment');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    let fragments;
    const expand = req.query.expand === '1';
    logger.info("Inside src/routes/api/get.js for user: ", req.user, " expand=", expand);

    if (expand) {
      fragments = await Fragment.byUser(req.user, expand);
    } else {
      fragments = await Fragment.byUser(req.user);
    }

    res.status(200).json(response.createSuccessResponse({ fragments }));

  } catch (error) {
    res.status(500).json(response.createErrorResponse(500, 'Unable to fetch fragments'));
  }

  };