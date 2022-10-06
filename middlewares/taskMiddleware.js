const checkTaskCreateData = (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name of task not provided' })
  }
  next()
}

module.exports = { checkTaskCreateData }
