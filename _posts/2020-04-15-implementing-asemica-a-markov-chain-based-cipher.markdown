---
layout: post
title: "Implementing Asemica: A Markov Chain Based Cipher"
tags: [cryptography,factor]
---

What exactly is a cipher? To put it simply it is an algorithm for 
performing encryption and decryption. Encryption being the process a piece
of information (known as plaintext) is transformed into an alternate 
form (known as ciphertext) in such a way that knowing only the content 
of the ciphertext can not lead to knowing the content of the plaintext.
Decryption is going the other way from ciphertext to plaintext.
Both encryption and decryption rely on a key that drives the operation
of the cipher. When the key changes ideally the same piece of plaintext
should produce a different piece of ciphertext but the result of applying
the right key to the right ciphertext should always lead to the same
plaintext. A key then is the one piece of information (other than the
plaintext obviously) that must remain secret. There are a lot of finer
points but that is the gist of it.

One other thing necessary to know before going into the discussion of
the Asemica cipher is what a Markov chain is. The precise definition
can be found on [WikiPedia][1]. For our purposes all you need to know is 
that it is a model where the probability of one event occurring depends 
only on the value (state) of the preceding event. That still sounds a bit 
cryptic but it'll become clearer later on.


## How Asemica Operates

Before we begin I'd like to state that the algorithm was formulated by
a person called [Danne Stayskal][2] and the original implementation (in
Perl) is available in their [GitHub][3] profile. I cannot recall how I
found it initially but it was only until recently that I decided to try
and figure out how it works by re-implementing it in a language I am more
familiar with.

The reason I waited until recently to start my re-implementation effort
was because of needing to learn a bit of Perl to use for scripting on
Linux. Perl is a bit famous (infamous?) for being hard to read but after
only going through a few chapters of [Learning Perl][4] and a healthy 
amount of comments in the original source for Asemica, I was able to 
understand how it works enough to write my own version.

Asemica relies on a regular document of text as a key. In order to 
understand how it works it is necessary to understand how a document is
used as a key. The first step of the Asemica algorithm is turning the 
document key into a table of unique words present in the document. For
any given word we keep track of all the words that appear directly after 
it anywhere in the text and how many times they do. For ease of reference 
the sequence of words-that-follow will be called _doors_ and _exits_ when 
the sequence includes the occurrences.

After this mapping of words and their associated information - which we'll 
refer to as the _transition table_ - is created, those words with 15 or 
more different words following it are considered _meaningful_ as they are 
able to represent a half a byte of information. All others are considered 
meaningless. This table is used to carry out both encryption and
decryption.

### Encryption

During encryption the plaintext is converted into a sequence of bytes
which are further converted into binary strings then grouped into half-byte
numbers (nibbles)[^1]. Then beginning a randomly chosen word from those 
present in the document key which we will refer to as a _token_ the 
following series of steps is repeated until the nibble sequence is empty:

  * The current _token_ is appended to the ciphertext result string.
  * If the token is _meaningful_ then a single value is popped from the
    sequence of half-byte numbers and its integer value used to index
    the list of _doors_.
    This word becomes the next _token_.
  * If the _token_ is not _meaningful_ we randomly pick one of the _doors_
    and use that as the _token_ in the next iteration.

As we can see moving from one _token_ to the next is wholly dependent on
the value of the previous _token_ which is exactly the type of relationship
that a Markov chain describes. The probability of moving to a state in
_doors_ is $1/n$ where $n$ is the length of the _doors_ sequence and 
that of moving to a state not in _doors_ is $0$.


### Decryption

During decryption, the ciphertext is first split into a list of words.
The _words_ list is iterated over until the second last element and 
the following steps are carried out:

  * Check if the current word is _meaningful_ skipping it otherwise since
    it could not have been used to encode a nibble.
  * Try and find the next word's index within the current word's
    _doors_.
  * This index is converted into a binary string and appended to the
    plaintext result string.

At the end of the loop the plaintext string is just a long binary string
and not the intended message. To convert back into whatever was encrypted
the binary string is divided into groups of 8 (binary) characters. 
These characters represent a single byte and are converted back
into the ASCII value they represent. The resulting string is the
original message.


## Concrete Implementation

To implement Asemica I chose the [Factor][5] programming language which is 
described on the homepage as:

> a concatenative, stack-based programming language with high-level
> features including dynamic types, extensible syntax, macros, and
> garbage collection.

Apart from the features listed above one more that I think is useful is
the [listener][6] - basically an enhanced REPL - which is helpful for
interactive development.


### Representing A Transition

The first detail to work out is how to represent the information present
in each entry of the transition table. For this we'll use a [Tuple][7]
which is similar to data classes in other languages. The syntax is
pretty straightforward[^2]:

```factor
TUPLE: transition
{ token      string }  ! raw string as it  appeared
{ seen       integer } ! how many times token has been seen
{ door       vector }  ! words after this one in document key
{ doors      integer } ! length of door vector
{ exits      assoc }   ! words after plus occurrence count
meaningful             ! true or false depending if doors > 15 ;
```

The following is a `transition` value for one word. The key file used
was Metamorphosis by Franz Kafka downloaded from
[Project Gutenberg][8] as a text file:

```json
{
    "token": "eBook",
    "seen": 12,
    "door": [
        "of",
        "is",
        "or",
        "Details",
        "First",
        "METAMORPHOSIS",
        "complying",
        "for"
    ],
    "doors": 8,
    "exits": [
        [ "of", 2 ],
        [ "is", 2 ],
        [ "or", 2 ],
        [ "Details", 1 ],
        [ "First", 1 ],
        [ "METAMORPHOSIS", 2 ],
        [ "complying", 1 ],
        [ "for", 1 ]
    ],
    "meaningful": false
}
```

### Generating the Transition Table

The next step is actually building the _transition table_. To do this as
we saw earlier requires iterating through all the words in the document
key and checking which word follows each and updating the relevant
`transition` tuple. Rather than using an indexed loop on a single stream
of tokens I instead opted to use the `2each` combinator[^3] which requires
two sequences and a quotation on the stack. It is roughly equivalent to
the following Python snippet:

```python
def two_each(seq1, seq2, f):
  for a, b in zip(seq1, seq2):
    f(a, b)

# example usage
two_each(range(5), range(1, 5), print)

# example output
0 1
1 2
2 3
3 4
```

We can already guess how to pair up each word with the one that follows
it and run a function on it[^4].

```factor
: 2tokens ( str -- a b )
    clean-string " " split dup rest ;

:: generate-transitions ( a b -- table )
    { } >alist :> ttable! ! create empty transition table
    a b ! tokens
    [
        :> value
        :> key
        ! get transition tuple if it exists or make new one
        key >lower ttable new-or-existing
        key >>token
        ! update with information
        value swap update-transition-info
        ! modify the transition table
        key >lower ttable assoc-add ttable!
    ] 2each ttable set-meaningful ; 
```

The `2tokens` word produces the two sequences we need from a string after
first cleaning the string (this is just removing extra spaces and
newlines among other things). These two sequences are used as input to the 
`generate-transitions` word. Unlike most other stack-based programming languages, Factor allows using [lexical variables][9] ( `::`, `:>` ) which can be a lot more convenient than manipulating multiple different stack values. 

### Encryption and Decryption

The code responsible for encryption is not very complicated if you keep
a few of these Factor specific things in mind:

  * How lexical variables (including mutable ones) [work][9] .
  * Arguments to words are taken from the stack.
  * `length` does what you expect and `index array nth` is `array[index]`
    in Python.
  * `key assoc at` is the same as `assoc[key]` where `assoc` would be
    a dictionary in Python.
  * `seq unclip` puts the first element and the rest of the sequence on
    the stack in reverse order.
  * `meaningful>>` is just how you access the slot named `meaningful` in
    a tuple[^5].

The code for encryption is:

```factor

:: encode ( message transitions tokens -- encmessage )
    ! start with a random token
    tokens length safe-random tokens nth :> token! 
    "" :> encmessage!
    ! transform input into sequence of nibbles
    message unpack nibbles :> nbs!
    [ nbs empty? ] [ 
        { encmessage token " " } concat encmessage!
        token >lower transitions at meaningful>>
        [
            ! encrypt a nibble into a word
            nbs unclip
            token >lower transitions at door>>
            nth token!
            nbs!
        ]
        [
         ! add random word to output without encrypting nibble
         token >lower transitions at doors>> safe-random
         token >lower transitions at door>> nth token!
        ] if
    ] until { encmessage token " " } concat ;
```

For the decryption word other than what we have already mentioned keep in
mind:
  
  * Although iteration over structures is preferred over indexed iteration
    the latter is still possible by using `<iota>` (similar to `range` in
    Python) with the `each` combinator.
  * `find` tries to find a value in a sequence that satisfies a quotation
    and puts the index and the value on the stack or false for both.
  * `when` is like an if statement without an else section.

The decryption code is:

```factor
:: decode ( input transitions tokens -- decmessage )
    "" :> decoded!
    input clean-string " " split :> words
    words length 1 - <iota> [
        :> i
        i words transitions at-nth meaningful>>
        [  
            ! word encodes a nibble so try and find its value
            i words transitions at-nth door>> [ 
                >lower i 1 + words nth >lower =
            ] find 
            :> elt
            :> idx
            elt [ idx make-nibble decoded swap append decoded! ] when
        ] when
    ] each decoded pack ;
```

One final detail necessary for understanding how encryption and
decryption is done is the implementation of `pack` and `unpack`. They are
written to mimic the behaviour of `pack` and `unpack` in Perl with `b*`
as the template string. Here's `unpack`:

```factor
: unpack ( str -- newstr )
    [ >bin 8 zero-pad reverse ] { } map-as "" join ;
```

It converts a string such as "hello" into a binary string such as
"0001011010100110001101100011011011110110". It does this by converting
each character into a binary string (`>bin`) then padding the string with
zeros until it is at least length 8 (`8 zero-pad`). It then reverses the
string to turn it into little endian form (least significant bit first).
The result for each character is concatenated together into a single
string.

`pack` is slightly longer:
```factor
:: pack ( str -- seq )
   0 str length 8 <range> [
        :> start
        start 8 + :> end 
        end str length >
        [ str length ] [ end ] if
        start swap str subseq reverse bin>
   ] { } map-as but-last >string ;
```

It converts a string such as "0001011010100110001101100011011011110110"
back into "hello". It does this by iterating through the string in groups
of 8 characters (representing 1 byte / a single ASCII value). The 8 
characters form a string which is reversed (to turn it back into 
big endian form) before converting it back into an integer (`bin>`). The 
result is a sequence of numbers which can then be converted into an ASCII 
string (`>string`).

After adding a few other bits and pieces like argument parsing typical
usage of the program is shown below:

```shell
$ echo "Pwagu hupata pwaguzi" | factor-vm -i=cust.img asemica.factor \
  -m enc -c metamorphosis.txt -o enc.txt
$ cat enc.txt
them It was ever was ever mentioned as they have expected something to
make use several hours on his many steps and if somebody came to make
use part and with all at seven I'll get enough of luxury For help her
breast His bed perhaps any moment and when her Would go of an inch His
right to just lay flat that gentle voice as clearly asked each other
Whatever he thought It
$ factor-vm -i=cust.img asemica.factor -m dec \
  -c metamorphosis.txt -i enc.txt
Pwagu hupata pwaguzi
```

## Appendix

* The entire code is available on [GitHub][10].
* As described in the `README` of the GitHub project generating an 
  [image][13] and passing it as an argument to the factor VM can
  significantly improve runtimes.
* The choice of document key can lead to shorter ciphertexts with a 
  longer text generally being better and some texts being completely 
  unsuitable for use as a key.
* A very good introduction to Factor is available [here][11].
* [This][12] article describes some of the reasons why concatenative 
  programming is useful.
* Factor has a lot of libraries so browsing the documentation can usually
  help you find what you want.
* On Linux `Alt-+` increases the font size for the help browser and
  running `"Iosevka Custom" 25 set-listener-font` sets the font and its 
  size for the listener.


[^1]: The bytes represent the value of a particular character in ASCII
      although Unicode should work as well by changing how decoding is
      done.
[^2]: The types for tuple slots are entirely optional but are useful for
      documentation.
[^3]: A combinator is a word (function) that takes code as input usually
      in the form of a quotation which is an anonymous function.
[^4]: The first sequence is all the tokens and the second tokens is 
      the same sequence without the first element.
[^5]: This would work for any tuple with a slot called `meaningful` not
      just our `transition` tuple.

[1]: https://en.wikipedia.org/wiki/Markov_chain
[2]: https://danne.stayskal.com/
[3]: https://github.com/linenoise/asemica
[4]: https://isbnsearch.org/isbn/9781491954324
[5]: http://factorcode.org
[6]: https://docs.factorcode.org/content/article-listener.html
[7]: https://docs.factorcode.org/content/article-tuple-examples.html
[8]: https://www.gutenberg.org/
[9]: https://docs.factorcode.org/content/article-locals-examples.html 
[10]: https://github.com/julius383/asemica-factor
[11]: https://andreaferretti.github.io/factor-tutorial/
[12]: https://evincarofautumn.blogspot.com/2012/02/why-concatenative-programming-matters.html
[13]: https://docs.factorcode.org/content/article-images.html
