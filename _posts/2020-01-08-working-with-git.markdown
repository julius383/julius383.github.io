---
layout: post
title: "Working With Git"
tags: [git, tools]
---
`git` is an extremely useful tool that should be part of any serious
developer's toolkit. If this is the first time hearing about it, the
short version is that it allows you to track different versions of your
files. This allows you to make significant changes without worrying
about losing important work and, for multiple people to contribute to a
project with the least amount of friction. With that said, this is by 
by no means an introduction to `git` but an exposition of some features
that may help improve your productivity once you learn it.

## Empty Commit Messages

Why someone may want this is not immediately obvious but the reason is
that sometimes a commit doesn't really require text explaining it. As part
of each commit `git` stores the files that changed and the corresponding
changes. This is already more than in enough information in some cases.
Where I use this is in the `git` repo tracking all my configurations.
Files like `.zshrc`, `.tmux.conf` and a lot of other things in 
`~/.config`. The contents change semi-regularly and having to describe
what changed in every commit with a message would be painful. So the 
solution is the following line in my `crontab`:

```sh
0 */6 * * * cd /home/kajm/.dotfiles && git commit --allow-empty-message -am ''
```
As you may have already guessed the flag `--allow-empty-message` is what
makes `-m ''` possible.

## Watch Important Files For Changes

This one relies on [entr][1] which watches a list of files for changes and
does something afterward. There's a lot of different file watchers but
this one in particular I have found to be the most useful. Now since `entr`
takes a file list from `stdin` means that we can use `git ls-files` in a
repo to watch for changes to only files we have committed. Files that are 
committed are often the only ones we care about so this is a lot nicer
than filtering the output of `find` or `ls`. The relevant snippet is:

```sh
git ls-files | entr -cr node app.js
```

Which just reloads a `node.js` application when the checked in files change.
One other task I use this for is regenerating `.love` files in the background
when working on a [LÖVE2D][2] game by simply running `Make`.

```sh
(fd -e lua | entr -p make > /dev/null &)
```

Here I'm using [fd][3] as opposed to `find` because doing things like 
searching by extension is easier.[^1]


## Saving Online Credentials

Firstly a disclaimer, this method stores your credentials (username +
password) in a file `.git-credentials` in plaintext. This may pose a
security issue but if that isn't really a concern then you're good to go.

```sh
git config credential.helper store
```

Once you type this, the next time you do an operation that requires 
entering some credentials (like `git pull`) they will be saved. If you 
later want to disable storage remove the credentials file and use:

```sh
git config --system --unset credential.helper
```

Optionally, storing credentials for a short-period is also possible with:

```sh
git config --global credential.helper cache
```

The credentials are kept for a default of 15 minutes but duration can be
supplied by changing `cache` to `'cache --timeout=<seconds>'`.

## `.gitignore` Patterns

For the most part the pattern rules are straight-forward but there
are some key things to pay attention to:

* The backslash (`'\'`) character is used for escaping e.g for end of line
  spaces or patterns beginning with a `#` or `!`.
* A `!` at the beginning of a pattern negates its meaning.
* A leading forward slash does not change the meaning of a pattern that
  has a forward slash elsewhere in the pattern i.e site/css and /site/css
  are the same.
* A trailing forward slash on a pattern matches only directories but
  both files and directories when left out.

## Addendum

* You can find templates for `.gitignore` files [here][6].
* `git config --get remote.origin.url` prints the remote when run inside
  a repo you cloned.

## Further Reading

* The [Credential Storage][4] section of the `git` book.
* The [gitignore][5] documentation section.

[^1]: The whole thing is in a subshell so it can be backgrounded.

[1]:https://eradman.com/entrproject/
[2]:https://love2d.org/
[3]:https://github.com/sharkdp/fd
[4]:https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage
[5]:https://git-scm.com/docs/gitignore
[6]:https://gitignore.io/
