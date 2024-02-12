// src/routes/api/post.js
const response = require('../../response');
const { Fragment } = require('../../../src/model/fragment');
const contentType = require('content-type');
const logger = require('../../../src/logger');


module.exports = async (req, res) => {
    try {
        const { type } = contentType.parse(req);
        // Checks if content type is supported
        if (type !== 'text/plain') {
            logger.info("ERR415: Unsupported Media Type. Media type detected: ", type);
            return res.status(415).json(response.createErrorResponse(500, 'Unsupported Media Type'));
        }

        // Creates fragment with from request body
        const fragment = new Fragment ({
            ownerId: req.user,
            type: req.headers['content-type'],
            size: req.body.length,
        });

        await fragment.save();
        await fragment.setData(req.body);

        const fragmentData = req.body.toString('utf-8');
        console.log("fragmentData:", fragmentData);
        console.log("req.header: ", req.headers);
        // Sets location to full URL to GET the created fragment
        let locationUrl;
        if (process.env.API_URL) {
            locationUrl = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
        } else {
            const host = req.headers.host;
            const protocol = req.protocol;
            locationUrl = `${protocol}://${host}/v1/fragments/${fragment.id}`;
        }
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