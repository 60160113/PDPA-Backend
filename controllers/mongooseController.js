const models = require('require.all')('../models');
const ObjectId = require("mongoose").Types.ObjectId;

function get_model(model) {
    let model_name = ""
    for (var i = 0; i < model.length; i++) {
        if (model[i] == "_") {
            model_name += model[++i].toUpperCase()
        }else {
            model_name += model[i]
        }
    } 
    return models[model_name + "Model"]
}

module.exports = {
    find: async(req, res, next) => {
        try {
            const model = get_model(req.params.model)

            if (!model) {
                throw model
            }
            const condition = (({ fields, sort, ...item }) => item)(req.query);

            const fields = req.query.fields || "";
      
            const sort = () => {
              if (req.query.sort) {
                const sortList = req.query.sort.split(",");
                var sortObject = {};
      
                sortList.forEach(item => {
                  const spiltItem = item.split(" ");
                  const key = spiltItem[0];
                  const value = spiltItem[1] || "asc";
                  sortObject[key] = value;
                });
                return sortObject;
              } else {
                return { _id: "desc" };
              }
            };
      
            const data = await model.find(condition, fields).sort(sort());

            res.send(data)
        } catch (error) {
            next(error)
        }
    },
    findOne: async(req, res, next) => {
        try {
            const model = get_model(req.params.model)

            if (!model) {
                throw model
            }

            var data = null;

            const condition = (({ fields, ...item }) => item)(req.query);
      
            const fields = req.query.fields || "";

            if (req.params.id) {
              data = await model.findOne(
                {
                  _id: new ObjectId(req.params.id),
                },
                fields
              );
            } else {
              data = await model.findOne(condition, fields);
            }
            res.send(data);
        } catch (error) {
            next(error)
        }
    },
    save: async(req, res, next) => {
        try {
            const model = get_model(req.params.model)

            if (!model) {
                throw model
            }

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
            const model = get_model(req.params.model)

            if (!model) {
                throw model
            }

            var data = null

            if (req.params.id) {
                data = await model.findOneAndUpdate({
                    _id: new ObjectId(req.params.id)
                }, req.body, { new: true })
            } else {
                data = await model.update(req.body.condition, req.body.data, { new: true })
            }

            res.send(data)
        } catch (error) {
            next(error)
        }
    },
    remove: async(req, res, next) => {
        try {
            const model = get_model(req.params.model)

            if (!model) {
                throw model
            }

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