'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

build.addSuppression(/Warning - \[sass\] The local CSS class/gi);

const legacyServeTask = build.rig.getTasks().get('serve-deprecated');

if (legacyServeTask) {
  // DECISION: SPFx 1.20 still registers the dev server as serve-deprecated, but local docs and scripts expect gulp serve.
  build.task('serve', legacyServeTask.executable);
}

build.initialize(gulp);
