// Jan 1st 1970 00:00:00 am
const moment = require('moment');

let date = moment();

new Date().getTime();
let someTimeStamp = moment().valueOf();
console.log(someTimeStamp);
date.add(1, 'year').subtract(9, 'months');
console.log(date.format('h:m a MMM Do YYYY'));