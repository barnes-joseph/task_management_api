const {randNumber, randPhrase, randSoonDate, randFutureDate,randSentence, randFood} = require('@ngneat/falso');

const taskName = `Task ${randNumber({max:10})}`;
const description = randPhrase({length:1})[0];


const createSimpleTask = () => {
    return {name:taskName,description};
}

const createRandomTask = () => {
  return  {name:`Task ${randNumber({max:10})}`,description:randPhrase({length:1})[0]}
}

const task = {
    name:`Task ${randNumber({max:10})}`,
    startDate: new Date(randSoonDate()),
    endDate:new Date(randFutureDate({years:0.5})),
    priority: randNumber({min:1,max:3}),
    description: randSentence({length:1})[0]
}
const createTaskData = (categories) => {
    const subTasks  = []
    for (let i=0;i<5;i++){
        subTasks.push(randPhrase({length:1})[0]);
    }

    return {...task,categories,subTasks}
}   

module.exports = {createSimpleTask,createTaskData,createRandomTask};