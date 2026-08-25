# BojuVue 보주뷰 [![starline](https://raw.githubusercontent.com/ScottKirvan/BojuVue/refs/heads/starlines/ScottKirvan/BojuVue/starline.svg)](https://github.com/qoomon/starlines)
<div align="center">

  <img src="assets/media/logo.jpg" alt="logo" width="200" height="auto" />
    <h1><a href="https://github.com/ScottKirvan/BojuVue">ScottKirvan/BojuVue</a></h1>
  <h3>A shared Vue 3 component library for ScottKirvan's VitePress sites</h3>
  
  
<!-- Badges -->
<p>
  <a href="https://github.com/ScottKirvan/BojuVue/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/ScottKirvan/BojuVue" alt="contributors" />
  </a>
  <a href="">
    <img src="https://img.shields.io/github/last-commit/ScottKirvan/BojuVue" alt="last update" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/network/members">
    <img src="https://img.shields.io/github/forks/ScottKirvan/BojuVue" alt="forks" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/stargazers">
    <img src="https://img.shields.io/github/stars/ScottKirvan/BojuVue" alt="stars" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/issues/">
    <img src="https://img.shields.io/github/issues/ScottKirvan/BojuVue" alt="open issues" />
  </a>
  <a href="https://github.com/ScottKirvan/BojuVue/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/ScottKirvan/BojuVue.svg" alt="license" />
  </a>
  <a href="https://discord.gg/TN6XJSNK5Y">
    <!--<img src="https://img.shields.io/discord/704680098577514527?style=flat-square&label=%F0%9F%92%AC%20discord&color=00ACD7">-->
    <img src="https://img.shields.io/discord/1052011377415438346?style=flat-square&label=discord&color=00ACD7">
  </a>
</p>
   
<h4>
    <a href="https://tinyurl.com/3vf7whyd">View Demo</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/blob/main/README.md">Documentation</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/issues/new?template=bug_report.md">Report Bug</a>
  <span> · </span>
    <a href="https://github.com/ScottKirvan/BojuVue/issues/new?template=feature_request.md">Request Feature</a>
  </h4>
</div>

**BojuVue** is a Vue 3 component library published to npm as [`@scottkirvan/bojuvue`](https://www.npmjs.com/package/@scottkirvan/bojuvue). It exists so that VitePress sites — this author's homepage blog and several local documentation sites — can share one set of landing-page and UX components instead of duplicating them per repo. Update this repo, bump the version, publish, and every consuming site can pull in the update with `npm update`.

## Getting Started with This Template

>[!IMPORTANT]
> **Customization Checklist** - After creating a repository from this template, customize these items:
>
> - [x] Update the project description (line 5 above and in repository settings)
> - [ ] Replace `assets/media/logo.jpg` with your project logo
> - [ ] Update or remove the "View Demo" link (line 35)
> - [ ] Update or remove the Discord badge/link (lines 28-31)
> - [ ] Choose and apply a `.gitignore` from `.github/gitignore-templates/` (see [gitignore templates](.github/gitignore-templates/))
> - [ ] Update the version in `.release-please-manifest.json` to your starting version (e.g., "0.1.0")
> - [x] Fill in the Features, Installation, and Usage sections below
> - [ ] Review and update the [Code of Conduct](CODE_OF_CONDUCT.md) contact information
> - [ ] Enable GitHub Pages in repository settings if you want a project website
> - [ ] Review and customize `CLAUDE.md` if using AI coding agents, or delete it if not
> - [ ] Remove or update this checklist section

Branches
--------
`main` is the [deployed](https://ScottKirvan.github.io/BojuVue/) branch.  The repo doesn't currently contain any other historic or dev branches.

Repo Layout
-----------
```
BojuVue
├───_layouts                     # Jekyll layouts for GitHub Pages
├───.github
│   ├───gitignore-templates      # Example .gitignore files (Unreal, Unity, Python, etc.)
│   ├───ISSUE_TEMPLATE           # Bug report and feature request templates
│   ├───release-please           # Release-Please configuration
│   ├───workflows                # GitHub Actions (release, template-init)
│   ├───FUNDING.yml              # Sponsorship configuration
│   └───PULL_REQUEST_TEMPLATE.md # PR template
├───assets
│   ├───css                      # Styling for GitHub Pages
│   └───media                    # Images and logos
├───notes                        # CHANGELOG, VERSION, TODO
├───CLAUDE.md                    # AI agent context (optional — see Key Features)
├───CODE_OF_CONDUCT.md           # Community guidelines
├───CONTRIBUTING.md              # Contribution guidelines
├───LICENSE.md                   # MIT License
└───README.md                    # This file
```

### Key Features

**GitHub Pages Support**: The `_layouts` and `assets/css` folders enable GitHub Pages rendering with a custom dark theme similar to GitHub's [Dark High Contrast](https://github.blog/changelog/2021-08-25-dark-high-contrast-theme-ga/) theme. Enable Pages in your repo settings - see [GitHub's Jekyll documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll).

**Automated Release Management**: The `.github/workflows` folder includes [Release-Please](https://github.com/googleapis/release-please) for automated versioning and CHANGELOG updates based on conventional commits.

**Template Initialization**: The `template-init.yml` workflow automatically updates repository references when you create a new repo from this template, then deletes itself.

**.gitignore Templates**: The `.github/gitignore-templates/` folder contains ready-to-use `.gitignore` files for Unreal Engine, Unity, Python, Node.js, C++, and general development. See the [templates README](.github/gitignore-templates/) for usage.

**AI Agent Context (optional)**: `CLAUDE.md` gives AI coding agents (e.g. [Claude Code](https://claude.ai/code)) a starting set of engineering standards — branching conventions, commit discipline, test-driven development, and a no-shortcuts ethos. The project name is automatically substituted on initialization. Customize it as your project evolves, or delete it if you're not using AI agents.

>[!NOTE]
> When using this template project, do not clone the tags or branches. Stick with `main` as the name of your main release branch. Change the version number in the `.release-please-manifest.json` file to the version you want to start with.
>
> Release-Please uses  [Conventional Commits](https://www.conventionalcommits.org/) with [Semantic Versioning](https://semver.org/) (version: MAJOR.MINOR.PATCH). Changes to version numbers are triggered by specific keywords in your commit messages:
> - `feat:` (new feature) will bump the MINOR version number.
> - `fix:` (bug fixes) will bump the PATCH number.
> - `feat!:` `fix!:` or any `xxx!:` (major and breaking changes) will bump the MAJOR version number.

>[!TIP]
> **Automatic Template Initialization**: When you create a new repository from this template, a GitHub Actions workflow automatically runs on your first push to update all repository references, URLs, and badges in the README with your new repository information. The workflow then deletes itself to keep your repo clean. No manual setup required!



Table of Contents
-----------------
- [Branches](#branches)
- [Repo Layout](#repo-layout)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributions / Contact](#contributions--contact)
- [Credits](#credits)

Features
--------
- Vue 3 + TypeScript components, built as an ES module via Vite library mode
- `vue` is a peer dependency, so consuming sites use their own Vue instance — no duplicate copies, no broken reactivity
- Every component is exported from one entry point (`src/index.ts`), so consuming a new component is a one-line import change
- The `docs/` VitePress site imports directly from `src/index.ts` and registers every exported component globally, so new components can be previewed live in a real VitePress site without publishing or `npm link`

Installation
------------
```
npm install @scottkirvan/bojuvue
```

Usage
-----
Import and register components in a consuming VitePress site's `.vitepress/theme/index.ts`:

```ts
import DefaultTheme from 'vitepress/theme'
import { SomeComponent } from '@scottkirvan/bojuvue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('SomeComponent', SomeComponent)
  },
}
```

Then use it in any `.md` page. Update later with `npm update`.

See the **[component reference](https://scottkirvan.github.io/BojuVue/components/)**
for every available component's props and a usage example.

### Adding a new component

1. Write the `.vue` file under `src/`
2. Add one line to `src/index.ts`: `export { default as YourComponent } from './YourComponent.vue'`
3. Run `npm run docs:dev` (from `docs/`) to preview it live in the VitePress site
4. Add a reference page at `docs/components/your-component.md` (props table + usage
   example — copy the structure of an existing page) and link it from
   `docs/components/index.md` and the sidebar in `docs/.vitepress/config.mts`
5. Bump the version and `npm publish` to ship it to every consuming site

Contributions / Contact
-----------------------
- Please [file an issue](https://github.com/ScottKirvan/BojuVue/issues/new), or [grab a fork](https://github.com/ScottKirvan/BojuVue/fork), hack away, and submit a [pull request](https://github.com/ScottKirvan/BojuVue/pulls).
- Contact me at [linkedin.com/in/scottkirvan/](https://www.linkedin.com/in/scottkirvan/)
- You can also contact me at my [discord](https://discord.gg/TN6XJSNK5Y) server, I'm cptvideo.

Credits
-------
**[ScooterGitTemplate](https://github.com/ScottKirvan/ScooterGitTemplate) Copyright (c) (2025):** [Scott Kirvan](https://github.com/ScottKirvan)  - All rights reserved
*ScooterGitTemplate is licensed under the [MIT License](LICENSE.md).*



x

Project Link:  [BojuVue](https://github.com/ScottKirvan/BojuVue)  
[CHANGELOG](notes/CHANGELOG.md)  
[TODO](notes/TODO.md)
