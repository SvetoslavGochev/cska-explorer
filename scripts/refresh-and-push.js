const { execSync } = require("child_process");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function hasStagedChanges() {
  try {
    execSync("git diff --cached --quiet", { stdio: "ignore" });
    return false;
  } catch (_) {
    return true;
  }
}

(function main() {
  // 1) Refresh data and append operational log row.
  run("npm run ops:refresh");

  // 2) Sanity-check public live payload endpoint.
  run("npm run ops:verify:live");

  // 3) Stage known refresh artifacts.
  run("git add data/bootstrap-data.json data/refresh-log.ndjson");

  if (!hasStagedChanges()) {
    console.log("No staged refresh changes detected. Nothing to commit.");
    return;
  }

  // 4) Commit and push.
  run("git commit -m \"chore: automated player stats refresh\"");
  run("git push origin main");
})();
