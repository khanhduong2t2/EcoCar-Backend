const { error_missing } = require('../../configs/response');
const ListNewsModel = require('../../models/content/list_news.model');
const ListCertifiedModel = require('../../models/content/list_certified.model');

module.exports = {
    createCertified: async (req, res, next) => {
        try {
            let { title, content, image } = req.body;

            if (!title || !content || !image) {
                return res.status(400).json(error_missing("title && content && image"))
            };

            let newCertified = new ListCertifiedModel({
                title, content, image
            });
            await newCertified.save();

            return res.status(200).json({
                status: true,
                data: newCertified
            })
        } catch (err) {
            next(err);
        }
    },

    getListCertified: async (req, res, next) => {
        try {
            let listCertified = await ListCertifiedModel.find();

            return res.status(200).json({
                status: true,
                data: listCertified
            })
        } catch (err) {
            next(err);
        }
    },

    createNews: async (req, res, next) => {
        try {
            let { title, description, list_contents, list_images, list_videos, status } = req.body;

            if (!title || !description || !list_contents || !status) {
                return res.status(400).json(error_missing("title && description && list_contents && status"))
            };

            let newNews = new ListNewsModel({
                title, description, list_contents, list_images, list_videos, status
            });
            await newNews.save();

            return res.status(200).json({
                status: true,
                data: newNews
            })

        } catch (err) {
            next(err);
        }
    },

    getListNews: async (req, res, next) => {
        try {
            let listNews = await ListNewsModel.find();

            return res.status(200).json({
                status: true,
                data: listNews
            })
        } catch (err) {
            next(err);
        }
    },

    getDetailNews: async (req, res, next) => {
        try {
            let { id } = req.params;

            if (!id) {
                return res.status(400).json(error_missing("id"))
            };

            let news = await ListNewsModel.findOne({ _id: id });

            return res.status(200).json({
                status: true,
                data: news
            })
        } catch (err) {
            next(err);
        }
    },
}