'use strict';

const build = require('@microsoft/sp-build-web');

build.addSuppression(/Warning - \[sass\] The local CSS class/gi);
const getTasks = build.initializeProjectTasks;
build.initialize(require('gulp'));
