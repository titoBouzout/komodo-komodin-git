Adds Git commands and icons overlay to "Komodo Edit" and enhance Git commands on "Komodo IDE".

http://community.activestate.com/komodo

<img src="http://dl.dropbox.com/u/9303546/komodo/kGit/screenshot.png" style="float:right"/>

Usage:

<blockquote>
Right click on "multiple/single" "files/folders" of the "places" sidebar to apply commands on selected files which maybe are from different repositories.

To apply commands to focused document use the toolbarbutton, or there is also a git submenu on document and tab context menu.

</blockquote><br/>

Available commands:
<pre>
Add & Commit
  o git add -- "/selected/paths/files/or/and/folders"
  o git commit -m "promptMessage" -- "/selected/paths/files/or/and/folders"
Add & Commit & Push
  o git add -- "/selected/paths/files/or/and/folders"
  o git commit -m "promptMessage" -- "/selected/paths/files/or/and/folders" 
  o git push

Commit
  o git commit -m "promptMessage" -- "/selected/paths/files/or/and/folders"
Commit Undo
  o git reset --soft HEAD^

Commit Amend
  o git commit --amend -C HEAD -- "/selected/paths/files/or/and/folders"
Commit All
  o git commit -a -m "promptMessage"

Status
  o git status --untracked-files=all -- "/selected/paths/files/or/and/folders"

Diff Since Last Commit
  o git diff HEAD -- "/selected/paths/files/or/and/folders"
  
	Diff betwen the latest tag and last commit
	  o git diff "lastTag"... -- "/selected/paths/files/or/and/folders"
	Diff betwen the latest push and last commit
	  o git diff origin... -- "/selected/paths/files/or/and/folders"
	Diff betwen the two latest tags
	  o git diff "prevToLastTag".."lastTag" -- "/selected/paths/files/or/and/folders"

Log stat last 30
  o git log -n 30 --stat --graph -- "/selected/paths/files/or/and/folders"
  
	Log stat full
	  o git log --stat --graph -- "/selected/paths/files/or/and/folders"
	Log extended last 30
	  o git log -n 30 -p -- "/selected/paths/files/or/and/folders"
	Log extended full
	  o git log -p -- "/selected/paths/files/or/and/folders"
	Log since last tag
	  o git log "lastTag"... --stat --graph --  "/selected/paths/files/or/and/folders"
	Log since last push
	  o git log origin... --stat --graph -- "/selected/paths/files/or/and/folders"
	Log between the two latest tags
	  o git log "prevToLastTag".."lastTag" --stat --graph -- "/selected/paths/files/or/and/folders"

Blame
  o git blame -- "/selected/paths/files/NOT/folders"

Auto-Tag
  o git tag "YYMMDD.Version"
  
	Tag Add
	  o git tag "promptMessage"
	Tag Remove
	  o git tag -d "promptMessage"
	Tag List
	  o git tag -l

Revert Discard changes to tracked
  o git checkout HEAD -- "/selected/paths/files/or/and/folders"
  
	Revert Discard changes to tracked, clean untracked
	  o git checkout HEAD -- "/selected/paths/files/or/and/folders"
	  o git clean -f -d -- "/selected/paths/files/or/and/folders"
	Revert Discard changes to tracked, clean untracked, unstage
	  o git checkout HEAD -- "/selected/paths/files/or/and/folders"
	  o git clean -f -d -- "/selected/paths/files/or/and/folders"
	  o git reset HEAD -- "/selected/paths/files/or/and/folders"
	Revert Discard changes to tracked, unstage, clean untracked
	  o git checkout HEAD -- "/selected/paths/files/or/and/folders"
	  o git reset HEAD -- "/selected/paths/files/or/and/folders"
	  o git clean -f -d -- "/selected/paths/files/or/and/folders"
	Revert Unstage
	  o git reset HEAD -- "/selected/paths/files/or/and/folders"

Checkout to
  o git checkout promptMessage -- "/selected/paths/files/or/and/folders"
Checkout repo to
  o cd repoPath
  o git checkout promptMessage

Push
  o git push
  
	Push, Push Tags
	  o git push && git push --tags 
	Push Tags
	  o git push --tags 
	Push with options…
	  o promptMessage
	
	Pull
	  o git pull
	Pull with options…
	  o promptMessage
	
	Fetch
	  o git fetch
	Fetch with options…
	  o promptMessage 
	
	Remote add
	  o git remote add promptMessage
	Configure default remote
	  o git config branch.promptBranch.remote promptRemoteName

Clone
  o git clone promptMessage ./
Init
  o git init

Add
  o git add -- "/selected/paths/files/or/and/folders"
Remove
  o git rm -r -f -- "/selected/paths/files/or/and/folders"
Remove Keep Local
  o git rm -r --cached -- "/selected/paths/files/or/and/folders"

Open Git Ignore
Add to Git Ignore

Git GUI
Gitk
Liberal Git Command
</pre>

Internals:
<blockquote>
To execute a Git command this add-on creates temporal shell scripts. On my fedora installation these are under /tmp/kGit/kGit-[1-n].sh

The add-on runs the scripts asynchronously /bin/sh "/tmp/kGit/kGit-[1-n].sh".

The output is redirected to "/tmp/kGit/kGit-[1-n].diff" and "on command complete" the file is opened in a new komodo tab, which shows the output with pretty colors.
</blockquote><br/>

License:<br/>
GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

Home-page:<br/>
http://community.activestate.com/xpi/komodin-git-places

Todo & know bugs:<br/>
https://github.com/titoBouzout/komodo-komodin-git/blob/master/todo.txt

Source-Code:<br/>
https://github.com/titoBouzout/komodo-komodin-git

All versions Changes:<br/>
https://github.com/titoBouzout/komodo-komodin-git/blob/master/changes.html

Changes From Latest Version:

<ul>
  

  <li>
	<b>1.110425.10</b> - http://community.activestate.com/files/kGit_7.xpi
	<ul>
	  <li>Fix:
	  <ul>
		<li>MD5 values differ betwen javascript and python.
		<li>Adds a python component to properly hook the places sidebar in order to provide icons. /The manual hacks to places extension is no longer needed./
		<li>Empty temporal folder on application quit. not window unload.
		<li>Restart the application after setting up the "git installation path".
	  </ul>
	  <li>Improves:
	  <ul>
		<li>Improves a lot diff and log commands by adding many options.
		<li>Adds tags tools (auto tag, add tag, remove tag, tag list)
		<li>Adds a "loading" icon for commands that take time
		<li>Improves messages on "prompts" and "confirms" by adding contextual information.
		<li>Commit window is no longer modal
		<li>Prevents multiples runs of updateIcons at same time.
		<li>Cache the scan of repositories on current places and cleanup the cache every X minutes.
		<li>Prevents scanning to deep directories by setting a timeout and killing the process
		<li>Instant update to icons on some commands.
	  </ul>
	</ul>
  </li>
  
  <li>
	<b>1.110421.9</b> - http://community.activestate.com/files/kGit_6.xpi
	<ul>
	  <li>Fix:
	  <ul>
		<li>Directories with special characters now show icons properly
	  </ul>
	  <li>Improves:
	  <ul>
		<li>Show icons for all the repositories under the current places sidebar
		<li>Renames icons to short CSS size.
	  </ul>
	</ul>
  </li>

</ul>