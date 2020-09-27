---
layout: post
title: Colouring arbitrary shell output
tags: [python, shell, linux]
---

I do a lot of my work on the command line and consequently are often staring
at large amounts of text. This isn't much of a problem when working with code
in any decent [editor][1] but firing one up isn't always necessary
especially when you don't need to make any edits. For just inspecting the
output of a command `less` is often enough but it lacks the syntax highlighting
you get from an editor.

A while ago I found the [pygments][2] project that provides a utility
called `pygmentize` which allows you to highlight code by running a command and
supports various forms of output like html and ANSI escape codes for the
terminal. What this means is you could just run `pygmentize -g code.py | less -R`
and have syntax highlighting outside an editor. Another tool [bat][3]
works in a similar way but knows to use `$PAGER` so I don't have to manually
pipe output into `less` when dealing with text that won't fit on screen.

The problem is `pygmentize` only works for things it already knows about. 
You (or someone else) has to have written a [lexer][4] for the language 
you want to highlight. The same is true for `bat`.


## Highlighting Text Without Writing A Custom Lexer

Pygments is a cool project and lexers already exists for pretty much every
language you may need. I hardly ever need to highlight source files though
since despite how I've made it seem, opening an editor is almost always
the appropriate action. What I do need though is highlighting for any command
that produces a large amount of text which in my case is typically the output
of `cower -s`.

[cower][5] is a tool that allows you to search for and download packages from
the [Arch User Repository][6]. It doesn't have as many features as some of the
other tools but works well and stays out of your way. Here's how the output
typically looks:

![cower uncolored output](../images/cower1.png){.img-fluid}

As you can see it can be kind of hard to find exactly what you need in all the
text produced so I started thinking of a way to use pygments without first
having to define a custom lexer.

### The Script

Pygments has a tutorial on their website describing [how to write a lexer][7]
that was very useful in writing this script. I will omit most of the set-up
code which you can see in the [gist][8] with the full version of the script
and only include the `main` function.

```py
def main():
    global groups
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--pattern', dest='patterns', nargs='+')
    args = parser.parse_args()
```

The first part of the main function indicates the usage of a global variable
`groups` which is a list of the custom pygments tokens I created for use in
this script. Next is instantiation of the [argument parser][9] which takes at
least one regular expression to use for highlighting (`nargs='+'`) and puts
them in a list.

```py
    class CustomLexer(RegexLexer):
        name = 'rcolor'
        tokens = { 'root' : list(zip(args.patterns,
				      itertools.cycle(groups))) }

    text = sys.stdin.read()
    result = pygments.highlight(text, CustomLexer(),
            Terminal256Formatter(style=RegexStyle))
    print(result)

    return 0
```

As per the instructions on how to create a lexer, we create a sub-class of
`RegexLexer` with the regular expressions passed in by the user. This is done
simply by setting the `root` value to a list of tuples of the form
`(regex_string, token_group)`. In our case the regular expressions are
specified by the user on the command line and are in a list `args.patterns`.

`itertools.cycle` ensures that all the regular expression are assigned a
group for colouring even if we need to reuse the groups.
Finally since this script is meant to be used to colour output from any given
command, we read input from `stdin`.

All that's left is to highlight the text with our custom lexer and ensure the
output produced is tailored to the terminal. Here's what the end result looks
like:

![cower coloured output](../images/cower2.png){.img-fluid}

Looks a lot nicer doesn't it?

### Going Further

Before starting this article I did not know of the existence several programs
that do essentially the same thing. A [list][10] can be found on the Arch wiki.


[1]: https://neovim.io/
[2]: http://pygments.org/
[3]: https://github.com/sharkdp/bat
[4]: https://en.wikipedia.org/wiki/Lexical_analysis
[5]: https://github.com/mgalgs/cower
[6]: https://wiki.archlinux.org/index.php/Arch_User_Repository
[7]: http://pygments.org/docs/lexerdevelopment/
[8]: https://gist.github.com/julius383/00ef07454dd51c352eed6d3164f531d2
[9]: https://docs.python.org/3.6/library/argparse.html
[10]: https://wiki.archlinux.org/index.php/Color_output_in_console#Wrappers

