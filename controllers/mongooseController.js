const models = require('require.all')('../models');
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = {
    find: async(req, res, next) => {
        try {
            const model = models[req.params.model + "Model"]

            var data = null;
            if (req.params.id) {
                data = await model.findOne({
                    _id: new ObjectId(req.params.id),
                    ...req.query
                });
            } else {
                data = await model.find(req.query).sort({ createdAt: "desc" });
            }
            res.send(data)
        } catch (error) {
            next(error)
        }
    },
    save: async(req, res, next) => {
        try {
            const model = models[req.params.model + "Model"]

            var data = null

            if (Array.isArray(req.body)) {
              data = await model.insertMany(req.body) 
            } else {
              data = await model.create(req.body)   
            }

            res.send(data)
        } catch (error) {
            next(error)
        }
    },
    update: async(req, res, next) => {
        try {
            const model = models[req.params.model + "Model"]

            var data = null

            if (req.params.id) {
                data = await model.findOneAndUpdate({
                    _id: new ObjectId(req.params.id)
                }, req.body, { new: true })
            } else {
                data = await model.update(req.query, req.body, { new: true })
            }

            res.send(data)
        } catch (error) {
            next(error)
        }
    },
    remove: async(req, res, next) => {
        try {
            const model = models[req.params.model + "Model"]

            var data = null

            if (req.params.id) {
                data = await model.findOneAndRemove({
                    _id: new ObjectId(req.params.id)
                })
            } else {
                data = await model.deleteMany(req.body)
            }
            res.send(data)
        } catch (error) {
            next(error)
        }
    }
}