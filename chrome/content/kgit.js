
function kGit()
{
	this.rootButton = false;
	
	//runs a shell script
    this.run = function(aScriptPath, aOutputPath, openInNewTab, displayIntoNotificationBox)
    {
		//if *nix
		if(this.__DS == '/')
		{
		  var process =  this.runSvc.RunAndNotify(
											'sh '+this.escape(aScriptPath)+'',
											'/bin',
											'',
											'');
		}
		else
		{
		  if(!this.gitPathSet)
			this.initExtension();
			
		  //if windows
		  var process =  this.runSvc.RunAndNotify(
											'bash.exe --login "'+this.escape(aScriptPath)+'"',
											this.gitPath+'\\bin\\',
											'',
											'');
		}
		var retval = process.wait(-1);

		if(displayIntoNotificationBox)
		{
		  if(this.fileRead(aOutputPath) != '')
			this.notification(this.fileRead(aOutputPath));
		  else
			ko.statusBar.AddMessage('kGit: Nothing to show', "kgit", 7 * 1000, true);
		}
		else if(openInNewTab)
		{
		  if(this.fileRead(aOutputPath) != '')
			this.openURL(aOutputPath, true);
		  else
			ko.statusBar.AddMessage('kGit: Nothing to show', "kgit", 7 * 1000, true);
		}
		else
		{
		  if(this.fileRead(aOutputPath) != '')
			this.commandOutput(this.fileRead(aOutputPath));
		  else
			ko.statusBar.AddMessage('kGit: Nothing to show', "kgit", 7 * 1000, true);
		}
		var stderr = process.getStderr();
		if(stderr && stderr != '')
		  this.alert('Error:\n'+stderr);
    }
	//executes a shell script in a window ( allows user iteraction )
	this.execute = function(aScriptPath, aOutputPath)
	{
	  var file = Components.classes["@mozilla.org/file/local;1"]
				  .createInstance(Components.interfaces.nsILocalFile);
	  
	  if(this.__DS == '/')
	  {
		file.initWithPath("/");
		file.append("bin");
		file.append("sh");
		
		var argv = [aScriptPath];
	  }
	  else
	  {
		if(!this.gitPathSet)
		  this.initExtension();
		//if windows
		file.initWithPath(this.gitPath);
		file.append("bin");
		file.append("bash.exe");
		
		var argv = ['--login', aScriptPath];
	  }

	  var process = Components.classes["@mozilla.org/process/util;1"]
				   .createInstance(Components.interfaces.nsIProcess2);
		  process.init(file);
		   
		  process.runAsync(argv, argv.length, {observe: function(aSubject, aTopic, aData){ if(!aOutputPath) {}else { kgit.notification(kgit.fileRead(aOutputPath)); }}}, false);
	}

	//detects when the user right click the placesRootButton
	this.placesPopupShown = function(event)
	{
	  if(event.currentTarget == event.originalTarget)
	  {
		if(ko.places.manager._clickedOnRoot())
		  this.rootButton = true;
		else
		  this.rootButton = false;
	  }
	  return true;
	}
	//returns selected URIs
	  //from focused document (if the event comes from the toolbarbutton ) or
	  //from focused files and/or folders of the places sidebar
	  //places root folder if no selection on the places sidebar
	  //places root folder if right click on "placesRootButton"
	  //asumes document unless noted different with target attribute of parent parent
    this.getSelectedPaths = function(event)
    {
	  if(
		 event &&
		 event.originalTarget.parentNode &&
		 event.originalTarget.parentNode.parentNode &&
		 event.originalTarget.parentNode.parentNode.hasAttribute('target') &&
		 event.originalTarget.parentNode.parentNode.getAttribute('target') == 'places')
	  {
		  var selected = gPlacesViewMgr.getSelectedURIs();

		  if(!this.rootButton && selected && selected.length && selected.length > 0)
		  {
			for(var id in selected)
			  selected[id] = this.filePathFromFileURI(selected[id]);
		  }
		  else if(ko.places && ko.places.manager && ko.places.manager.currentPlace &&  ko.places.manager.currentPlace != '')
		  {
			selected = [];
			selected[0] = this.filePathFromFileURI(String(ko.places.manager.currentPlace));
		  }
		  else
		  {
			this.error('no path found');
		  }
	  }
	  else
	  {
		var selected = [];
			selected[0] = this.filePathFromFileURI(this.documentFocusedGetLocation());
	  }
	  return selected;
    }
	this.getPlacesPath = function()
	{
	  return this.filePathFromFileURI(String(ko.places.manager.currentPlace))
	}
    this.getSelectedPathFolder = function(event)
    {
      var selected = this.getSelectedPaths(event)[0];
        if(this.fileIsFolder(selected)){}
        else
            selected = this.fileDirname(selected);
      return selected;
    }
	this.getPaths = function(aFile, noTemp)
	{
	  	  //alert('aFile:'+aFile);
	
	  var obj = {};
	  
	  if(!noTemp)
	  {

		  obj.sh = this.fileCreateTemporal('kGit.sh');
		  //alert('sh:'+obj.sh);
		  
		  obj.outputFile = this.fileCreateTemporal('kGit.diff');
		  //alert('outputFile:'+obj.outputFile);
	  }
		  obj.git = this.getGitRoot(aFile);
		  //alert('git:'+obj.git);
		  
		  obj.cwd = ' "'+this.escape(this.pathToNix(obj.git))+'" ';
		  //alert('cwd:'+obj.cwd);
	  if(!noTemp)
	  {
		  obj.output = ' "'+this.escape(this.pathToNix(obj.outputFile))+'" ';
		  //alert('output:'+obj.output);
	  }
		  obj.selected = this.getPathRelativeToGit(aFile);
		  //alert('selected:'+obj.selected);
		  
		  obj.cwdSelected = aFile;
		  if(this.fileIsFolder(obj.cwdSelected))
			obj.cwdSelected = ' "'+this.escape(this.pathToNix(obj.cwdSelected))+'" ';
		  else
			obj.cwdSelected = ' "'+this.escape(this.pathToNix(this.fileDirname(obj.cwdSelected)))+'" ';
		  //alert('cwdSelected:'+obj.cwdSelected);
			
		  obj.selectedFile = aFile;
		  //alert('selectedFile:'+obj.selectedFile);
		  if(obj.selected == '')
			 obj.selected = '';
		  else
			 obj.selected = ' "'+this.escape(this.pathToNix(obj.selected))+'" ';

		  if(obj.selected == '')
			 obj.selectedRecursive = ' . ';
		  else
		  {
			if(this.fileIsFolder(aFile))
			  obj.selectedRecursive = ' "'+this.escape(this.pathToNix(this.getPathRelativeToGit(aFile)))+'*" ';
			else
			  obj.selectedRecursive = ' "'+this.escape(this.pathToNix(this.getPathRelativeToGit(aFile)))+'" ';
		  }
		  //alert('selected:'+obj.selected);
		  
		  return obj;
	}
    this.diff = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
				  
		this.fileWrite(obj.sh, 'cd '+obj.cwd+'\ngit diff '+obj.selected+' > '+obj.output+'\n');
		this.run(obj.sh, obj.outputFile, true);
	  }
    }
    this.log = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		  
		this.fileWrite(obj.sh, 'cd '+obj.cwd+' \n echo "log:'+this.escape(this.pathToNix(obj.selectedFile))+'" >> '+obj.output+' \n git log --stat --graph --date-order '+ obj.selected+' >> '+obj.output+' \n');
		  
		this.run(obj.sh, obj.outputFile, true);
	  }
    }
	this.logExtended = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		  
		this.fileWrite(obj.sh, 'cd '+obj.cwd+' \n echo "log:'+this.escape(this.pathToNix(obj.selectedFile))+'" >> '+obj.output+' \n git log -n 30 -p '+ obj.selected+' >> '+obj.output+' \n');
		  
		this.run(obj.sh, obj.outputFile, true);
	  }
    }
	this.logFull = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		  
		this.fileWrite(obj.sh, 'cd '+obj.cwd+' \n echo "log:'+this.escape(this.pathToNix(obj.selectedFile))+'" >> '+obj.output+' \n git log -p '+ obj.selected+' >> '+obj.output+' \n');
		  
		this.run(obj.sh, obj.outputFile, true);
	  }
    }
    this.status = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		  
		this.fileWrite(obj.sh, 'cd '+obj.cwd+' \n echo "status:'+this.escape(this.pathToNix(obj.selectedFile))+'" >> '+obj.output+' \n git status --untracked-files=all '+ obj.selected+' >> '+obj.output+' \n');
		  
		this.run(obj.sh, obj.outputFile, true);
	  }
    }
	this.blame = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  for(var id in selected)
	  {
		if(!this.fileIsFolder(selected[id]))
		{
		  var obj = this.getPaths(selected[id]);
		
		  this.fileWrite(obj.sh, 'cd '+obj.cwd+' \n echo "blame:'+this.escape(this.pathToNix(obj.selectedFile))+'" >> '+obj.output+' \n git blame '+ obj.selected+' >> '+obj.output+' \n');
			
		  this.run(obj.sh, obj.outputFile, true);
		}
	  }
    }
    this.revertClean = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
        var selected = this.getSelectedPaths(event);
		var commands = '';
		
        for(var id in selected)
        {    
		  var obj = this.getPaths(selected[id]);
			  
		  commands += 'cd '+obj.cwd+' ';
		  commands += '\n';
		  commands += 'git checkout -- '+ obj.selected+' >>'+obj.output+' 2>&1';
		  commands += '\n';
		  commands += 'git clean '+ obj.selected+' -f -d >>'+obj.output+' 2>&1';
		  commands += '\n';
        }
		commands += '\n';
		
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
    this.revert = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
        var selected = this.getSelectedPaths(event);
		var commands = '';
		
        for(var id in selected)
        {
		  var obj = this.getPaths(selected[id]);
			  
		  commands += 'cd '+obj.cwd+' ';
		  commands += '\n';
		  commands += 'git checkout -- '+ obj.selected+' >>'+obj.output+' 2>&1';
		  commands += '\n';
        }
		commands += '\n';
		
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
    this.revertToObject = function(event)
    {
        var aMsg = this.prompt('Revert to object…');
        if(aMsg != '')
        {
		  if(this.confirm('Are you sure?'))
		  {
			var selected = this.getSelectedPathFolder(event);
			var obj = this.getPaths(selected);
			
			this.fileWrite(obj.sh, 'cd '+obj.cwd+' \ngit revert '+aMsg+' >>'+obj.output+' 2>&1 \n');
			
			this.run(obj.sh, obj.outputFile, false, true);
		  }
        }
    }
    this.checkoutToObject = function(event)
    {
        var aMsg = this.prompt('Checkout to object…');
        if(aMsg != '')
        {
		  if(this.confirm('Are you sure?'))
		  {
            var selected = this.getSelectedPathFolder(event);
            var obj = this.getPaths(selected);
            
            this.fileWrite(obj.sh, 'cd '+obj.cwd+' \ngit checkout '+aMsg+' >>'+obj.output+' 2>&1 \n ');
            
            this.run(obj.sh, obj.outputFile, false, true);
		  }
        }
    }
    this.checkoutFilesToObject = function(event)
    {
        var aMsg = this.prompt('Checkout files to object…');
        if(aMsg != '')
        {
		  if(this.confirm('Are you sure?'))
		  {
			var selected = this.getSelectedPaths(event);
			var commands = '';
			
			for(var id in selected)
			{
			  var obj = this.getPaths(selected[id]);
				  
			  commands += 'cd '+obj.cwd+' \ngit checkout '+aMsg+' '+obj.selected+' >>'+obj.output+' 2>&1 \n ';
			}
			this.fileWrite(obj.sh, commands);
            
            this.run(obj.sh, obj.outputFile, false, true);
		  }
        }
    }

    this.push = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  var commands = '';
	  var repositories = [];
	  
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		if(!repositories[obj.cwd])
		  repositories[obj.cwd] = [];
		repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
	  }
	  
	  for(var id in repositories)
	  {
		commands += 'cd '+id+'';
		commands += '\n';
		commands += 'git push >>'+obj.output+' 2>&1';
		commands += '\n';
	  }

	  this.fileWrite(obj.sh, commands);
	  
	  this.execute(obj.sh, obj.outputFile);
    }

    this.init = function(event)
    {
	  var selected = this.getSelectedPathFolder(event);
	  var obj = this.getPaths(selected);
		
	  this.fileWrite(obj.sh, 'cd '+obj.cwdSelected+' \ngit init >>'+obj.output+' 2>&1');
	  
	  this.run(obj.sh, obj.outputFile, false, true);
    }
    this.clone = function(event)
    {
	  var aMsg = this.prompt('Enter URL to clone…');
	  if(aMsg != '')
	  {
		aMsg = aMsg.replace(/^ ?git clone /, '');
		var selected = this.getSelectedPathFolder(event);
		var obj = this.getPaths(selected);
		
		this.fileWrite(obj.sh, 'cd '+obj.cwdSelected+' \ngit clone '+aMsg+' >>'+obj.output+' 2>&1');
		
		this.execute(obj.sh, obj.outputFile);
	  }
    }

    this.pull = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
        var selected = this.getSelectedPathFolder(event);
		var obj = this.getPaths(selected);
        
        this.fileWrite(obj.sh, 'cd '+obj.cwd+' \ngit pull >>'+obj.output+' 2>&1 \n ');
        
        this.execute(obj.sh, obj.outputFile);
	  }
	}
	
	//free input command
    this.command = function(event)
    {
	  var selected = this.getSelectedPathFolder(event);
	  var obj = this.getPaths(selected);
	  
	  var aMsg = this.prompt('[komodin@komodo '+obj.cwdSelected+'] $ ', 'git ');
	  if(aMsg != '')
	  {
		this.fileWrite(obj.sh, 'cd '+obj.cwdSelected+' \n'+aMsg+' >>'+obj.output+' 2>&1');
		
		this.execute(obj.sh, obj.outputFile);
	  }
    }
	this.commit = function(event)
    {
	  var aMsg = this.prompt('Enter a commit message…', '', true);
	  if(aMsg != '')
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git commit '+repositories[id].join(' ')+' -m "'+this.escape(aMsg)+'" >>'+obj.output+' 2>&1';
		  commands += '\n';
		}

		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
    this.commitAll = function(event)
    {
	  var aMsg = this.prompt('Enter a commit message…', '', true);
	  if(aMsg != '')
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git commit -a -m "'+this.escape(aMsg)+'" >>'+obj.output+' 2>&1';
		  commands += '\n';
		}

		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
	this.commitAmend = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  var commands = '';
	  var repositories = [];
	  
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		if(!repositories[obj.cwd])
		  repositories[obj.cwd] = [];
		repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
	  }
	  
	  for(var id in repositories)
	  {
		commands += 'cd '+id+'';
		commands += '\n';
		commands += 'git commit '+repositories[id].join(' ')+' --amend -C HEAD >>'+obj.output+' 2>&1';
		commands += '\n';
	  }

	  this.fileWrite(obj.sh, commands);
	  
	  this.run(obj.sh, obj.outputFile, false, true);
    }
	this.undoLastCommit = function(event)
	{
	  if(this.confirm('Are you sure?'))
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git reset --soft HEAD^ >>'+obj.output+' 2>&1';
		  commands += '\n';
		}
  
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
	}
    this.addCommit = function(event)
    {
	  var aMsg = this.prompt('Enter a commit message…', '', true);
	  if(aMsg != '')
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selectedRecursive;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git add '+repositories[id].join(' ')+' >>'+obj.output+' 2>&1';
		  commands += '\n';
		  commands += 'git commit '+repositories[id].join(' ')+' -m "'+this.escape(aMsg)+'" >>'+obj.output+' 2>&1';
		  commands += '\n';
		}
  
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
    
    this.addCommitPush = function(event)
    {
	  var aMsg = this.prompt('Enter a commit message…', '', true);
	  if(aMsg != '')
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selectedRecursive;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git add '+repositories[id].join(' ')+' >>'+obj.output+' 2>&1';
		  commands += '\n';
		  commands += 'git commit '+repositories[id].join(' ')+' -m "'+this.escape(aMsg)+'" >>'+obj.output+' 2>&1';
		  commands += '\n';
		  commands += 'git push >>'+obj.output+' 2>&1';
		  commands += '\n';
		}
  
		this.fileWrite(obj.sh, commands);
		
		this.execute(obj.sh, obj.outputFile);
	  }
    }
	this.add = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  var commands = '';
	  var repositories = [];
	  
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);
		if(!repositories[obj.cwd])
		  repositories[obj.cwd] = [];
		repositories[obj.cwd][repositories[obj.cwd].length] = obj.selectedRecursive;
	  }
	  
	  for(var id in repositories)
	  {
		commands += 'cd '+id+'';
		commands += '\n';
		commands += 'git add '+repositories[id].join(' ')+' >>'+obj.output+' 2>&1';
		commands += '\n';
	  }

	  this.fileWrite(obj.sh, commands);
	  
	  this.run(obj.sh, obj.outputFile, false, true);
    }
	this.removeKeepLocal = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git rm -r --cached '+repositories[id].join(' ')+' >>'+obj.output+' 2>&1';
		  commands += '\n';
		}
  
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
	this.remove = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
		var selected = this.getSelectedPaths(event);
		var commands = '';
		var repositories = [];
		
		for(var id in selected)
		{
		  var obj = this.getPaths(selected[id]);
		  if(!repositories[obj.cwd])
			repositories[obj.cwd] = [];
		  repositories[obj.cwd][repositories[obj.cwd].length] = obj.selected;
		}
		
		for(var id in repositories)
		{
		  commands += 'cd '+id+'';
		  commands += '\n';
		  commands += 'git rm -r -f '+repositories[id].join(' ')+' >>'+obj.output+' 2>&1';
		  commands += '\n';
		}
  
		this.fileWrite(obj.sh, commands);
		
		this.run(obj.sh, obj.outputFile, false, true);
	  }
    }
	this.ignoreOpen = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  var aPath;
	  
	  for(var id in selected)
	  {
		aPath = selected[id];

		while(!this.fileExists(aPath+this.__DS+'.git'+this.__DS))
		{

		  if(this.fileExists(aPath+this.__DS+'.gitignore'))
			break;
		  if(this.fileDirname(aPath) == aPath)
			break;
		  aPath = this.fileDirname(aPath);
		}
		if(this.fileExists(aPath+this.__DS+'.gitignore'))
		{
		  this.openURL(aPath+this.__DS+'.gitignore', true);
		}
		else
		{
		  if(this.confirm('.gitignore file was not found. Do you want to create one?'))
		  {
			this.fileWrite(aPath+this.__DS+'.gitignore', '\n');
		  	this.openURL(aPath+this.__DS+'.gitignore', true);
		  }
		}
	  }
	}
	//adds selected files to gitignore on close parent gitignore.
	this.ignore = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  
	  for(var id in selected)
	  {
		if(this.fileIsFolder(selected[id]))
		  aPath = this.fileDirname(selected[id]);
		else
		  aPath = selected[id];
		  
		while(!this.fileExists(aPath+this.__DS+'.git'+this.__DS))
		{
		  if(this.fileExists(aPath+this.__DS+'.gitignore'))
			break;
		  if(this.fileDirname(aPath) == aPath)
			break;
		  aPath = this.fileDirname(aPath);
		}
		
		if(this.fileExists(aPath+this.__DS+'.gitignore'))
		{
		  var ignore = this.fileRead(aPath+this.__DS+'.gitignore');
			  ignore += '\n';
			  if(this.fileIsFolder(selected[id]))
				ignore += selected[id].replace(aPath+this.__DS, '')+this.__DS;
			  else
				 ignore += selected[id].replace(aPath+this.__DS, '');
			  ignore = this.arrayUnique(ignore.split('\n')).sort(this.sortLocale).join('\n');
		}
		else
		{
		  if(this.fileIsFolder(selected[id]))
			var ignore = selected[id].replace(this.getGitRoot(aPath)+this.__DS, '')+this.__DS;
		  else
			var ignore = selected[id].replace(this.getGitRoot(aPath)+this.__DS, '');
		}
		ignore += '\n';

		this.fileWrite(aPath+this.__DS+'.gitignore', ignore);
		this.openURL(aPath+this.__DS+'.gitignore', true);
	  }
	}
	this.getGitRoot = function(aPath)
	{
	  while(!this.fileExists(aPath+this.__DS+'.git'+this.__DS))
	  {
		if(this.fileDirname(aPath) == aPath)
		  break;
		aPath = this.fileDirname(aPath);
		if(this.fileExists(aPath+this.__DS+'.git'+this.__DS))
		  break;
	  }
	  if(this.fileExists(aPath+this.__DS+'.git'+this.__DS))
		return aPath;
	  else
		return '';
	}
	this.getPathRelativeToGit = function(aPath)
	{
	  var dir = aPath.split(this.getGitRoot(aPath)+this.__DS);
		  dir.shift();
	  return dir.join('');
	}
	this.gitGUI = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  var commands = '';
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);

		commands += 'cd '+obj.cwdSelected+'';
		commands += '\n';
		commands += 'git gui';
		commands += '\n';
	  }

	  this.fileWrite(obj.sh, commands);
		  
	  this.execute(obj.sh);
	}
	this.gitK = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  var commands = '';
	  for(var id in selected)
	  {
		var obj = this.getPaths(selected[id]);

		commands += 'cd '+obj.cwdSelected+'';
		commands += '\n';
		commands += 'gitk';
		commands += '\n';
	  }

	  this.fileWrite(obj.sh, commands);
		  
	  this.execute(obj.sh);
	}
	this.openURL = function(aFilePath, newTab)
	{
	  if(newTab)
		ko.open.multipleURIs([aFilePath]);
	}
	//empty our temp folder when komodo is closed.
    this.emptyTemp = function()
    {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
						 .getService(Components.interfaces.nsIProperties)
						 .get("TmpD", Components.interfaces.nsIFile);
		//security - works always in a folder with with the name of this extension
		file.append('kGit');
		
		if( !file.exists() || !file.isDirectory() ) // if it doesn't exist..
		{
		  
		}
		else
		{
		  file.remove(true);
		}
	}

    this.iconsSet = function(obj, aString)
    {
		var file, hash, css = '', rootPath;
		
		/* ignored files */
		
		if(this.fileExists(obj.git+this.__DS+'.gitignore'))
		{
		  var ignored = this.fileRead(obj.git+this.__DS+'.gitignore');
		  if(ignored != '')
		  {
			//alert(ignored);
			  ignored = ignored.split('\n');
			  for(var id in ignored)
			  {
				ignored[id] = ignored[id].replace(/^\//, '');
				rootFile = obj.git+this.__DS;
				
				file = (ignored[id].split('/').join(this.__DS).split('\\').join(this.__DS)).trim().split(this.__DS);
				var files = [];
					files[files.length] = rootFile;
				for(var id in file)
				{
				  rootFile += file[id];
				  files[files.length] = rootFile;
				  rootFile += this.__DS;
				 // files[files.length] = rootFile;
				}
				for(var file in files)
				{
				  //alert(this.pathToNix(files[file]))
				  hash = 'k'+this.md5(this.pathToNix(files[file]))//.split(' ').join('_').split('/').join('_').split('\\').join('_').split(':').join('_').split('.').join('_');
				  //alert(this.pathToNix(file));
				  if(this.fileIsFolder(files[file]))
					css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/folder-closed_ignored.png") !important;}'.replace('__FILE__', hash)+'\n';
				  else
					css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/file_icon_ignored.png") !important;}'.replace('__FILE__', hash)+'\n';
				}
			  }
		  }
		}
	  
	  /* untrucked files */
	  
		if(aString.indexOf('Untracked files:') != -1)
		{
		  //alert(ignored);
			var untrucked = (aString.split('Untracked files:')[1]).split('# ');
				untrucked[0] = '';
				untrucked[1] = '';
			for(var id in untrucked)
			{
			 // alert(untrucked[id]);
			  if(untrucked[id] == '')
				continue;
				
			  untrucked[id] = untrucked[id].replace(/^\//, '');
			  rootFile = obj.git+this.__DS;
			  
			  
			  file = (untrucked[id].split('/').join(this.__DS).split('\\').join(this.__DS)).trim().split(this.__DS);
			  var files = [];
				  files[files.length] = rootFile;
			  for(var id in file)
			  {
				rootFile += file[id];
				files[files.length] = rootFile;
				rootFile += this.__DS;
			   // files[files.length] = rootFile;
			  }
			  for(var file in files)
			  {//alert(this.pathToNix(files[file]))
				hash = 'k'+this.md5(this.pathToNix(files[file]))
				//hash = files[file].split(' ').join('_').split('/').join('_').split('\\').join('_').split(':').join('_').split('.').join('_');
				//alert(this.pathToNix(file));
				if(this.fileIsFolder(files[file]))
				  css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/folder-closed_unversioned.png") !important;}'.replace('__FILE__', hash)+'\n';
				else
				  css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/file_icon_unversioned.png") !important;}'.replace('__FILE__', hash)+'\n';
			  }
			}
		}
	  
	  /* deleted files */
	  
		aString = aString.split('#');
		
		for(var id in aString)
		{
		  if(aString[id].indexOf('deleted: ') != -1)
		  {
			rootFile = obj.git+this.__DS;
			
			file = ((aString[id].split('deleted: ')[1]).split('/').join(this.__DS).split('\\').join(this.__DS)).trim().split(this.__DS);
			var files = [];
				files[files.length] = rootFile;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.__DS;
			  //files[files.length] = rootFile;
			}
			for(var file in files)
			{//alert(this.pathToNix(files[file]))
			  hash = 'k'+this.md5(this.pathToNix(files[file]))
			  //hash = files[file].split('/').join('_').split('\\').join('_').split(':').join('_').split('.').join('_');
			  //alert(this.pathToNix(file));
			  if(this.fileIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/folder-closed_deleted.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/file_icon_deleted.png") !important;}'.replace('__FILE__', hash)+'\n';
			}
		  }
		}
		
	  /* new files */
	  
		for(var id in aString)
		{
		  if(aString[id].indexOf('new file:') != -1)
		  {
			rootFile = obj.git+this.__DS;
			
			file = ((aString[id].split('new file: ')[1]).split('/').join(this.__DS).split('\\').join(this.__DS)).trim().split(this.__DS);
			var files = [];
				files[files.length] = rootFile;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.__DS;
			 // files[files.length] = rootFile;
			}
			for(var file in files)
			{//alert(this.pathToNix(files[file]))
			  hash = 'k'+this.md5(this.pathToNix(files[file]))
			  //hash = files[file].split('/').join('_').split('\\').join('_').split(':').join('_').split('.').join('_');
			  //alert(this.pathToNix(file));
			  if(this.fileIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/folder-closed_added.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/file_icon_added.png") !important;}'.replace('__FILE__', hash)+'\n';
			}
		  }
		}
	  
	  /* modified files */
	  
		for(var id in aString)
		{
		  if(aString[id].indexOf('modified: ') != -1)
		  {
			rootFile = obj.git+this.__DS;
			
			file = ((aString[id].split('modified: ')[1]).split('/').join(this.__DS).split('\\').join(this.__DS)).trim().split(this.__DS);
			var files = [];
				files[files.length] = rootFile;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.__DS;
			 // files[files.length] = rootFile;
			}
			for(var file in files)
			{//alert(this.pathToNix(files[file]))
			  hash = 'k'+this.md5(this.pathToNix(files[file]))
			  //hash = files[file].split('/').join('_').split('\\').join('_').split(':').join('_').split('.').join('_');
			  //alert(this.pathToNix(file));
			  if(this.fileIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/folder-closed_modified.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__) {  list-style-image : url("chrome://kgit/content/icons/file_icon_modified.png") !important;}'.replace('__FILE__', hash)+'\n';
			}
		  }
		}
		
		if(this.lastCSS == css)
		  return;
		
		this.lastCSS = css;
		
		//alert(css);
		this.fileWrite(obj.outputFile+'.css', this.arrayUnique(css.split('\n')).join('\n'));
		var uri = Components
					.classes["@mozilla.org/network/io-service;1"]
					.getService(Components.interfaces.nsIIOService)
					.newURI('file://'+obj.outputFile+'.css', null, null);
				
		var sss = Components
					  .classes["@mozilla.org/content/style-sheet-service;1"]
					  .getService(Components.interfaces.nsIStyleSheetService);
					  
		if(sss.sheetRegistered(uri, sss.AGENT_SHEET))
		  sss.unregisterSheet(uri, sss.AGENT_SHEET);
		sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
		
		setTimeout( function(){
		 // ko.places.viewMgr.tree.treeBoxObject.clearStyleAndImageCaches();
		  //ko.places.viewMgr.updateView();
		  gPlacesViewMgr.view.refreshFullTreeView();
		  //ko.places.projects.manager.refresh();
		}, 10);
		ko.places.viewMgr.tree.treeBoxObject.clearStyleAndImageCaches();
		//ko.places.viewMgr.updateView();
		//gPlacesViewMgr.view.refreshFullTreeView();
		//ko.places.projects.manager.refresh();
		/*
		  status:D:/www/extensiondevelopment.org/_em/kGit/chrome/icons/testing
		  # On branch master
		  # Changes to be committed:
		  #   (use "git reset HEAD <file>..." to unstage)
		  #
		  #	new file:   added
		  #	deleted:    deleted
		  #
		  # Changes not staged for commit:
		  #   (use "git add <file>..." to update what will be committed)
		  #   (use "git checkout -- <file>..." to discard changes in working directory)
		  #
		  #	modified:   .gitignore
		  #	modified:   modified
		  #
		  # Untracked files:
		  #   (use "git add <file>..." to include in what will be committed)
		  #
		  #	deleted
		  #	unversioned
		*/
	}

/* UTILS */

	this.documentFocusedGetLocation = function()
	{
	  return this.documentGetLocation(this.documentGetFocused());
	}
	this.documentGetFocused = function()
	{
	  var aDoc = this.documentGetFromTab(this.tabGetFocused());
	  if(aDoc)
		return aDoc;
	  else
		this.error('no document focused');
	}
	this.documentGetLocation = function(aDocument)
	{
	  if(aDocument.displayPath)
		return aDocument.displayPath;
	  else
		this.error('document has no location');
	}
	this.documentGetFromTab = function(aTab)
	{
	  if(aTab.document)
		return aTab.document;
	  else
		this.error('tab has no document');
	}
	this.tabGetFocused = function()
	{
	  if(ko.views.manager.currentView)
		return ko.views.manager.currentView;
	  else
		this.error('no tab focused');
	}
	//outputs text to the command output window
	//http://community.activestate.com/faq/how-do-you-write-command-output-window
	this.commandOutput = function(aString)
	{
		// First make sure the command output window is visible
        ko.run.output.show(window, false);
        // Second, make sure we're showing the output pane, not the error list pane.
        var deckWidget = document.getElementById("runoutput-deck");
        if (deckWidget.getAttribute("selectedIndex") != 0) {
            ko.run.output.toggleView();
        }
        // Now find out which newline sequence the window uses, and write the
        // text to it.
        var scimoz = document.getElementById("runoutput-scintilla").scimoz;
        var prevLength = scimoz.length;
        var currNL = ["\r\n", "\n", "\r"][scimoz.eOLMode];
        var full_str = aString + currNL;
        var full_str_byte_length = ko.stringutils.bytelength(full_str);
        var ro = scimoz.readOnly;
        try {
            scimoz.readOnly = false;
            scimoz.appendText(full_str_byte_length, full_str);
        } finally {
            scimoz.readOnly = ro;
        }
        // Bring the new text into view.
        scimoz.gotoPos(prevLength + 1);
	}

    //shows a custom prompt
	this.prompt = function(aString, aDefault, multiline)
	{
		if(!aDefault)
			aDefault = '';
		
		if(!multiline)
		{
		  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						  .getService(Components.interfaces.nsIPromptService);
  
		  var check = {value: false};                  // default the checkbox to false
  
		  var input = {value: aDefault};                  // default the edit field to Bob
  
		  var result = prompts.prompt(null, "kGit", aString, input, null, check);
		
		  if(result)
			  return this.string(input.value);
		  else
			  return '';
		}
		else
		{
		  var r = {};
			  r.title = "kGit";
			  r.label = aString;
			  
		  var win =  window.openDialog('chrome://kgit/content/dialog.xul',
										  null,
										  'chrome, dialog, modal, resizable=yes, centerscreen',
										  r);
		 
		  if(!r.value)
			var value = '';
		  else
			var value = r.value;
		  
		  win = null;
		  r = null;
		  
		  delete win;
		  delete r;
		
		  return value;
		}
	}
	//cast an object toString avoids null errors
	this.string = function(aString)
	{
		if(!aString)
			return '';
		else
			return aString.toString();
	};
	//shows a custom confirm
	this.confirm = function(aString)
	{
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
		return prompts.confirm(null, "kGit", aString);
	}
	//shows a custom alert
	this.alert = function(aString)
	{
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);

		prompts.alert(null, "kGit", aString);
	}
	this.notification = function(aString)
	{
	  if(!aString || aString=='')
		return;
		//the container
		var hbox = document.createElement('hbox');
			hbox.setAttribute('class', 'notification-inner outset');
			hbox.setAttribute('style', 'max-width:100% !important;width:100% !important;cursor:pointer');
			hbox.setAttribute('id', 'kGit-notification');
			hbox.setAttribute('onclick', 'this.parentNode.removeChild(this)');
		//the icon and the name of the extension
		var toolbarbutton = document.createElement('toolbarbutton');
			toolbarbutton.setAttribute('image', 'chrome://kgit/content/icon16.png');
			toolbarbutton.setAttribute('style', 'border:1px solid transparent !important;margin:2px !important;padding:0px !important;-moz-appearance: none;margin-left:6px !important;');
			hbox.appendChild(toolbarbutton);
				  
		//the messsage
		var description = document.createElement('description');
			description.appendChild(document.createTextNode('kGit : '+aString));
			description.setAttribute("wrap", 'true');
			description.setAttribute("style", 'white-space: pre-wrap;cursor:pointer');
			
		var msgContainer = document.createElement('vbox');
			msgContainer.setAttribute("flex", '1');
			msgContainer.setAttribute("style", 'padding-top:3px;cursor:pointer');
			msgContainer.appendChild(description)
		
			hbox.appendChild(msgContainer);
				
		//the close button
		var toolbarbutton = document.createElement('toolbarbutton');
			
			toolbarbutton.setAttribute('style', 'list-style-image: url(chrome://global/skin/icons/close.png);-moz-image-region: rect(0px, 14px, 14px, 0px);border:1px solid transparent !important;margin:4px !important;padding:0px !important;-moz-appearance: none;margin-left:6px !important;');
			toolbarbutton.setAttribute('default', 'true');
			toolbarbutton.setAttribute('tooltiptext', 'Close');
			toolbarbutton.setAttribute('oncommand', 'this.parentNode.parentNode.removeChild(this.parentNode)');
			
			hbox.appendChild(toolbarbutton);
		  
		  var element = document.getElementById('tabbed-view').firstChild.nextSibling;
			  element.parentNode.insertBefore(hbox,  element);
	}
	//creates a temporal file and returns the url of that file-REVIEW
	this.fileCreateTemporal = function(aName, aData)
	{
        if(!aData)
            aData = '';
		//WTF!!!!!!!!!!!!!!!!!!!!?
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
						 .getService(Components.interfaces.nsIProperties)
						 .get("TmpD", Components.interfaces.nsIFile);
		//security - works always in a folder with with the name of this extension
		file.append('kGit');
		if( !file.exists() || !file.isDirectory() )   // if it doesn't exist, create
		{
			file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
		}
		file.append(aName);
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0775);
		
		var WriteStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                            .createInstance(Components.interfaces.nsIFileOutputStream);
		// use 0x02 | 0x10 to open file for appending.
		WriteStream.init(file, 0x02 | 0x08 | 0x20, 0644, 0); // write, create, truncate
			
		var why_not_a_simple_fopen_fwrite = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                                .createInstance(Components.interfaces.nsIConverterOutputStream);
		
		why_not_a_simple_fopen_fwrite.init(WriteStream, "utf-8", 0, 0xFFFD); // U+FFFD = replacement character
		why_not_a_simple_fopen_fwrite.writeString(aData);
		why_not_a_simple_fopen_fwrite.close();
		WriteStream.close();
		
		var path =  file.path;
		
		return path;
	}
    //returns true if a file exists
	this.fileExists = function(aFilePath)
	{
	  try
	  {
	  var aFile = Components.classes["@mozilla.org/file/local;1"]
					  .createInstance(Components.interfaces.nsILocalFile);
		  aFile.initWithPath(aFilePath);

		  if(aFile.exists())
			  return true;
		  else
			  return false;
	  }
	  catch(e)
	  {
		return false;
	  }
    }
    //returns true if a path is a folder
	this.fileIsFolder = function(aFilePath)
	{
	  try
	  {
        var aFile = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
            aFile.initWithPath(aFilePath);

            if(aFile.exists() && aFile.isDirectory())
                return true;
            else
                return false;
	  }
	  catch(e)
	  {
		return false;
	  }
    }
	//returns the content of a file
	this.fileRead = function(aFilePath)
	{
        var aFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);	
            aFile.initWithPath(aFilePath);

        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
            converter.charset = "UTF-8"; /* The character encoding you want, using UTF-8 here */

        var is = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance( Components.interfaces.nsIFileInputStream );
            is.init(aFile, 0x01, 0444, 0); 
        
        var sis = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
            sis.init(is);
            
        var aData = converter.ConvertToUnicode(sis.read(sis.available()));
        
        is.close();
        sis.close();
        
        return aData;
	}
 	//writes content to a file
	this.fileWrite = function(aFilePath, aData)
	{
		try
		{
		  aData = String(aData);
		//write the content to the file
			var aFile = Components.classes["@mozilla.org/file/local;1"]
							.createInstance(Components.interfaces.nsILocalFile);
				aFile.initWithPath(aFilePath);
	
			var WriteStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			// use 0x02 | 0x10 to open file for appending.
			//WriteStream.init(aFile, 0x02 | 0x08 | 0x20, 0644, 0); // write, create, truncatefile,  
			WriteStream.init(aFile, 0x02 | 0x08 | 0x20, 0666, 0); // write, create, truncatefile,  
								
			var why_not_a_simple_fopen_fwrite = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
			
			why_not_a_simple_fopen_fwrite.init(WriteStream, "utf-8", 0, 0xFFFD); // U+FFFD = replacement character
			why_not_a_simple_fopen_fwrite.writeString(aData);
			
			why_not_a_simple_fopen_fwrite.close();
			WriteStream.close();
			var path = aFile.path;
			
			return path;
		}
		catch(e)
		{
			this.error('Can\'t write to the file "'+aFilePath+'"\nBrowser says: '+e);
		}
	}
 	//returns the dirname of a file
	this.fileDirname = function(aFilePath)
	{
	  try
	  {
		var aDestination = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
			aDestination.initWithPath(aFilePath);

		var dirname =  aDestination.parent.path;
		return dirname;
	  }
	  catch(e)
	  {
		if(this.fileIsFolder(aFilePath))
		  return aFilePath;
		else
		  this.error('not a folder');
	  }
	}
    //returns a file path from a file URI
	this.filePathFromFileURI = function(aURI)
	{
	  if(aURI.indexOf('file:') !== 0)
		return aURI;
	  if(!this.ios)
		this.ios = Components.classes["@mozilla.org/network/io-service;1"].  
						getService(Components.interfaces.nsIIOService);

	  return String(this.ios.newURI(aURI, null, null)
				  .QueryInterface(Components.interfaces.nsIFileURL).file.path);
	}
	this.escape = function(aString)
	{
	  return aString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	}
	this.pathToNix = function(aPath)
	{
	  return aPath.replace(/\\/g, '/');
	}
	//removes duplicate values from an array
	this.arrayUnique = function (anArray)
	{
		var tmp = [];
		for(var id in anArray)
		{
			if(!this.inArray(tmp, anArray[id]))
			{
				tmp[tmp.length] = anArray[id];
			}
		}
		return tmp;
	}
	//checks if a value exists in an array
	this.inArray = function (anArray, some)
	{
		for(var id in anArray)
		{
			if(anArray[id]==some)
				return true;
		}
		return false;
	}
	this.sortLocale = function(a, b)
	{
		return a.localeCompare(b);
	}
	this.md5 = function(aString)
	{
	  if(!this.converter)
		this.converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
		  createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
	  
	  // we use UTF-8 here, you can choose other encodings.
	  this.converter.charset = "UTF-8";
	  // result is an out parameter,
	  // result.value will contain the array length
	  var result = {};
	  // data is an array of bytes
	  var data = this.converter.convertToByteArray(aString, result);
	  if(!this.ch)
		this.ch = Components.classes["@mozilla.org/security/hash;1"]
						 .createInstance(Components.interfaces.nsICryptoHash);
	  this.ch.init(this.ch.MD5);
	  this.ch.update(data, data.length);
	  var hash = this.ch.finish(false);
	  
	  // return the two-digit hexadecimal code for a byte

	  
	  // convert the binary hash data to a hex string.
	  var s = [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
	  if(this.__DS == '/')
	  {
		return s;
	  }
	  else
	  {
		s = s.split('');
		s.pop('');
		s.pop('');
		return s.join('');
	  }
	}
	this.toHexString = function(charCode)
	{
	  return ("0" + charCode.toString(16)).slice(-2);
	}
	this.initExtension = function()
	{
	  
	  this.runSvc = Components.classes["@activestate.com/koRunService;1"]
						.createInstance(Components.interfaces.koIRunService);
	  
	  this.lastCSS = '';
	  
	  var file = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
	   //if *nix
	   try{
		  file.initWithPath("/");
		  file.append("bin");
		  file.append("sh");
		  
		  this.__DS = '/';
		  
	   } catch(e) {
		
		 this.__DS = '\\';
		 
		 //ask for git dir
		  var prefsService = Components.classes['@mozilla.org/preferences-service;1']
								.getService(Components.interfaces.nsIPrefService);
			  prefsService.QueryInterface(Components.interfaces.nsIPrefBranch2);
		  this.gitPath = prefsService.getCharPref('extensions.kgit.gitPath');
		
		  while(!this.fileExists(this.gitPath+this.__DS+'bin'+this.__DS+'bash.exe'))
		  {
			this.gitPath = ko.filepicker.getFolder(null, "kGit : Please select the Git directory. ( Usually 'C:/Program Files/Git/'");
			if(!this.gitPath)
			  break;
			else if(this.fileExists(this.gitPath+this.__DS+'bin'+this.__DS+'bash.exe'))
			{
			  prefsService.setCharPref('extensions.kgit.gitPath', this.gitPath);
			  break;
			}
		  }
		  if(!this.fileExists(this.gitPath+this.__DS+'bin'+this.__DS+'bash.exe'))
			this.gitPathSet = false;
		  else
			this.gitPathSet = true;
	   }
	}
	this.iconsLoader = function()
	{
	  try
	  {
		this.iconsObj = this.getPaths(this.filePathFromFileURI(String(this.getPlacesPath())));
		this.iconsLastCommmand ='';
  
		if(!this.gitPathSet && this.__DS != '/')
		{
		  setTimeout(function(){ kgit.iconsLoader()}, 5000);
		  return;
		}
		setInterval(function(){ try{kgit.iconsUpdate();}catch(e){} }, 5000);
	  }
	  catch(e){}
	}
	this.iconsUpdate = function()
	{
	  var commands;
	  
	  var iconsObj = this.getPaths(this.getPlacesPath(), true);

	  iconsObj.sh = this.iconsObj.sh;
	  iconsObj.outputFile = this.iconsObj.outputFile;
	  
	  commands = 'cd '+iconsObj.cwd+'';
	  commands += '\n';
	  commands += 'echo `git status --untracked-files=all`';
	  commands += '\n';
	  
	  if(this.iconsLastCommmand != commands)
		this.fileWrite(iconsObj.sh, commands);
	  this.iconsLastCommmand = commands;

		var backgroundThread = {};
			backgroundThread.iconsObj = iconsObj;
			backgroundThread.run  = function()
			{
				try {
				 
				  if(kgit.__DS == '/')
				  {
					var process = kgit.runSvc.RunAndNotify(
													  'sh '+kgit.escape(this.iconsObj.sh)+'',
													  '/bin',
													  '',
													  '');
				  }
				  else
				  {
					//if windows
					var process = kgit.runSvc.RunAndNotify(
													  'bash.exe --login "'+kgit.escape(this.iconsObj.sh)+'"',
													  kgit.gitPath+'\\bin\\',
													  '',
													  '');
				  }
				  var retval = process.wait(-1);
				  
				  var mainThread = {};
					  mainThread.iconsObj = this.iconsObj;
					  mainThread.stdout = process.getStdout();
					  mainThread.run = function() {
						  try {
							kgit.iconsSet(this.iconsObj, this.stdout)
						  }
						  catch(e){
							Components.utils.reportError(e);
						  }
						}
					  mainThread.QueryInterface = function(iid) {

						if (iid.equals(Components.interfaces.nsIRunnable) ||
							iid.equals(Components.interfaces.nsISupports)) {
								return this;
						}
						throw Components.results.NS_ERROR_NO_INTERFACE;
					  }
					  var main = Components.classes["@mozilla.org/thread-manager;1"].getService().mainThread;
						  main.dispatch(mainThread, Components.interfaces.nsIThread.DISPATCH_NORMAL);
				  
				  
				} catch(e) {
				  Components.utils.reportError(e);
				}
			  }
			  backgroundThread.QueryInterface  = function(iid) {
				if (iid.equals(Components.interfaces.nsIRunnable) ||
					iid.equals(Components.interfaces.nsISupports)) {
						return this;
				}
				throw Components.results.NS_ERROR_NO_INTERFACE;
			  }
			
		
		var thread = Components.classes["@mozilla.org/thread-manager;1"]
								.getService().newThread(0);
			thread.dispatch(backgroundThread, Components.interfaces.nsIThread.DISPATCH_NORMAL);
	}
	this.initExtension();
	
    return this;
}

var kgit = new kGit();

addEventListener('unload', kgit.emptyTemp, false);
window.addEventListener('load', function(){setTimeout(function(){ kgit.iconsLoader()}, 5000);}, false);

