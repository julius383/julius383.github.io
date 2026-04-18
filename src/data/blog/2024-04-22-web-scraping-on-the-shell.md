---
title: "Web Scraping on the Shell"
description:
  "Often times there's data on the internet we'd like to get our hands on. In most cases I'd start on
  a Python script with the usual suspects requests, beautifulsoup4, json or csv. This works well
  butwhen the task in question only needs to be run once, it would be alot easier to run a few
  commands on the shell."
pubDatetime: 2024-04-22T00:00:01Z
tags:
  - linux
  - shell
  - web-scraping
created_at: "2026-04-13T09:15:13+03:00"
---

## Table of Contents

Often times there's data on the internet we'd like to get our hands on. In most cases I'd start on a
Python script with the usual suspects `requests`, `beautifulsoup4`, `json` or `csv`. This works well
but when the task in question only needs to be run once, it would be a lot easier to run a few
commands on the shell.

Although writing a Python script is simple enough, we don't have to worry about dependencies or
learning a new tool when working with bash. If you do need to learn a new tool documentation is
easily accessible with `man`.

## Making Web Requests with curl and shot-scraper

[cURL](https://curl.se/) is as useful as it is ubiquitous meaning there's a very good chance it's
already present on your system. Using it is also simple enough `curl https://example.com` fetches a
page and prints the result to standard output. Here's a few other useful arguments:

- `-o, --output path/to/file` for saving the result of the request to a specific file. You can just
  as easily use redirection.
- `-L, --location` which tells `curl` to make a request to the new location if the server reports
  that the page has moved with a `3XX` response.
- `-H, --header 'User-Agent: yes-please/2000'` for providing additional headers to include in the
  request.
- `-f, --fail` useful in scripts since it tells curl to produce no output on server errors.

`curl` obviously supports a lot more arguments but I've found that the few above alongside the
default behaviour is sufficient for most cases.

[shot-scraper](https://shot-scraper.datasette.io/en/stable/index.html) is a great tool that offers a
lot of flexibility in handling websites. The original purpose I believe was to simplify taking
screenshots of webpages but it is capable of a lot more. It uses `playwright` to open the URL in a
headless browser. The first point of interest is the `javascript` sub-command which allows you to
directly extract parts of a page on the command-line.

```sh
shot-scraper javascript 'https://example.com' 'document.title'
"Example Domain"
```

The sub-command also supports passing a JavaScript file which you can go crazy with.

I normally use it to download pages that do not immediately have all the content available after the
page loads. The `--wait` argument tells `shot-scraper` to delay a number of milliseconds before
proceeding with further processing.

```sh
shot-scraper html --wait 2000 'https://example.com'\
    --output /path/to/file
```

There's also a `--wait-for` argument that allows you to wait until a specific JavaScript expression
returns true.

```sh
shot-scraper https://.../ \
  --wait-for 'document.querySelector("div#content")'
```

## Extracting Data From HTML with pup

Working with text on the command-line is often done with tools such as `grep`, `cut` and `awk`. This
approach would be ill-advised for HTML text which is a structured format and contains a lot of extra
text surrounding what is relevant. Being a structured format is however beneficial since we can rely
on the shape of the document to find **exactly** what we're looking for.

Enter [pup](https://github.com/EricChiang/pup) which allows you to filter parts of a HTML document
using [CSS Selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)
which should be familiar to anyone who's ever had to style a web page. Here's an example of finding
the links to the latest articles published on this website.

```sh
curl -s https://julius383.github.io/ | pup 'a.title attr{href}'
```

The full list of supported selectors can be found on the
[GitHub](https://github.com/EricChiang/pup?tab=readme-ov-file#implemented-selectors) page. I didn't
run into compatibility issues and you could copy the CSS selector for a part of a page directly from
your browser as-is.

Another useful feature of `pup` is the functions such as `attr{href}` above which is used to get the
value of a particular tag's attribute. There's also a `text{}` function which does what you'd expect
and the `json{}` function which prints HTML as JSON.

## Wrangling Data with fx and jq

Data wrangling on the shell is really a topic that deserves it's own article (coming soon) so I'll
only go over some simple stuff for now. Probably the most useful tool is
[jq](https://jqlang.github.io/jq/), a command-line JSON processor. Although the syntax can take some
getting used to, it is still pretty useful overall.

Let's say you just got a JSON file from somewhere, you first need to understand the schema. You can
print out the JSON file on the terminal with `cat`, but for nicer output use:

```sh
curl https://pokeapi.co/api/v2/pokemon/ditto -o ditto.json
jq '.' ditto.json | less    # or
python -m json.tool < ditto.json | less
```

Even better is using [fx](https://github.com/antonmedv/fx) a terminal JSON viewer. It allows you to
collapse objects and arrays, copy keys and values and has syntax highlighting.

After getting a general overview of the JSON we can start trying to get a deeper understanding of
the structure. A simple way to do this is with the `keys` function in `jq` which just returns an
array of the keys present in an object.

```sh
jq 'keys' ditto.json
[
  "abilities",
  "base_experience",
  ...,
  "stats",
  "types",
  "weight"
]
```

If you instead want to find the keys present for all objects in an array:

```sh
jq '.stats | map(keys) | add | unique | sort' ditto.json
```

Accessing a field is done using `.fieldname`, you can use `map` to access a field of objects in an
array.

```sh
jq '.stats | map([.stat.name, .base_stat])' ditto.json
[
  [
    "hp",
    48
  ],
  [
    "attack",
    48
  ],
  ...
]
```

[jnv](https://paweldu.dev/posts/fzf-live-repl/) provides a more interactive `jq` experience, however
you can achieve a similar result with `fzf` using a trick I first saw mentioned on
[this](https://paweldu.dev/posts/fzf-live-repl/) website.

```sh
echo '' | fzf --preview="jq --color-output {q} ditto.json" \
    --preview-window=70% --print-query --query='.'
```

## Wrapping Up

The benefit of doing any task in a shell environment is the easy access to plenty of well-written,
well-documented and useful tools. With that said something like Python or Clojure is a lot less
painful for writing robust tools that will see more extensive usage. The key is knowing when to make
the switch. Hopefully this article has helped push the boundary in favour of using the shell more.

- My article about
  [Data Flow on the Shell](https://julius383.github.io/posts-output/2019-03-22-data-flow-on-the-shell/)
  would be useful for anyone interested in tips for processing data with shell tools.
- Another very useful command is `sponge` from the [moreutils](https://joeyh.name/code/moreutils/)
  package which allows you to make changes to a file _in-place_ e.g
  `jq '.' ditto.json | sponge ditto.json` pretty prints JSON from a file and writes it back into the
  same file.
