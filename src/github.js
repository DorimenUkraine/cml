const github = require('@actions/github');

const {
  GITHUB_REPOSITORY = '',
  GITHUB_HEAD_REF,
  GITHUB_REF,
  GITHUB_SHA,
  GITHUB_EVENT_NAME,
  GITHUB_TOKEN,
  repo_token
} = process.env;

const [owner, repo] = GITHUB_REPOSITORY.split('/');
const org = owner;
const IS_PR = GITHUB_EVENT_NAME === 'pull_request';
const REF = IS_PR ? GITHUB_HEAD_REF : GITHUB_REF;
const HEAD_SHA = GITHUB_SHA;
const USER_EMAIL = 'action@github.com';
const USER_NAME = 'GitHub Action';

const TOKEN = repo_token || GITHUB_TOKEN;
const REPO = `https://github.com/${GITHUB_REPOSITORY}`;

const octokit = github.getOctokit(TOKEN);

const CHECK_TITLE = 'CML Report';

const create_check_report = async (opts) => {
  const {
    head_sha,
    report,
    title = CHECK_TITLE,
    started_at = new Date(),
    completed_at = new Date(),
    conclusion = 'success',
    status = 'completed'
  } = opts;

  const name = title;
  const check = await octokit.checks.create({
    owner,
    repo,
    head_sha,
    name,
    started_at,
    completed_at,
    conclusion,
    status,
    output: { title, summary: report }
  });

  return check;
};

const comment = async (opts) => {
  const { commit_sha, report } = opts;

  await octokit.repos.createCommitComment({
    owner,
    repo,
    commit_sha,
    body: report
  });
};

const get_runner_token = async () => {
  if (typeof repo !== 'undefined') {
    const {
      data: { token }
    } = await octokit.actions.createRegistrationTokenForRepo({
      owner,
      repo
    });

    return token;
  }

  const {
    data: { token }
  } = await octokit.actions.createRegistrationTokenForOrg({
    org
  });

  return token;
};

const register_runner = async (opts) => {
  throw new Error('not yet implemented');
};

const handle_error = (e) => {
  console.error(e.message);
  process.exit(1);
};

exports.is_pr = IS_PR;
exports.ref = REF;
exports.head_sha =
  GITHUB_EVENT_NAME === 'pull_request'
    ? github.context.payload.pull_request.head.sha
    : HEAD_SHA;
exports.user_email = USER_EMAIL;
exports.user_name = USER_NAME;
exports.comment = comment;
exports.get_runner_token = get_runner_token;
exports.register_runner = register_runner;
exports.handle_error = handle_error;
exports.token = TOKEN;
exports.repo = REPO;

exports.CHECK_TITLE = CHECK_TITLE;
exports.create_check_report = create_check_report;
