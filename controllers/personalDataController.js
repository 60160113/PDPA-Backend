const model = require('../models/personalDataModel')
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
  find: async (req, res, next) => {
    try {
      var data = null;
      if (req.params.id) {
        data = await model.findOne({
          _id: new ObjectId(req.params.id), ...req.query
        }, "data requester consents createdAt");
      } else {
        data = await model.find(req.query, "data requester consents createdAt").sort({ createdAt: "desc" });
      }
      res.send(data)
    } catch (error) {
      next(error)
    }
  },
  save: async (req, res, next) => {
    try {
      const personalData = new model(req.body)
      const data = await personalData.save()
      res.send(data)
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).send('Duplicated request')
      } else {
        next(error) 
      }
    }
  },
  update: async (req, res, next) => {
    try {
      const data = await model.findOneAndUpdate({
        _id: new ObjectId(req.params.id)
      }, req.body, { new: true })
      res.send(data)
    } catch (error) {
      next(error)
    }
  },
  remove: async (req, res, next) => {
    try {
      const data = await model.findOneAndRemove({
        _id: new ObjectId(req.params.id)
      })
      res.send(data)
    } catch (error) {
      next(error)
    }
  }
}
