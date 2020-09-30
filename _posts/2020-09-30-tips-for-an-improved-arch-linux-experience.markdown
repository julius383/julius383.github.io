---
layout: post
title: Tips For An Improved Arch Linux Experience
date: 2020-09-30
tags: [linux]
---

## 1. Fallback Kernel and Firewall

Arch Linux follows a rolling release model meaning that a lot of the 
packages on the official repositories are fairly recent. This is great 
since you can get updates quickly but you may also end up with software 
with some yet to be discovered bugs. Since this can leave you with an 
unbootable system, it's a good idea to have a backup plan. For the case of the kernel it's as simple as installing a secondary kernel. The exact 
command is:

```sh
sudo pacman -Syu <alternative-kernel>
```

`<alternative-kernel>` may be any of the officially supported kernels but
I would recommend `linux-lts` which is the longterm support version and
is generally considered to be more stable. You can boot into an 
alternative kernel by choosing the relevant option in the `GRUB` menu 
when your computer is starting.


Although it is mentioned in the [General Recommendations][1] of the Arch
Wiki - which everyone should read at least once - not many people take the
time to setup a firewall. The first few times I had to install Arch I did
it by following the [Simple stateful firewall][2] guide on the wiki.
Although this is simple enough, it's pretty painful manually specifying
all the rules so instead it is preferable to use [`ufw`][3]. It simplifies
the process of specifying rules and has the added benefit of already
containing 'profiles' for common applications like `ssh` and `syncthing`.
To see the available app profiles use `sudo ufw app list` then you can
use `sudo ufw allow syncthing` to enable the rules for the corresponding
app.


## 2. Ranking Mirrors and Merging Changes To System Files

One of the tasks you have to do during installation is editing `/etc/pacman.d/mirrorlist` to enable a mirror where `pacman` looks for packages.
Although it's generally true that the closer the mirror is to your
physical location the faster it will be, this is not always the case.
There's two approaches you can take to solving the problem, the first
is using `rankmirrors` as described on the [wiki][4] or using `reflector` along with a pacman hook that runs whenever the mirrorlist is updated.
For the second approach create a file `mirrorupgrade.hook` in `/etc/pacman.d/hooks/`

```ini
[Trigger]
Operation = Upgrade
Type = Package
Target = pacman-mirrorlist

[Action]
Description = Updating pacman-mirrorlist with reflector and removing pacnew...
When = PostTransaction
Depends = reflector
Exec = /bin/sh -c "reflector --latest 200 --age 24 --score 10 --sort rate --save /etc/pacman.d/mirrorlist; rm -f /etc/pacman.d/mirrorlist.pacnew"
```

With this anytime that `pacman-mirrorlist` is upgraded the `Exec` line is
run which uses `reflector` to find the 10 fastest mirrors out of the
most recent 200 mirrors within the last 24 hours.


When a package is updated and a file from the updated package is different
from the one on disk, the file from the packages is renamed with the
`.pacnew` extension. This is to ensure that your changes are not 
overwritten during a upgrade. A message is printed during install 
informing you of this and you should find time to merge the changes. To
make this easier I recommend installing [`meld`][5] and `pacdiff` which is
part of `pacman-contrib` that also contains the previously mentioned
`rankmirrors`. `meld` is a visual diff and merge tool that's pretty handy
to use. To resolve `.pacnew` files run

```sh
env DIFFPROG=meld sudo -E pacdiff
```

`DIFFPROG=meld` ensures that `meld` is used to perform the diffing. You
can use something else by changing the value of the variable e.g
`DIFFPROG=vimdiff`. The `-E` flag ensures that sudo retains the 
environment. You can then proceed to compare and merge the normal
and `.pacnew` files.


## 3. Improving `makepkg` Compile Times and Downloading `PKGBUILD`s

There are a couple of different ways to improve the performance of 
`makepkg` as outlined on the corresponding [wiki][6] page but the one I 
find easiest to set-up is adding `ccache`. `ccache` reduces the time 
spent on subsequent compiles after the first one. Installing is done with 
`sudo pacman -Syu ccache` and in order to enable it with `makepkg` you 
just need to add `ccache` to the `BUILDENV` array inside 
`/etc/makepkg.conf`. How much this helps depends a lot on what type of 
software you use but it's such a small addition that it's a shame not to 
use.


`PKGBUILD`s are how packages are built on Arch. If you've used the [AUR][8]
you have probably had to open and inspect one but what if you want to
find the `PKGBUILD` for an official package? You could look for it 
through the online [site][7] as you would with the AUR but that gets
pretty tedious if you have to do it frequently. `asp` can be used instead
to checkout the `PKGBUILD` used to build a package from the official
Arch repo. For example to get the `PKGBUILD` for `vim` you'd use

```sh
asp export vim
```

## 4. Fixing Visual Bugs in Java Programs and Better Looking QT applications

When using some Window Managers such as [bspwm][9] you sometimes run into
problems with Java based GUI applications like [jdownloader][10] or 
[logisim][11]. The application starts up fine but none of the widgets are
rendered. To fix this issue you need to add 
`_JAVA_AWT_WM_NONREPARENTING=1` to the environment of the application. 
This can either be done by using `env` on the command-line, or
creating a custom `.desktop` file i.e 

```sh
# set environment on the command-line
env _JAVA_AWT_WM_NONREPARENTING=1 logisim

# create a custom .desktop file

# copy system-wide desktop file
cp /usr/share/applications/logisim.desktop ~/.local/share/applications/

# replace the Exec line

# before
...
Exec=/usr/bin/logisim
...

# after
...
Exec=env _JAVA_AWT_WM_NONREPARENTING=1 /usr/bin/logisim
...
```

Alternatively modify the global environment by putting the
variable assignment in `/etc/environment`.


When an application is built with QT it is possible to set the theme it
uses similarly to how you can use a global GTK theme. To do this you
need to install [`kvantum`][12] which is a theme engine for QT.
To force a QT applications to use the theme specified in `kvantum` set 
`QT_STYLE_OVERRIDE=kvantum` in the environment using any of the methods
described previously.


## 5. Finding `WM_NAME`/`WM_CLASS` and Keycodes 

It is sometimes necessary to know the `WM_NAME` or `WM_CLASS` for a
particular application. Two examples of these cases is when defining
windowing rules in [`bspwm`][9] or transparency rules in 
[`compton`][13]. To find these values you need to have installed 
`xorg-xprop`. You can then run `xprop` in a terminal and click the window 
in question and the values for `WM_NAME` and `WM_CLASS` should be among 
the printed output.


When you need to know the keycode or button number for a particular key
on your keyboard or button on your mouse then you need `xev`. It's part
of the `xorg-xev` package. When run it launches a window and pressing a
key or clicking a button with the window in focus prints out the 
key's/button's info. You can further limit the events to mouse or keyboard events only using the `-event` flag e.g

```sh
xev -event mouse

# left clicking in the opened window yields the output

ButtonPress event, serial 25, synthetic NO, window 0x3400001,
    root 0x1a1, subw 0x0, time 106783914, (434,395), root:(1402,436),
    state 0x0, button 1, same_screen YES

ButtonRelease event, serial 25, synthetic NO, window 0x3400001,
    root 0x1a1, subw 0x0, time 106783939, (434,395), root:(1402,436),
    state 0x100, button 1, same_screen YES
```

As you can see the left-click mouse button is `button 1`.



At the end of the day Arch is meant to be tweaked to your heart's content 
so the more time you invest, the closer to your ideal system you get. 
Happy Hacking!


[1]: https://wiki.archlinux.org/index.php/General_recommendations
[2]: https://wiki.archlinux.org/index.php/Simple_stateful_firewall
[3]: https://wiki.archlinux.org/index.php/Uncomplicated_Firewall
[4]: https://wiki.archlinux.org/index.php/Mirrors#List_by_speed
[5]: https://meldmerge.org/
[6]: https://wiki.archlinux.org/index.php/Makepkg
[7]: https://www.archlinux.org/packages/
[8]: https://aur.archlinux.org/
[9]: https://github.com/baskerville/bspwm
[10]: https://jdownloader.org/
[11]: http://www.cburch.com/logisim/
[12]: https://github.com/tsujan/Kvantum/tree/master/Kvantum
[13]: https://github.com/chjj/compton
