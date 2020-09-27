---
layout: post
title: Data flow on the shell
tags: [bash, shell, linux]
---

## Pipes

If you've ever spent more than two seconds on anything resembling a Unix shell -
bash and friends - you've probably used a [pipe][2]. Basically a shell pipe,
represented by the bar character (`|`) on a keyboard, is a way of connecting the
output of one command to the input of another. Here's one example taken from my
shell history that changes all the `.txt` (text) files in the current and sub
directories to `.md` (markdown) files:

```sh
find . -type f -name '*.txt' | rename .txt .md
```

## Redirection

Taking the idea of controlling the input/output of a program further is
redirection. It uses the less-than and greater-than symbols (`<` and `>`)
which control where input comes from and where output goes to respectively.
Compared to the relative simplicity of the pipe operator, redirection is
somewhat [overloaded][1].
For example `cat file1.txt file2.txt >> file3.txt` would append the contents of
`file1.txt` and `file2.txt` to `file3.txt` while `cat file1.txt file2.txt > file3.txt` would overwrite what was in `file3.txt` prior to running this command.

What's particularly useful for our purposes is the ability to use it with code
blocks. More specifically  `while`, `for` and, `if/then` blocks. The example
below prints out the character count and upper-cased version of each line of a
file. It's not a very practical example but bear with me a little.

```sh
while read -r line
do
  echo -n "${#line}: " # expands to length of the variable line
  echo "$line" | tr 'a-z' 'A-Z'
done < data.txt
```

## Process Substitution

One drawback of pipelines is they only work when programs use the [standard
streams][3] for input and output and not when they only accept files. Process substitution lifts this restriction by creating files in `/dev/fd/`
to pass around the output of a process/program. The syntax is `<(command)`,
note the lack of space between the `<` and `(`, this is significant.

Why is this useful? Before we get to that let's recap what we've seen so far:

* Output from a process can be captured and sent somewhere else
* That _somewhere else_ can be a code block like a `while` loop
* Code in the loop proceeds with processing as normal

Combine all these and you get a concise solution to an otherwise tricky
problem.

### The Problem

I have a bunch of notes as plain markdown files that I keep synced between my
computer and phone with [syncthing](https://syncthing.net/). Overtime the
files have accumulated and become disorganized. I recently decided to try and
fix this. Using [ranger](https://ranger.github.io/), I am able to  group the
files into directories with related content. However, there's still a bunch of
files that although have descriptive filenames, would be better organized in a
single file under different headings.

### The Solution

I tried a couple of different approaches all of which were either too clunky
or didn't do _exactly_ what I wanted. Eventually I was able to figure out the
following:

```sh
cd ~/notes/some/dir
while read -r name
do
  echo "## $(basename $name)" >> grouped.md
  cat "$name" >> grouped.md
  echo -e "\n\n" >> grouped.md
done < <(find . -maxdepth 1 -type f)
```

Let's walk-through what's happening:

  * Change into the directory containing the files
  * Run `find` which gathers the names of all the regular files in the
    current directory only (`-maxdepth 1`).
  * Pass the names into the `while` loop using process substitution and
    redirection as we have seen is possible.
  * Read each filename into a variable `name` available in the `while`
    loop's body.
  * Write a level 2 markdown header into the output file (using `>>` for
    appending).
  * Write the contents of the file `name` to the output file (again appending
    is necessary).
  * Add newlines to delimit the different items.

The end result is a single file with content under relevant headings all 
without tedious copy-pasting or complicated code :). How would you have done it?


## Appendix
* Chapter 6 of [The Linux Command Line](http://www.linuxcommand.org/tlcl.php/) although the entire book is great.
* [Redirecting Code Blocks](https://www.tldp.org/LDP/abs/html/redircb.html) on the Linux Documentation Project.
* [Process Substitution](https://www.tldp.org/LDP/abs/html/process-sub.html) also on TLDP. There are some great examples of when process substitution may be useful.

[1]: https://www.tldp.org/LDP/abs/html/io-redirection.html
[2]: https://en.wikipedia.org/wiki/Pipeline_%28Unix%29
[3]: https://en.wikipedia.org/wiki/Standard_streams
