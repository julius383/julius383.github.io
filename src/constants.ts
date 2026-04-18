import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import IconTelegram from "@/assets/icons/IconTelegram.svg";
import IconPinterest from "@/assets/icons/IconPinterest.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/julius383",
    linkTitle: `Julius on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "Mail",
    href: "mailto:kibunjiajulius@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconMail,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://wa.me/?text=",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconWhatsapp,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=",
    linkTitle: `Share this post via Telegram`,
    icon: IconTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=",
    linkTitle: `Share this post on Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;


// descriptions for top of tag pages
export const TAGS = {
  algorithms: "Posts about data structures and algorithms.",
  bash: "Posts about bash scripting and shell automation.",
  clojure: "Functional programming with Clojure.",
  cryptography: "Discussion on encryption and security protocols.",
  datalog: "Posts exploring logic programming with Datalog.",
  "data-wrangling": "Techniques for cleaning and transforming data.",
  duckdb: "Analytical processing with DuckDB.",
  factor: "Concatenative programming with Factor.",
  git: "Tips and guides for using Git effectively.",
  graphs: "Graph theory and visualization.",
  haskell: "Functional programming with Haskell.",
  julia: "Simulation and data science with Julia.",
  linux: "Linux-related tips, tricks, and tutorials.",
  make: "Build automation with Makefile.",
  "mathematical-optimization": "How to select best element with regard to a specific criteria.",
  python: "My first programming language. Amazing for scripting, data wrangling and web scraping.",
  shell: "Shell scripting and terminal productivity.",
  tools: "Reviews and guides for various software tools.",
  "web-scraping": "Extracting data from the web using various tools.",
} as Record<string, string>;


interface IURL {
  title: string;
  url: string;
}
// personal projects
interface Project {
  name: string;
  description: string;
  repoURL: IURL;
  tags?: string[],
  group?: string;
  extraURLs?: IURL[];
  writeupURL?: IURL;
}

export const PROJECTS: Project[] = [
  {
    name: 'PageSieve',
    description: 'A browser extension for interactive web scraping.',
    repoURL: {title:'github', url:'https://github.com/julius383/PageSieve'},
    tags: ['TypeScript', 'Svelte', 'Web Scraping'],
    // writeupURL: {title: 'devlog', url: ''},
  },
  {
    name: 'Pesarifu',
    description: 'A financial analysis tool for M-Pesa transactions.',
    repoURL: {title:'github', url:'https://github.com/julius383/pesarifu'},
    tags: ['Python', 'Data Analysis', 'Finance'],
    // writeupURL: {title: 'devlog', url: ''},
  },
  {
    name: 'Swahili-Engliish Dictionary',
    description: 'Progressive Web App for Swahili-English dictionary.',
    repoURL: {title:'github', url:'https://github.com/julius383/kamusi'},
    tags: ['JavaScript', 'PWS', 'Data Extraction'],
    writeupURL: {title: 'blog', url: '/posts/extracting-structured-data-from-pdf-files'},
  },
  {
    name: 'Node UI',
    description: 'A visual interface for route planning and shift scheduling.',
    tags: ['JavaScript', 'Google ORTools', 'No-Code'],
    repoURL: {title:'github', url:'https://github.com/TrevorIkky/NodeUI'},
  },
  {
    name: 'FloodIt Solver',
    description: 'Using A* Search to find solutions for the FloodIt game.',
    writeupURL: {title:'blog', url:'/posts/using-a_-and-python-to-solve-a-puzzle'},
    group: 'game-solvers',
    tags: ['Python', 'Search Algorithms', 'Graphs'],
    repoURL: {title: 'github', url: 'https://github.com/julius383/flood-solver'},
  },
  {
    name: 'Typeshift Solver',
    description: 'Solver for Android game Typeshift. Uses OpenCV and Tesseract for OCR.',
    group: 'Game solvers',
    tags: ['Python', 'Computer Vision', 'ADB'],
    repoURL: {title:'github', url:'https://github.com/julius383/typeshift-solver'},
  },
  {
    name: 'Genetic Algorithms',
    description: 'Using genetic algorithms to solve a problem in Julia.',
    writeupURL: {title:'blog', url:'/posts/using-a-genetic-algorithm-to-guess-arithmetic-equations-in-julia'},
    group: 'game-solvers',
    tags: ['Julia', 'Mathematical Optimization'],
    repoURL: {title: 'github', url: 'https://github.com/julius383/genarith'},
  },
  {
    name: 'Asemica Cipher',
    description: 'Encrypt and decrypt text using book text as key.',
    tags: ['Factor', 'Cryptography', 'Concatenative Programming'],
    repoURL: {title:'github', url:'https://github.com/julius383/asemica-factor'},
    writeupURL: {title: 'blog', url: '/posts/2020-04-15-implementing-asemica-a-markov-chain-based-cipher'},
  },
  {
    name: 'Brickgame',
    description: 'Implementation of 999-in-1 brickgame using LOVE2D.',
    tags: ['Lua', 'Love2D', 'Game Development'],
    repoURL: {title:'github', url:'https://github.com/julius383/brickgame'},
  },
  {
    name: 'Python Maze Generation',
    description: 'Generating mazes based on "Mazes for Programmers".',
    group: 'Maze Generation',
    tags: ['Python', 'Algorithms'],
    repoURL: {title:'github', url:'https://github.com/julius383/mazes'},
  },
  {
    name: 'Haskell Maze Generation',
    description: 'Maze generation with Haskell and Diagrams library.',
    group: 'Maze Generation',
    tags: ['Haskell', 'Algorithms', 'Graphs'],
    repoURL: {title:'github', url:'https://github.com/julius383/functional-mazes'},
    writeupURL: {title: 'blog', url: '/posts/2020-01-24-generating-mazes-with-haskell-part-1'},
  },
  {
    name: 'AudioNerve',
    tags: ['Android', 'Audio Analysis'],
    description: 'Song identification app similar to Shazam.',
    repoURL: {title:'github', url:'https://github.com/julius383/audio-nerve'},
  },
] as const;
