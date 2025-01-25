const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.get(
    "/api/users",
    // [authJwt.verifyToken, authJwt.isAdmin],
     // Ensure only admins can access this route
    controller.findAllUsers
  );

  app.post(
    "/api/user/change-role",
    // [authJwt.verifyToken, authJwt.isAdmin], // Make sure only admins can change roles
    controller.changeUserRoleById
  );

};
