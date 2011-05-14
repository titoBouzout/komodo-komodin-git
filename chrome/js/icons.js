/* icons */
  function kGitIconsOverlay()
  {
	this.init = function()
	{
	  var kGitIcons = this;
	  this.loadTimer = this.s.timerIntervalAdd(500, function(){kGitIcons.hook();});
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
	  
	  this.watchedDirectories = [];
	  
	  this.running = false;
	  this.obj = kgit.getPaths(this.s.filePathFromFileURI(this.s.placesLocalCurrentPath(window)));
	  this.lastCommmand ='';
	  this.repositoriesCache = kgit.s.sharedObjectGet('repositoriesCache', [])//holds the paths of all the repositories in a directory
	  this.repositoriesPlacesCache = kgit.s.sharedObjectGet('repositoriesPlacesCache', []);//holds the commands to apply to a place by filtering the git repositories to the current view.
	  this.repositoriesPlacesCachePaths = kgit.s.sharedObjectGet('repositoriesPlacesCachePaths', []);//holds the paths of all the repositories for a given place
	  this.lastCSS = '';
	  this.iconsURI = this.s.uri('file://'+this.obj.outputFile+'.css');
	  
	  var kGitIcons = this;
	  
	  //check for changes on current place.
	  this.lastFocusedLocalPlacesPath = '';
	  this.updatePlacesTimer = this.s.timerIntervalAdd(400,
						function(){
						  var aLocation = kGitIcons.s.placesLocalCurrentPath(window);
						  if(kGitIcons.lastFocusedLocalPlacesPath != aLocation)
						  {
							kGitIcons.lastFocusedLocalPlacesPath = aLocation;
							kGitIcons.requestUpdate();
						  }
						});
	  this.requestUpdate();
	}
	this.uninit = function()
	{
	  this.updatePlacesTimer.cancel();
	  for(var id in this.watchedDirectories)
	  {
		kgit.s.unwatchFolder(
			  this.watchedDirectories[id],
			  function(aFolder){kgit.kGitIconsOverlay.requestUpdate();},
			  true,
			  true
			 );
	  }
	}
	this.getRepositories = function(obj)
	{
	  //this.measureTime.start('get getRepositories');
	  //this.s.dump('getRepositories');
	  //this.s.dump((new Date()).toLocaleString());
	  if(!this.repositoriesCache[obj.git])
	  {
		//this.measureTime.start('get getRepositories:findFiles');
		//find all the repositories into this directory
		var aList = {};
			aList.entries = [];
		kgit.s.runThreadAndWait(function(){
		  //kgit.s.dump('1:'+(new Date()).toLocaleString());
		  pathsEntries = kgit.s.findFiles(obj.git, /\.git$/, aList);
		  //kgit.s.dump('2:'+(new Date()).toLocaleString());
		  }, this.s.newThread());
		var paths = [];
		for(var id in aList.entries)
		  paths[id] = this.s.pathToNix(aList.entries[id]).split('/.git')[0];
		delete aList;
		paths = this.s.arrayUnique(paths);
		paths.sort().reverse();
		this.repositoriesCache[obj.git] = paths;
		//this.s.dump('on place '+obj.currentPlace+' about related repository '+obj.git+' found the following subrepositories', paths);
		//this.s.dump((new Date()).toLocaleString());
		//this.measureTime.stop('get getRepositories:findFiles');
	  }
	  if(!this.repositoriesPlacesCache[obj.currentPlace])
	  {
		//this.measureTime.start('get getRepositories:filter the list of repositories');
		//filter the list of repositories to these that are in the current view of the places sidebar
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
		var toWatchPaths = [];
		for(var id in paths)
		{
		  if(paths[id] != '')
		  {
			//only track repositories on current view
			if(this.s.inArray(allowedLookups, paths[id]) || paths[id].indexOf(obj.currentPlace) === 0)
			{
			  toWatchPaths[toWatchPaths.length] = paths[id].split('/').join(this.s.__DS);
			  
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
		this.repositoriesPlacesCachePaths[obj.currentPlace] = toWatchPaths;
		delete commands, paths;
		//this.measureTime.stop('get getRepositories:filter the list of repositories');
	  }
	  
	  if(this.lastCommmand == this.repositoriesPlacesCache[obj.currentPlace])
	  {
		
	  }
	  else
	  {
		//this.measureTime.start('get getRepositories:newWatchedDirectories');
		this.lastCommmand = this.repositoriesPlacesCache[obj.currentPlace];
		this.s.fileWrite(obj.sh, this.lastCommmand);
		
		var newWatchedDirectories = [];
		for(var id in this.repositoriesPlacesCachePaths[obj.currentPlace])
		{
		  newWatchedDirectories[newWatchedDirectories.length] = this.repositoriesPlacesCachePaths[obj.currentPlace][id];
		  
		  kgit.s.watchFolder(
					  this.repositoriesPlacesCachePaths[obj.currentPlace][id],
					  function(aFolder){kgit.kGitIconsOverlay.requestUpdate();},
					  true,
					  true
					 );
		}
		
		for(var id in this.watchedDirectories)
		{
		  kgit.s.unwatchFolder(
				this.watchedDirectories[id],
				function(aFolder){kgit.kGitIconsOverlay.requestUpdate();},
				true,
				true
			   );
		}
		this.watchedDirectories = newWatchedDirectories;
		//this.measureTime.stop('get getRepositories:newWatchedDirectories');
	  }
	  //this.measureTime.stop('get getRepositories');
	}
	this.cleanRepositoriesCache = function()
	{
	  this.reposotoriesCache = [];
	  this.repositoriesPlacesCache = [];
	  this.repositoriesPlacesCachePaths = [];
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
	  //this.measureTime.stop('updating.icons');
	 // this.measureTime.display();
	}
	this.requestUpdate = function()
	{
	  if(this.running)
	  {
		//this.s.dump('ignoring becuase is running or is unfocused:running:'+this.running);
		return;
	  }
	  this.running = true;
	  
	  //this.s.dump('updating icons');
	  //this.s.dump((new Date()).toLocaleString());
	  //this.measureTime = new this.s.measureTime();
	  //this.measureTime.start('updating.icons');
	  
	  var commands, kGitIcons = this;
	  var currentPlace = this.s.filePathFromFileURI(this.s.placesLocalCurrentPath(window));
	  var obj = kgit.getPaths(currentPlace, true);
	  obj.sh = this.obj.sh;
	  obj.outputFile = this.obj.outputFile;
	  obj.currentPlace = this.s.pathToNix(currentPlace);
	  
	  //get all the repositories on current places
	  
		this.s.runThread(function()
								{
								  kGitIcons.getRepositories(obj);
								  if(!kGitIcons.repositoriesCache[obj.git])
								  {
									//kGitIcons.s.dump('repositoriesCache is empty');
									kGitIcons.running = false;
									return;
								  }
								  //get and write the icons if needed 
								  kGitIcons.iconsGet(obj);
								}, this.thread);
	}
	this.iconsGet = function(obj)
	{
	  //this.measureTime.start('iconsGet');
	  //this.s.dump('iconsGet');
	  //this.s.dump((new Date()).toLocaleString());
	  
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
	  //this.measureTime.stop('iconsGet');
	}
  }
