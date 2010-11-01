Use this extension on Linux or Mac to add Git commands to Komodo.

Usage:

<blockquote>
Right click on multiple/single files/folders of the "places" sidebar to apply commands on selected files.

To apply commands to focused document use the toolbarbutton. There is also a git submenu on document and tab context menu.

</blockquote><br/>

Available commands:
<pre>
Add & Commit
  o git add "/selected/paths/files/or/and/folders"
  o git commit "/selected/paths/files/or/and/folders" -m "promptMessage"
Add & Commit & Push
  o git add "/selected/paths/files/or/and/folders"
  o git commit "/selected/paths/files/or/and/folders" -m "promptMessage"
  o git push

Commit
  o git commit "/selected/paths/files/or/and/folders" -m "promptMessage"
Commit Amend
  o git commit "/selected/paths/files/or/and/folders" --amend -C HEAD
  
Commit All
  o git commit -a -m "promptMessage"
  
Diff
  o git diff "/selected/paths/files/or/and/folders"
Status
  o git status "/selected/paths/files/or/and/folders"

Log
  o git log --stat --graph --date-order "/selected/paths/files/or/and/folders"   
Log ( Extended )
  o git log -p "/selected/paths/files/or/and/folders"
Blame
  o git blame "/selected/paths/files/NOT/folders"

Revert
  o git checkout -- "/selected/paths/files/or/and/folders"
Revert & Clean
  o git checkout -- "/selected/paths/files/or/and/folders"
  o git clean "/selected/paths/files/or/and/folders" -f -d

Revert to object
  o git revert promptMessage
Checkout to object
  o git checkout promptMessage

Push
  o git push
Pull
  o git pull

Add
  o git add "/selected/paths/files/or/and/folders"
Remove
  o git rm "/selected/paths/files/or/and/folders"
  
Init
  o git init
Clone
  o git clone promptMessage

Add to Git Ignore
Open Git Ignore

Liberal Git Command
</pre>

Internals:
<blockquote>
To execute a Git command this add-on creates temporal shell scripts. On my fedora installation these are under /tmp/kGit/kGit-[1-n].sh

The add-on runs the scripts asynchronously /bin/sh "/tmp/kGit/kGit-[1-n].sh".

The output is redirected to "/tmp/kGit/kGit-[1-n].diff" and "on command complete" the file is opened in a new komodo tab, which shows the output with pretty colours.
</blockquote><br/>

License:<br/>
GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

Todo:<br/>
http://github.com/titoBouzout/komodin--Komodo-Edit-Git-/blob/master/todo.txt

Know Bugs:<br/>
A commit is sent for each selected file. It should do: one commit for all selected files for each repository. <em>(Places tree can have opened many folders of more than one repository.)
</em>

Source-Code:<br/>
http://github.com/titoBouzout/komodin--Komodo-Edit-Git-

All versions Changes:<br/>
http://github.com/titoBouzout/komodin--Komodo-Edit-Git-/blob/master/changes.html

Current Version Changes:

<ul>
<li>
<b>1.101029.3</b> - http://community.activestate.com/files/kGit_2.xpi
<ul>
<li>Fixes:
<ul>
<li>Escape \ character on messages and file names.
<li>Add spellchecker to commit message.
<li>Ask for confirmation on pull and remove.
<li>Move Git menu to relevant position.
</ul>
<li>Improves:
<ul>
<li>Adds support for Komodo IDE
<li>When .gitignore file is not found ask the user to create one.
<li>"Nothing to show" messages more integrated (to statusbar)
<li>More messages sent to the "command output".
<li>Adds "Commit All", "Amend to last commit", "Add files", "Remove files"
<li>Git menu is added to: tab context menu, File menu, document context menu
</ul>
</ul>
</li>
</ul>