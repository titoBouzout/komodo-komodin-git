Komodo Edit "Places" Git Extension ( aka "Komodin" )
=============

Use this extension on Linux to add Git commands to Komodo Edit

Requirements
------------

I'm new to Linux, git, Komodo and Komodo extensions. There is some limitations..

### Commands

To execute a command this add-on creates temporal shell scripts.
On my fedora installation these are under /tmp/kGit/kGit-[1-n].sh

The script runs asynchronously /bin/sh "/tmp/kGit/kGit-[1-n].sh"
to execute the commands saved.

The output is redirected to "/tmp/kGit/kGit-[1-n].diff" and
"on command complete" the file is opened in a new komodo tab, which shows
the output with pretty colours.

### Usage

Rigth click on multiple/single files/folders of the "places" sidebar.

Select from the the git submenu a command...

Available commands:

+ Add & Commit
 - git add "/selected/paths/files/or/and/folders"
 - git commit "/selected/paths/files/or/and/folders" -m "a message"
+ Add & Commit & Push
 - git add "/selected/paths/files/or/and/folders"
 - git commit "/selected/paths/files/or/and/folders" -m "a message"
 - git push

+ Commit
 - git commit "/selected/paths/files/or/and/folders" -m "a message"
 
+ Diff
 - git diff "/selected/paths/files/or/and/folders"
+ Log
 - git diff "/selected/paths/files/or/and/folders"
+ Status
 - git status "/selected/paths/files/or/and/folders"
 
+ Revert
 - git checkout -- "/selected/paths/files/or/and/folders"
+ Revert & Clean
 - git checkout -- "/selected/paths/files/or/and/folders"
 - git clean "/selected/paths/files/or/and/folders" -f -d
+ Revert to object
  - git revert promptMessage
  
+ Push
 - git push
+ Pull
 - git pull
 
+ Checkout to
  - git checkout promptMessage

+ Clone
 - git clone promptMessage
 
+ Init
 - git init
 
 
### License

 GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007