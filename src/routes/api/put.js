// src/routes/api/delete.js
const response = require('../../response');
const logger = require('../../logger');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    logger.debug({ id }, `Inside PUT /fragments/:id, id:`);
    let fragment;
    try{
        fragment = await Fragment.byId(req.user, id);

        } catch(error){
            // If fragment does not exist, throw.
            return res.status(404).json(response.createErrorResponse(404, 'Fragment not found'));
        }
    logger.debug({ fragment }, `fragment obtained by Fragment.byId`);
    

    // Check if the Content-Type of the request matches the existing fragment's type
    const type = contentType.parse(req).type;
    if (!type || type !== fragment.type) {
      return res.status(400).json(response.createErrorResponse(400, 'Content-Type does not match fragment type'));
    }

    await fragment.setData(req.body);
    await fragment.save();

    let locationUrl;
    if (process.env.API_URL)
        locationUrl = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
    else 
        locationUrl = `${req.protocol}://${req.headers.host}/v1/fragments/${fragment.id}`;
    
    res.status(200)
    .header('Location', locationUrl)
    .header('Content-Length', fragment.length)
    .json({
    "status": "ok",
    "fragment": fragment,
    });

  } catch (error) {
    res.status(500).json(response.createErrorResponse(500, 'Unable to put fragments'));
  }

  };