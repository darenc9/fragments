// src/routes/api/post.js
const response = require('../../response');
const { Fragment } = require('../../../src/model/fragment');
const contentType = require('content-type');
const logger = require('../../../src/logger');


module.exports = async (req, res) => {
    try {
        const { type } = contentType.parse(req);
        // Checks if content type is supported
        if (!Fragment.isSupportedType(type)) {
            logger.info("ERR415: Unsupported Media Type. Media type detected: ", type);
            return res.status(415).json(response.createErrorResponse(415, 'Unsupported Media Type'));
        }


        const { type: fragType, parameters: { charset } } = contentType.parse(req.headers['content-type']);
        const typeWithCharset = charset ? `${fragType}; charset=${charset}` : fragType;

        logger.debug({ charset }, 'charset');
        logger.debug({ fragType }, 'fragType');

        // Creates fragment with from request body
        const fragment = new Fragment ({
            ownerId: req.user,
            type:  typeWithCharset,
            size: req.body.length,
        });

        await fragment.save();
        await fragment.setData(req.body);

        // Sets location to full URL to GET the created fragment
        let locationUrl;
        if (process.env.API_URL)
            locationUrl = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
        else 
            locationUrl = `${req.protocol}://${req.headers.host}/v1/fragments/${fragment.id}`;
        
        logger.debug("Location with full URL to the fragment: ", locationUrl);

        // Returns success code with location, status, and fragment
        logger.debug("Fragment created and sent: ", fragment);
        res.status(201)
            .header('Location', locationUrl)
            .header('Content-Length', fragment.length)
            .json({
            "status": "ok",
            "fragment": fragment,
        });

    } catch (err) {
        logger.error('Error creating fragment: ', err);
        res.status(500).json(response.createErrorResponse(500, err))
    }

  };