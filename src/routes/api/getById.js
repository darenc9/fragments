// src/routes/api/getById.js
const response = require('../../response');
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment');

const markdown = require('markdown-it');
let md = markdown();

module.exports = async (req, res) => {
    const { id } = req.params;
    const extension = req.params.ext || '';

    logger.debug({ id }, `Inside GET /fragments/:id, id:`);

  try {
    const fragment = await Fragment.byId(req.user, id);
    const fragmentData = await fragment.getData();

    logger.debug("Fragment's data: ", fragmentData);
    switch(extension) {
      case '':
        res.setHeader('Content-Type', fragment.type);
        res.status(200).send(fragmentData);
        break;

      case 'html':
        // Checks if converting md -> html
        if (fragment.type === 'text/markdown') {
          let convertedData = md.render(fragmentData.toString());
          res.setHeader('Content-Type','text/html');
          res.status(200).send(convertedData); 
        } else {
          // If file type is unsupported
          res.status(415).json(response.createErrorResponse(415, 'Unsupported file extension/conversion'));
        }
        break;

      // Add more cases for conversions later:
      default:
        res.status(415).json(response.createErrorResponse(415,'Unsupported file extension.'));
        break;
    }

  } catch (error) {
    logger.warn('Error fetching fragment by ID:', error);
    res.status(404).json(response.createErrorResponse(404, error.message));
  }
};
