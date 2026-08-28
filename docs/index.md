---
layout: home

hero:
  name: "BojuVue"
  text: "Shared Vue 3 components"
  tagline: A component library published to npm, for any Vue 3 app — with VitePress-aware builds available where they help. Install it, register the components you need, and update later with npm update.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: Components
      link: /components/
    - theme: alt
      text: View on GitHub
      link: https://github.com/ScottKirvan/BojuVue

features:
  - icon: 🔀
    title: Two builds, one import surface
    details: Every component is exported from @scottkirvan/bojuvue. Components with VitePress-specific needs ship a second, fully independent implementation under the same name at @scottkirvan/bojuvue/vitepress — the import path is what disambiguates them.

  - icon: 📦
    title: vitepress is optional
    details: Installing the package alone never pulls in vitepress. Only importing from the /vitepress subpath does — the generic build has zero vitepress in its module graph.

  - icon: 🔗
    title: vue is a peer dependency
    details: A consuming site uses its own Vue instance — no duplicate copy of Vue in the bundle, no broken reactivity across component boundaries.
---

<!-- Begin Sponsors -->

<div align="center" style="margin-top: 3rem; margin-bottom: 2rem;">
<h2>Sponsors</h2>
 <a href="https://www.sabelhawk.com/" target="_blank">
    <img src="/sabelhawk_dark.png" alt="Sabelhawk Studios" width="300" class="sponsor-logo dark-only" />
    <img src="/sabelhawk_lite.png" alt="Sabelhawk Studios" width="300" class="sponsor-logo light-only" />
  </a>
  <br><br>
  <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">
    If you're enjoying this project, or it's saved you some time, consider<br>buying me a coffee or becoming a sponsor — it helps keep the<br> projects going.
  </p><br>
  <div style="display: flex; gap: 12px; justify-content: center; align-items: center; flex-wrap: wrap;">
  <a href="https://ko-fi.com/ScottKirvan" target="_blank">
    <img src="https://storage.ko-fi.com/cdn/kofi2.png?v=3" alt="Support on Ko-fi"  width="160"  />
  </a> &nbsp; &nbsp;
  <a href="https://github.com/sponsors/ScottKirvan" target="_blank">
    <img src="https://img.shields.io/badge/Sponsor-GitHub-ea4aaa?style=for-the-badge&logo=github" height="36" />
  </a>
  </div>
  <br>
Thank you! Supporting indie devs makes a real difference.
</div>

<!-- End Sponsors -->
