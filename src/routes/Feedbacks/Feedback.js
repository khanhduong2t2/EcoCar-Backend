const FeedbackRouter = require('express').Router();

const Middleware = require('../../controllers/Middleware')
const FeedbackController = require('../../controllers/feedback/Feedback.controller');

FeedbackRouter.post('/get-list-public', Middleware.verifyToken, FeedbackController.getFeedbackPublic);
FeedbackRouter.post('/create-feedback-public', Middleware.verifyToken, FeedbackController.createFeedbackPublic);

module.exports = FeedbackRouter;