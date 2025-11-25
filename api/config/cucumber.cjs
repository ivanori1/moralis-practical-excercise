const baseConfig = {
  tags: process.env.npm_config_TAGS || "",
  formatOptions: {
    snippetInterface: "async-await"
  },
  paths: [
    "api/features/"
  ],
  dryRun: false,
  require: [
    "api/steps/*.ts",
    "../../core/steps/*.ts",
    "api/config/hooks.ts"
  ],
  requireModule: [
    "ts-node/register"
  ],
  format: [
    "progress-bar",
    "html:test-results/cucumber-report.html",
    "json:test-results/cucumber-report.json",
    "junit:test-results/cucumber-report.xml",
    "rerun:@rerun.txt"
  ],
  parallel: 1
}

module.exports = {
  default: baseConfig,
  rerun: {
    ...baseConfig,
    dryRun: false
  }
}


