---
title: System dot Backup
pubDatetime: 2021-05-17T00:00:01Z
description: "Comparing Clojure, Python and Bun"
draft: true
tags:
  - factor
  - python
  - haskell
  - clojure
  - linux
---

## Table of Contents

## Before We Start

There are a few things I hope to accomplish with this article:

- Describe the process of solving a problem I have been thinking about for a while.
- Compare a couple of different programming languages for the purpose of scripting.

## The Problem

When you've spent enough time on a Linux system you end up with a lot of configuration changes
across multiple files. This is a result of many hours spent looking up fixes and how to configure
various features of whichever applications. Since we spent all this effort it would be prudent to
backup the changes we've made. This would reduce the time we need to spend configuring programs in
the future, whether on a fresh install or replicating on a different system.

For user level configurations thanks to various `rc` (bashrc etc) files and also the [XDG Base
Directory Specification ][1]. The latter specifies various things including where user-specific
configuration files should be placed. Backing-up the `rc` files and the config directory - which is
contained in the environment variable `XDG_CONFIG_HOME`  
means the case for user configurations is mostly covered. So what do you do when you need to somehow
retain the changes made to system level files commonly found in `/etc`? There's a variety of things
some of which are:

1. `tar` the whole `/etc` directory. This isn't very effective since in practice you don't modify a
   great number of files and you can't really tell which configurations are different from the
   default.
2. Manually keep track of which files you modify and back those up. Although this only saves files
   that are actually significant it is a fairly tedious task keeping track of which files changed
   yourself. Furthermore you have to do this from the very start otherwise you're sure to miss some
   changes.
3. Automatically finding which files are significant to each package and backing only those that
   differ from the default.

This last approach is the one we are interested in. What we need is a script that looks through all
the relevant system configuration files and compares them to their default state. When changes are
found we mark those files as candidates for backup.

## So Many Languages So Little Time

You've probably seen a lot of articles about how to write a script in X language. What this should
tell you is that _any_ language can be used to write a script, it just depends on how much effort
you're willing to expend. So why would you opt to write a script in a language like Haskell for
example? The short answer is to facilitate re-use. As programmers one of the first pieces of advice
we hear is that repeating code is bad. In this case however, re-use does not just apply to code. We
also would like to re-use the patterns we've learnt when using a language that make solving certain
problems less of a chore. Different languages also often require different execution environments so
by re-using a language we avoid needing to setup an entire new environment. What this means for
instance is that we don't need to configure and install Ruby when we already have a working Python
installation.

Regardless of what your favourite language is there's a two things I think are necessary to make a
language _feasible_ for scripting:

- A good standard library or a convenient way of installing additional libraries. Probably my
  favourite example of the latter case is the [Script Imports][3] feature of [Ammonite][2] which
  aims to streamline the process of writing scripts in Scala.
- It may sound obvious but, being able to run a file through a [shebang][4] line. If you don't know
  what this

Some things

## How to Write Scripts in Clojure/Factor/Haskell/Python

## The Solution

### Extracting the Contents of a Package

### Listing the Files in a Package

### Comparing Package Files with those on your System

## Deploying the Scripts and Final Verdict

[1]: https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
[2]: https://ammonite.io/
[3]: https://ammonite.io/#ScalaScripts
[4]: https://en.wikipedia.org/wiki/Shebang_(Unix)
