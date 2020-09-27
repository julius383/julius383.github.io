---
layout: post
title: Makefile Madness
tags: [shell, make]
---

`Make` sometimes gets a bad rap mainly for some warts in it that are a
result of how old it is. It does have it's merits though since even in 2019
you are still more than likely to find a Makefile somewhere in most open
source project's repositories.

In this article I'll try and talk about the *coolest/strangest* features.
This article is not meant to teach you how to write a Makefile, why you
should bother learning, or the best practices. There are plenty of good
guides as well as entire books dedicated to the topic of `Make` (I like the
official [GNU Documentation][1]).

Most of the tricks in this article I learned while using Makefiles as a
way to store small snippets of code that do various tasks. Essentially
it was `Make` re-purposed as a generic task runner. The tasks
consist mainly of commands that I ran semi-regularly and are in-between
being too short to put in a separate file and too long to repeatedly
type into a shell. A link to the full Makefile is at the bottom. I
recently moved the tasks to using [pyinvoke][2] that enables more
flexibility since some of the tasks required jumping through too
many hoops when using `Make`.


### Conditional Assignment

The first one is not too difficult to understand, basically in Makefiles
you can assign a value to a variable unless it already has a value in
which case you just leave it alone. The way this looks is

```Makefile
DIR ?= ~/code/Python/
```

This is useful since it enables you to set default values for variables
but ensures that in case the user already specified a value, to use that
instead. Using conditional assignment allows your rules to be configurable
but also not fail when a value isn't supplied.


### `eval`

It is very rare to hear `eval` in any language being spoken of positively
given that it is very easy to misuse. Regardless, due to the nature of
Makefiles as kind of an weird macro language, `eval` exists and is
sometimes useful. To understand how we'll go on a bit of a tangent.

If you've ever seen a Makefile you know that it roughly consists of a
bunch of variables followed by sections describing how to perform
certain tasks. The part that interests us are the task descriptions. The
syntax is roughly:

```
rulename: prerequisites
  command1
  command2
  ...
  commandn
```

The section with the commands is not technically `Make` in the sense that
it is treated as text that is just 'preprocessed' and then passed on to
the relevant program to be executed. Suppose we want to do `Make` specific
things like set variables in this section and have them persist in
Make's environment, `eval` comes in handy here:

```Makefile
py3-proj:
	$(eval DIR ?= ~/code/Python/)
	$(MAKE) -f $(AFILE) create-project DIR=$(DIR) TYPE=Python3 EDIT=$(EDIT)
```

What is happening above is first we checks if a `DIR` variable is already
set (perhaps was specified on the command line) before setting a default.
Then we call `Make` _recursively_ (&#128526;) to run a different rule with some
'arguments'.

### Changing `SHELL`

If I could only write about one interesting feature this would definitely
be it. I remember reading about it in the GNU docs and thinking it
was such a cool feature. The reason why is that it frees you from the
restriction of using `shell` which also has it's own unique set of problems.

```Makefile
SHELL = /usr/bin/python3
.ONESHELL:
chaos-game:
	import turtle
	from random import choice
	edges = [(-200, 200), (200, 200), (200, -200), (-200, -200)]
	current = choice(edges)
	last = edges[0]
	turtle.speed(0)
	turtle.penup()
	turtle.hideturtle()
	for i in range(5000):
	    while last == current:
	        current = choice(edges)
	    tx, ty = turtle.position()
	    new_x, new_y = ((current[0] + tx) / 2, (current[1] + ty) / 2)
	    turtle.setpos(new_x, new_y)
	    turtle.dot(8, "red")
	    last = current
	    current = choice(edges)

	turtle.done()
```

`.ONESHELL` from the docs:

> If .ONESHELL is mentioned as a target, then when a target is built all lines
> of the recipe will be given to a single invocation of the shell rather than
> each line being invoked separately

`.SHELLFLAGS` is also a useful variable to set as it controls the arguments
that are passed to the program in `SHELL`. By default it is set to `-c`.

### Canned Recipes and `call`

Canned recipes allow you to define a sequence of commands that can be
used in multiple recipes saving it in a variable. Combining this with
the `call` function leads to something very useful. `call` is used to
create new parameterized functions by writing an expression in a variable
(using `define` for instance) then expanding it with temporary variables
`$1`, `$2` and so forth that hold the arguments the call was made with.

Here is a useful example that adds simple notifications depending on the
exit status of the last shell command.

```Makefile
define notify =
if [[ $$? -eq 0 ]];then
  notify-send -t 5000 $1
else
  notify-send -t 5000 $2
fi
endef

# example usage
cap-screen:
	# Take screenshot of selection
	scrot -q 100 -s
	$(call notify, "Screenshot taken", "Failed to take screenshot")

```

### Going Further

Turns out that `Make` is a lot more flexible than it appears at first
glance. There's a ton of more lesser known features I have not covered
here but are in the official documentation for GNU Make. Take a look at
it and feel free to send me an e-mail if you find another gem.

* The [gist][3] with the Makefile
* The [GNU Make Standard library][4] is full of crazy things you wouldn't think
  are possible with Make
* [GNU Make official documentation][1]

[1]:https://www.gnu.org/software/make/manual/make.html
[2]:https://www.pyinvoke.org/
[3]:https://gist.github.com/julius383/fc6ac44c241fcc60e1076da4a22a6169
[4]:https://gmsl.sourceforge.io/
