const config = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "semantic-release-vsce",
      {
        packageVsix: true,
        publish: true,
        publishPackagePath: false,
      },
    ],
    "@semantic-release/github",
  ],
};

module.exports = config;
