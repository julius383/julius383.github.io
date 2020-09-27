---
layout: post
title: "Writing a Command for Ranger"
tags: [python, tools]
---

## Background

[ranger][1] is a terminal-based file manager that is written in Python.
This is interesting for a couple of reasons. One is that it nicely
integrates with the rest of the terminal. Another is that it can be
extended fairly easily. It also supports vim-like key bindings. That last
one may not seem like a merit but the interface ends up being really
intuitive.

As part of my ongoing effort to be more organized I decided it's about
time I sort my wallpaper collection. At first glance there's a couple of
ways to do this. But, by far the simplest is using sub-directories for each
distinct category. The problem is, even using  `ranger` with its simple and
intuitive interface ends up still being a lot of busy work. We all hate
busy work but as programmers we can potentially do something about it
([relevant xkcd][2]).

## Organizing Images Into Sub-directories

The best way I could think of to save myself some time is to somehow bind a
key (like Space) to an arbitrary sequence of commands. Performing an action
which in this case would be moving whichever file is selected to some
sub-directory would just involve hitting a key. All that was left was actually implementing it.

Ranger is extended simply by adding a subclass of the `Command` class to
a file called `commands.py` in the ranger config directory. A sample
`commands.py` can be obtained by running

``` sh
ranger --copy-config=commands
```

The two methods of the `Command` class you should be concerned with are
`execute` and `tab`. The former should contain the code you want to run
when your command is executed. The latter can be used to provide completion
options when a user hits the `tab` key. For our purposes implementing
tab-completion isn't really necessary.

From what we've discussed so far, our new command needs to:

* Parse the sequence of commands entered by the user,
* Interpret special placeholders representing either the currently selected
  file or the current working directory,
* Map the Space key to the user specified command sequence,
* and, optionally restore the Space key to whatever it was. This isn't
  necessary since the remapping lasts only until `ranger` is closed.

## The Code

``` py

class bspace(Command):
    """:bspace [command]

    Temporarily bind a command to the space bar. {file} is
    replaced with the currently selected item and {cwd} with
    the current working directory. Run without arguments to
    restore the original binding.
    """

    def execute(self):
        # default binding for <Space>
        orig_binding = "mark_files toggle=True"
        if len(self.args) == 1:
            new_binding = orig_binding
        else:
            resolved_args = []
            for arg in self.args[1:]:
                # replace {file} with current file in command
                if arg == '{file}':
                    resolved_args.append('%p')
                # replace {cwd} with current working directory
                elif arg == '{cwd}':
                    resolved_args.append('%d')
                else:
                    resolved_args.append(arg)
            new_binding = ' '.join(resolved_args)
        self.fm.execute_console(f"map <Space> {new_binding}")
```

To use the command simply enter a command that you want to temporarily
bind to the Space key after `:bspace` in the ranger console. A couple of
useful examples are:

* `:bspace delete {file}` - deleting a file (please be careful).
* `:bspace chain copy;cd ../paste;cd {cwd}` - copy a file to the parent
  directory.
* `:bspace shell cat {file} >> somefile.txt` - appending to a particular
  file.
* `:bspace chain cut;cd landscapes;paste;cd {cwd}` - the command we need
  to organize images into sub-directories. Since ranger supports image
  previews, all we need to do is go through the directory and hit Space
  on every landscape image and it is moved to the relevant directory.
  `landscapes` in the command can be changed when we want to put an image
  in a different directory.


Here's a gif of our command in action
![Command demo gif](../images/action.gif){.img-fluid}

## Further Reading

* The [ranger wiki][3] has some great examples of custom commands.
* The Arch Wiki ahas [a great page][4] about ranger.
* The [Official User Guide][5].
* The complete code can be found in a [gist][6].
* I recently found [TMSU][7] which is a way to tag files and browse them
  through a virtual file-system (I haven't had time to try it though
  so can't say if it's any good)

[1]:https://ranger.github.io/
[2]:https://xkcd.com/1205/
[3]:https://github.com/ranger/ranger/wiki/Custom-Commands
[4]:https://wiki.archlinux.org/index.php/Ranger#Tips_and_tricks<Paste>
[5]:https://github.com/ranger/ranger/wiki/Official-user-guide
[6]:https://gist.github.com/julius383/1001e0b0a5a8da01873d2747e8af2736
[7]:https://tmsu.org/
