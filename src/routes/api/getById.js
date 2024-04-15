// src/routes/api/getById.js
const response = require('../../response');
const logger = require('../../logger')
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
    const { id } = req.params;
    const extension = req.params.ext || '';

    logger.debug({ id }, `Inside GET /fragments/:id, id:`);

  try {
    const fragment = await Fragment.byId(req.user, id);
    const fragmentData = await fragment.getData();

    let fragData = null;
    let contentType = null;

    if (!extension){
      res.setHeader('Content-type', fragment.type);
      res.status(200).send(fragmentData);
    }

    else if (extension) {
      try {
        if (Fragment.isSupportedImageType(fragment.type)) {
          logger.debug("Fragment conversion: supported image type");
          fragData = await fragment.convertImage(extension);
          contentType = 'image/' + extension;
        }
        else if (Fragment.isSupportedTextType(fragment.type)){
          logger.debug("Fragment conversion: supported text type");
          fragData = await fragment.convertText(extension);
          contentType = extension === 'json' ? 'application/json' : 'text/' + extension;
        }
        else {
          res.status(415).json(response.createErrorResponse(415, 'Unsupported file extension/conversion'));
          return;
        }
        res.setHeader('Content-type', contentType);
        res.status(200).send(fragData);
      } catch(error){res.status(415).json(response.createErrorResponse(415, error.message));}
    }

  } catch (error) {
    logger.warn('Error fetching fragment by ID:', error);
    res.status(404).json(response.createErrorResponse(404, error.message));
  }
};