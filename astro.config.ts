import { defineConfig, envField, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
import {
  transformerNotationDiff,
  transformerMetaHighlight,
  transformerMetaWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import { SITE } from "./src/config";
import { readFileSync } from "fs";
import type { Root } from "node_modules/remark-toc/lib";

const factorGrammar = JSON.parse(
  readFileSync("./_config/Factor.tmLanguage.json", "utf8"),
);

function rehypeImageZoom() {
  return (tree: any) => {
    visit(tree, "element", (node, _index, _parent) => {
      if (node.tagName === "img") {
        node.properties = node.properties || {};
        node.properties.class = (node.properties.class || "") + " zoomable-img";
      }
    });
  };
}

function remarkReadingTime() {
  return function (tree: Root, { data }: { data: any; }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    // readingTime.text will give us minutes read as a friendly string,
    // i.e. "3 min read"
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  base: "/julius383.github.io/",
  integrations: [
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      remarkMath,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }]
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeImageZoom
    ],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "github-dark-high-contrast" },
      defaultColor: false,
      wrap: false,
      langs: [factorGrammar],
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
        transformerColorizedBrackets({explicitTrigger: true}),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
    fonts: [
      {
        name: "Inter",
        cssVariable: "--font-inter",
        provider: fontProviders.fontsource(),
        fallbacks: ["sans-serif"],
        weights: [300, 400, 500, 600, 700],
        styles: ["normal", "italic"],
      },
      {
        name: "JetBrains Mono",
        cssVariable: "--font-jb-mono",
        provider: fontProviders.fontsource(),
        fallbacks: ["monospace"],
        weights: [300, 400, 500, 600, 700],
        styles: ["normal", "italic"],
      },
    ],
  },
});
