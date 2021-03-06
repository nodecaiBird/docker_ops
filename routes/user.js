const router = require('koa-router')();
const model = require("../model/index")
const _ = require('lodash');
const snowflake = require("../common/snowflake");
const error = require("../common/error");
router.post("/users", async ctx => {
  let params = ctx.request.body;
  if (!params.username) { ctx.throw(error.ValidateCode, error.UsernameNotNull) };
  if (!params.password) { ctx.throw(error.ValidateCode, error.PasswdNotNull) };
  let user = await model.findOne("User", { username: params.username });
  if (!_.isEmpty(user)) { ctx.throw(error.ValidateCode, error.UsernameExist) };
  params.create_time = new Date();
  params.id = snowflake.nextId();
  await model.insert("User", params);
  ctx.body = {
    errmsg: error.CreateSuccess
  }
})
router.delete("/users/:user_id", async ctx => {
  let user_id = ctx.params.user_id;
  let user = await model.findById("User", user_id);
  if (_.isEmpty(user)) { ctx.throw(error.ValidateCode, error.IdNotExist) };
  await model.delete("User", { id: user_id });
  ctx.body = {
    errmsg: error.DeleteSuccess
  }
});
router.put("/users/:user_id", async ctx => {
  let user_id = ctx.params.user_id;
  let params = ctx.request.body;
  let updateParams = _.omit(params,["id"]);
  params.update_time = new Date();
  let user = await model.findById("User", user_id);
  if(_.isEmpty(user)) { ctx.throw(error.ValidateCode, error.IdNotExist) };
  let existUser = await model.findOne("User", {username:params.username});
  if(!_.isEmpty(existUser)&&existUser.id!=user_id){ ctx.throw(error.ValidateCode,error.UsernameExist)};
  await model.update("User", updateParams, { id: user_id });
  ctx.body = {
    errmsg: error.UpdateSuccess
  }
});
router.get("/users", async ctx => {
  let params = ctx.query;
  let options = {};
  options.offset = Number(params.start)|| 0;
  options.limit = Number(params.length)|| 10;
  let where =_.omit(params,["start","length"]);
  if(!_.isEmpty(where)){
    options.where = where;
  }
  let result = await model.findAndCount("User", options);
  let data = result.rows;
  let total = result.count;
  ctx.set("X-Total", total);
  ctx.body = {
    results: data
  }
})
module.exports = exports = router;
