const Video = require('../model/Video');


const getVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        res.json(videos);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = {
    getVideos
};