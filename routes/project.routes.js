const router = require("express").Router();
const projects = require("../entity/project.entity");

/* GET projects listing. with search option and pagination*/
router.post("/search-project", async (req, res) => {
  const resp = await projects.getProjects(req.body);
  res.status(200).send(resp);
});

// post notes on projects
router.post("/add-notes", async (req, res) => {
  const resp = await projects.addNotes(req.body);
  res.status(200).send(resp);
});

module.exports = router;
