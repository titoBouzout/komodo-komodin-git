/* icons */
  function kGitIconsOverlay()
  {
	this.init = function()
	{
	  var kGitIcons = this;
	  this.loadTimer = this.s.timerIntervalAdd(100, function(){kGitIcons.hook();});
	}
	this.hook = function()
	{
	  //wait for places extension to load
	  if(this.s.placesLocalCurrentPath(window) == ''){}
	  else
	  {
		this.loadTimer.cancel();
		
		Components
		.classes["@particle.universe.tito/kGit;1"]
		.getService(Components.interfaces.IKGit)
		.KGit_hookFunction();

		this.load();
	  }
	}
	this.load = function()
	{
	  this.runSvc = Components
						  .classes["@activestate.com/koRunService;1"]
						  .createInstance(Components.interfaces.koIRunService);
	  
	  this.thread = this.s.newThread();
	  
	  this.sss = Components
				  .classes["@mozilla.org/content/style-sheet-service;1"]
				  .getService(Components.interfaces.nsIStyleSheetService);
		
	  this.running = false;
	  this.obj = kgit.getPaths(this.s.filePathFromFileURI(this.s.placesLocalCurrentPath(window)));
	  this.lastCommmand ='';
	  this.repositoriesCache = kgit.s.sharedObjectGet('repositoriesCache', [])//holds the paths of all the repositories in a directory
	  this.repositoriesPlacesCache = kgit.s.sharedObjectGet('repositoriesPlacesCache', []);//holds the paths of all the repositories for a directory
	  this.lastCSS = '';
	  this.iconsURI = this.s.uri('file://'+this.obj.outputFile+'.css');
						  
	  var kGitIcons = this;
	  
	  //check for changes on current place.
	  this.lastFocusedLocalPlacesPath = this.s.placesLocalCurrentPath(window);
	  this.updatePlacesTimer = this.s.timerIntervalAdd(500,
						function(){
						  var aLocation = kGitIcons.s.placesLocalCurrentPath(window);
						  if(kGitIcons.lastFocusedLocalPlacesPath != aLocation)
						  {
							kGitIcons.lastFocusedLocalPlacesPath = aLocation;
							kGitIcons.requestUpdate();
						  }
						});
	  //update icons periodically TODO how can I watch for changes on a folder?
	  this.requestUpdateTimer = this.s.timerIntervalAdd(5000, function(){kGitIcons.requestUpdate();});
	  
	  this.windowFocused  = true;
	  var kGitIconsOverlay = this;
	  window.addEventListener('focus', function(){ kGitIconsOverlay.windowFocused = true;}, false);
	  window.addEventListener('blur', function(){ kGitIconsOverlay.windowFocused = false;}, false);
	  this.requestUpdate();
	}
	this.uninit = function()
	{
	  this.updatePlacesTimer.cancel();
	  this.requestUpdateTimer.cancel();
	}
	this.getRepositories = function(obj)
	{
	  if(!this.repositoriesCache[obj.git])
	  {
		//find all the repositories into this directory
		var process, retval, stdout = '', timeout, paths, kGitIcons = this;
		try
		{
		  if(!this.s.isWindows())
		  {
			process = this.runSvc.RunAndNotify(
											  'find -name hooks',
											  obj.git,
											  '',
											  '');
			var timeout = this.s.timerAdd(6000,
						  function(){
							kGitIcons.repositoriesCache[obj.git] = [];
							try{process.kill(true);}catch(e){}
							Components.utils.reportError('killed');
						  });
			retval = process.wait(-1);
			timeout.cancel();
			stdout = process.getStdout();
			stdout = stdout.split('./').join(obj.git+'/');
		  }
		  else
		  {
			//if windows
			process = this.runSvc.RunAndNotify(
											  'dir /S /B hooks',
											  obj.git,
											  '',
											  '');
			var timeout = this.s.timerAdd(6000,
						  function(){
							kGitIcons.repositoriesCache[obj.git] = [];
							try{process.kill(true);}catch(e){}
							Components.utils.reportError('killed');
						  });
			retval = process.wait(-1);
			timeout.cancel();
			stdout = process.getStdout();
			stdout = stdout.split('./').join(obj.git+'/');
		  }
		  
		  paths = stdout.split('\n');
		  paths[paths.length] = obj.git.replace(/\/$/, '');
		  
		  for(var id in paths)
			paths[id] = this.s.pathToNix(paths[id]).split('/.git/')[0];
		  
		  paths = this.s.arrayUnique(paths);
		  paths.sort().reverse();
		  this.repositoriesCache[obj.git] = paths;
		}
		catch(e)
		{
		  Components.utils.reportError(e);
		  try{
			Components.utils.reportError('killed');
			process.kill(true);
		  }catch(e){Components.utils.reportError(e);}
		}
		delete process, retval, stdout, timeout, paths;
	  }
	  if(!this.repositoriesPlacesCache[obj.currentPlace])
	  {
		//filter the list of repositories to these that are in the current view of places sidebar
		var allowedLookups = [];
		var currentPlacePaths = obj.currentPlace.split('/');
		var aPath = '';
		for(var id in currentPlacePaths)
		{
		  aPath += currentPlacePaths[id];
		  allowedLookups[allowedLookups.length] = aPath;
		  aPath += '/';
		}
		var paths = this.repositoriesCache[obj.git];
		var commands = '';
		for(var id in paths)
		{
		  if(paths[id] != '')
		  {
			//only track repositories on current view
			if(this.s.inArray(allowedLookups, paths[id]) || paths[id].indexOf(obj.currentPlace) === 0)
			{
			  commands += 'cd "'+this.s.filePathEscape(paths[id])+'"';
			  commands += '\n';
			  commands += 'echo "KGITPATH'+paths[id]+'KGITPATH"';
			  commands += '\n';
			  commands += 'echo `git status --untracked-files=all`';
			  commands += '\n';
			}
		  }
		}
		this.repositoriesPlacesCache[obj.currentPlace] = commands;
		delete commands, paths;
	  }
	  if(this.lastCommmand == this.repositoriesPlacesCache[obj.currentPlace]){}
	  else
	  {
		this.lastCommmand = this.repositoriesPlacesCache[obj.currentPlace];
		this.s.fileWrite(obj.sh, this.lastCommmand);
	  }
	}
	this.cleanRepositoriesCache = function()
	{
	  this.reposotoriesCache = [];
	  this.repositoriesPlacesCache = [];
	}
    this.iconsWrite = function()
    {
	  if(this.sss.sheetRegistered(this.iconsURI, this.sss.AGENT_SHEET))
		this.sss.unregisterSheet(this.iconsURI, this.sss.AGENT_SHEET);
	  this.sss.loadAndRegisterSheet(this.iconsURI, this.sss.AGENT_SHEET);
	  
	  setTimeout( function(){
		gPlacesViewMgr.view.refreshFullTreeView();
	  }, 10);
	  ko.places.viewMgr.tree.treeBoxObject.clearStyleAndImageCaches();
	  
	  this.running = false;
	}
	this.requestUpdate = function()
	{
	  if(this.running || !this.windowFocused)
		return;
	  this.running = true;

	  var commands, kGitIcons = this;
	  var currentPlace = this.s.filePathFromFileURI(this.s.placesLocalCurrentPath(window));
		var obj = kgit.getPaths(currentPlace, true);
		obj.sh = this.obj.sh;
		obj.outputFile = this.obj.outputFile;
		obj.currentPlace = this.s.pathToNix(currentPlace);
 
	  //get all the repositories on current places
	  
		this.s.runThreadAndWait(function(){ kGitIcons.getRepositories(obj);}, this.thread);
		
		if(!this.repositoriesCache[obj.git])
		{
		  this.running = false;
		  return;
		}
	  
	  //get and write the icons if needed 
	  
		this.s.runThread(function(){ try{kGitIcons.iconsGet(obj);} catch(e){Components.utils.reportError(e);kGitIcons.running = false;} }, this.thread);
	  
	}
	this.iconsGet = function(obj)
	{
	  var process, retval, stdout = '';
	  
	  if(!this.s.isWindows())
	  {
		process = this.runSvc.RunAndNotify(
										  'sh '+this.s.filePathEscape(obj.sh)+'',
										  '/bin',
										  '',
										  '');
	  }
	  else
	  {
		//if windows
		process = this.runSvc.RunAndNotify(
										  'bash.exe --login "'+this.s.filePathEscape(obj.sh)+'"',
										  this.gitPath+'\\bin\\',
										  '',
										  '');
	  }
	  retval = process.wait(-1);

	  var aStatusContent = process.getStdout();
	  
	  delete process, retval;
	  
	  var file, hash, css = '', rootPath, aString, aGitPath, aTemp;
	  
	  aStatusContent = aStatusContent.split('KGITPATH');

	  for(var i=1;i<aStatusContent.length;i++)
	  {
		aGitPath = aStatusContent[i].split('/').join(this.s.__DS);
		i++;
		aString = aStatusContent[i] || '';
		aString = aString
		  .split('nothing added to commit').join('#')
		  .split('no changes added to commit').join('#')
		  .split('but untracked files').join('#');
		 
	  /* untracked files */
	  
		if(aString.indexOf('Untracked files:') != -1)
		{
			aTemp = (aString.split('Untracked files:')[1]).split('#');
			aTemp[0] = '';
			aTemp[1] = '';
			for(var id in aTemp)
			{
			  if(aTemp[id] == '')
				continue;
				
			  aTemp[id] = aTemp[id].replace(/^\//, '');
			  rootFile = aGitPath;
			  
			  file = (aTemp[id].split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
			  var files = [];
				  files[files.length] = rootFile;
			  rootFile += this.s.__DS
			  for(var id in file)
			  {
				rootFile += file[id];
				files[files.length] = rootFile;
				rootFile += this.s.__DS;
			  }
			  for(var file in files)
			  {
				hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
				if(this.s.pathIsFolder(files[file]))
				  css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/du.png") !important;}'.replace('__FILE__', hash)+'\n';
				else
				  css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fu.png") !important;}'.replace('__FILE__', hash)+'\n';
				//css += '/*unversioned:'+this.s.pathToNix(files[file])+'*/\n'
			  }
			}
		}
	  

		/* ignored files */
		//TODO: properly parse gitignore to show "paths that match"
		if(this.s.fileExists(aGitPath+this.s.__DS+'.gitignore'))
		{
		  aTemp = this.s.fileRead(aGitPath+this.s.__DS+'.gitignore');
		  if(aTemp != '')
		  {
			  aTemp = aTemp.split('\n');
			  for(var id in aTemp)
			  {
				aTemp[id] = aTemp[id].replace(/^\//, '').replace(/\/$/, '');
				rootFile = aGitPath;
				
				file = (aTemp[id].split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
				var files = [];
					files[files.length] = rootFile;
				rootFile +=this.s.__DS
				for(var id in file)
				{
				  rootFile += file[id];
				  files[files.length] = rootFile;
				  rootFile += this.s.__DS;
				}
				for(var file in files)
				{
				  hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
				  if(this.s.pathIsFolder(files[file]))
					css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/di.png") !important;}'.replace('__FILE__', hash)+'\n';
				  else
					css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fi.png") !important;}'.replace('__FILE__', hash)+'\n';
				  //css += '/*'+this.s.pathToNix(files[file])+'*/\n'
				}
			  }
		  }
		}
		
	  /* conflicts */
	  
		aString = aString
					.split('both deleted').join('unmerged')
					.split('added by us').join('unmerged')
					.split('deleted by them').join('unmerged')
					.split('added by them').join('unmerged')
					.split('deleted by us').join('unmerged')
					.split('both added').join('unmerged')
					.split('both modified').join('unmerged');
					
		aString = aString.split('#');
		
	  /* deleted files */
	  
		for(var id in aString)
		{
		  if(aString[id].indexOf('deleted: ') != -1)
		  {
			rootFile = aGitPath;
			
			file = ((aString[id].split('deleted: ')[1]).split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
			var files = [];
				files[files.length] = rootFile;
			rootFile +=this.s.__DS;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.s.__DS;
			}
			for(var file in files)
			{
			  hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
			  if(this.s.pathIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/dd.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fd.png") !important;}'.replace('__FILE__', hash)+'\n';
			  //css += '/*deleted:'+this.s.pathToNix(files[file])+'*/\n'
			}
		  }
		}
		
	  /* new files */
	  
		for(var id in aString)
		{
		  if(aString[id].indexOf('new file:') != -1)
		  {
			rootFile = aGitPath;
			
			file = ((aString[id].split('new file: ')[1]).split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
			var files = [];
				files[files.length] = rootFile;
			rootFile +=this.s.__DS;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.s.__DS;
			}
			for(var file in files)
			{
			  hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
			  if(this.s.pathIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/da.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fa.png") !important;}'.replace('__FILE__', hash)+'\n';
			  //css += '/*new:'+this.s.pathToNix(files[file])+'*/\n'
			}
		  }
		}
		
	  /* unmerged */

		for(var id in aString)
		{
		  if(aString[id].indexOf('unmerged:') != -1)
		  {
			rootFile = aGitPath;
			
			file = ((aString[id].split('unmerged: ')[1]).split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
			var files = [];
				files[files.length] = rootFile;
			rootFile +=this.s.__DS;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.s.__DS;
			}
			for(var file in files)
			{
			  hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
			  if(this.s.pathIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/dc.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fc.png") !important;}'.replace('__FILE__', hash)+'\n';
			  //css += '/*unmerged:'+this.s.pathToNix(files[file])+'*/\n'
			}
		  }
		}
	  
	  /* modified files */
	  
		for(var id in aString)
		{
		  if(aString[id].indexOf('modified: ') != -1)
		  {
			rootFile = aGitPath;
			
			file = ((aString[id].split('modified: ')[1]).split('/').join(this.s.__DS).split('\\').join(this.s.__DS)).trim().split(this.s.__DS);
			var files = [];
				files[files.length] = rootFile;
			rootFile +=this.s.__DS;
			for(var id in file)
			{
			  rootFile += file[id];
			  files[files.length] = rootFile;
			  rootFile += this.s.__DS;
			}
			for(var file in files)
			{
			  hash = 'k'+this.s.md5(this.s.pathToNix(files[file]))
			  if(this.s.pathIsFolder(files[file]))
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/dm.png") !important;}'.replace('__FILE__', hash)+'\n';
			  else
				css += 'treechildren#places-files-tree-body::-moz-tree-image(__FILE__){list-style-image:url("chrome://kgit/content/icons/i/fm.png") !important;}'.replace('__FILE__', hash)+'\n';
			  //css += '/*modified:'+this.s.pathToNix(files[file])+'*/\n'
			}
		  }
		}
	  }
	  
	  delete aStatusContent, file, hash, rootPath, aString, aGitPath, aTemp;
	  
	  if(this.lastCSS == css)
	  {
		this.running = false;
	  }
	  else
	  {
		this.lastCSS = css;
		this.s.fileWrite(obj.outputFile+'.css', this.s.arrayUnique(css.split('\n')).join('\n'));
		var kGitIcons = this;
		this.s.runMain(function(){ kGitIcons.iconsWrite()});
	  }
	}
  }
