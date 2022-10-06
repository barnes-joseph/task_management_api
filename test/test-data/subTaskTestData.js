const { randPhrase } = require('@ngneat/falso')

const subtask1 = randPhrase({ length: 1 })[0]
const subtask2 = randPhrase({ length: 1 })[0]

const createSubTasks = () => {
  return { subtasks: [subtask1, subtask2] }
}

function createRandomSubTask () {
  return randPhrase({ length: 1 })[0]
}

module.exports = { createSubTasks, createRandomSubTask }
