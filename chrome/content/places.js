
function kGit()
{
    this.temporal = [];
    this.temporal['open'] = [];//opens in a new tab the output
    this.temporal['display'] = [];//shows in the command output the output
	this.rootButton = false;
	
	//runs a shell script
    this.run = function(aScriptPath)
    {
        var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);   
             file.initWithPath("/");
             file.append("bin");
             file.append("sh");

        var process = Components.classes["@mozilla.org/process/util;1"]
                         .createInstance(Components.interfaces.nsIProcess2);
             process.init(file);

        var argv = [aScriptPath];

        process.runAsync(argv, argv.length, this, false);
    }
	//observe execution of a shell script
    this.observe = function(aSubject, aTopic, aData)
	{
	  for(var id in this.temporal['open'])
	  {
		  var file = String(this.temporal['open'][id]);
			  delete this.temporal['open'][id];
			  if(this.fileRead(file) != '')
				ko.open.multipleURIs([file]);
			  else
				this.commandOutput('kGit: Nothing to show');
	  }
	  for(var id in this.temporal['display'])
	  {
		  var file = String(this.temporal['display'][id]);
			  delete this.temporal['display'][id];
		  this.commandOutput(this.fileRead(file));
	  }
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
	  
    this.getSelectedPaths = function(event)
    {
	  if(event.originalTarget.parentNode.parentNode.tagName == 'toolbarbutton')
	  {
		var selected = [];
			selected[0] = this.documentFocusedGetLocation();
	  }
	  else
	  {
		  var selected = gPlacesViewMgr.getSelectedURIs();

		  if(!this.rootButton && selected && selected.length && selected.length > 0)
		  {
			for(var id in selected)
			  selected[id] = this.filePathFromFileURI(selected[id]);
		  }
		  else if(ko && ko.places && ko.places.manager && ko.places.manager.currentPlace &&  ko.places.manager.currentPlace != '')
		  {
			selected = [];
			selected[0] = this.filePathFromFileURI(String(ko.places.manager.currentPlace));
		  }
		  else
		  {
			this.error('no path found');
		  }
	  }
	  return selected;
    }
    this.getSelectedPathFolder = function(event)
    {
      var selected = this.getSelectedPaths(event)[0];
        if(this.fileIsFolder(selected)){}
        else
            selected = this.fileDirname(selected);
      return selected;
    }

    this.diff = function(event)
    {
        var selected = this.getSelectedPaths(event);
        for(var id in selected)
        {
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(dir)+'" \ngit diff "'+this.escape(selected[id])+'" > "'+output+'" \nsleep 1 ');
            this.run(file);
        }
    }
    this.log = function(event)
    {
        var selected = this.getSelectedPaths(event);
        for(var id in selected)
        {
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(dir)+'" \n echo "log:'+this.escape(selected[id])+'" >> "'+output+'" \n git log --stat --graph --date-order "'+this.escape(selected[id])+'" >> "'+output+'" \nsleep 1');
            
            this.run(file);
        }
    }
	this.logExtended = function(event)
    {
        var selected = this.getSelectedPaths(event);
        for(var id in selected)
        {
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(dir)+'" \n echo "log:'+this.escape(selected[id])+'" >> "'+output+'" \n git log -p "'+this.escape(selected[id])+'" >> "'+output+'" \nsleep 1');
            
            this.run(file);
        }
    }
    this.status = function(event)
    {
        var selected = this.getSelectedPaths(event);
        for(var id in selected)
        {
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(dir)+'" \n echo "status:'+this.escape(selected[id])+'" >> "'+output+'" \n git status "'+this.escape(selected[id])+'" >> "'+output+'" \nsleep 1 ');
            
            this.run(file);
        }
    }
	this.blame = function(event)
    {
        var selected = this.getSelectedPaths(event);
        for(var id in selected)
        {
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
			if(!this.fileIsFolder(selected[id]))
			{
			  this.fileWrite(file, 'cd "'+this.escape(dir)+'" \n echo "blame:'+this.escape(selected[id])+'" >> "'+output+'" \n git blame "'+this.escape(selected[id])+'" >> "'+output+'" \nsleep 1 ');
            
			  this.run(file);
			}
        }
    }
    this.revertClean = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
        var selected = this.getSelectedPaths(event);
		var file = this.fileCreateTemporal('kGit.sh');
		var output = this.fileCreateTemporal('kGit.diff');
		
		var dir;
		var commands = '';
		
        for(var id in selected)
        {    
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
				
			commands += 'cd "'+this.escape(dir)+'" ';
			commands += '\n';
			commands += 'git checkout -- "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
			commands += '\n';
			commands += 'git clean "'+this.escape(selected[id])+'" -f -d >>"'+output+'" 2>&1';
			commands += '\n';
        }
		commands += 'sleep 1';
		commands += '\n';

		this.temporal['open'][this.temporal['open'].length] = output;
		
		this.fileWrite(file, commands);
		
		this.run(file);
	  }
    }
    this.revert = function(event)
    {
	  if(this.confirm('Are you sure?'))
	  {
        var selected = this.getSelectedPaths(event);
		var file = this.fileCreateTemporal('kGit.sh');
		var output = this.fileCreateTemporal('kGit.diff');
		
		var dir;
		var commands = '';
		
        for(var id in selected)
        {
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
				
			commands += 'cd "'+this.escape(dir)+'" ';
			commands += '\n';
			commands += 'git checkout -- "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
			commands += '\n';
        }
		commands += 'sleep 1';
		commands += '\n';

		this.temporal['open'][this.temporal['open'].length] = output;
		
		this.fileWrite(file, commands);
		
		this.run(file);
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
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit revert '+aMsg+' >>"'+output+'" 2>&1 \n sleep 1 ');
            
            this.run(file);
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
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit checkout '+aMsg+' >>"'+output+'" 2>&1 \n sleep 1 ');
            
            this.run(file);
		  }
        }
    }

    this.push = function(event)
    {
        var selected = this.getSelectedPathFolder(event);

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit push >>"'+output+'" 2>&1 \n sleep 1  ');
        
        this.run(file);
    }

    this.init = function(event)
    {
        var selected = this.getSelectedPathFolder(event);

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit init >>"'+output+'" 2>&1 \n sleep 1 ');
        
        this.run(file);
    }
    this.clone = function(event)
    {
        var aMsg = this.prompt('Enter URL to clone…');
        if(aMsg != '')
        {
            var selected = this.getSelectedPathFolder(event);
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['display'][this.temporal['display'].length] = output;
            
            this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit clone '+aMsg+' >>"'+output+'" 2>&1 \n sleep 1 ');
            
            this.run(file);
        }
    }

    this.pull = function(event)
    {
        var selected = this.getSelectedPathFolder(event);

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+this.escape(selected)+'" \ngit pull >>"'+output+'" 2>&1 \n sleep 1  ');
        
        this.run(file);
	}
	
	//free input command
    this.command = function(event)
    {
        var aMsg = this.prompt('[komodin@komodo ./] $ ', 'git ');
        if(aMsg != '')
        {
		  var selected = this.getSelectedPathFolder(event);

		  var file = this.fileCreateTemporal('kGit.sh');
		  var output = this.fileCreateTemporal('kGit.diff');
		  
		  this.temporal['open'][this.temporal['open'].length] = output;
		  
		  this.fileWrite(file, 'cd "'+this.escape(selected)+'" \n'+aMsg+' >>"'+output+'" 2>&1 \n sleep 1 ');
		  
		  this.run(file);
		}
    }

    this.commit = function(event)
    {
        var aMsg = this.prompt('Enter a commit message…', '', true);
        if(aMsg != '')
        {
            var selected = this.getSelectedPaths(event);
			var file = this.fileCreateTemporal('kGit.sh');
			var output = this.fileCreateTemporal('kGit.diff');
			
			var dir;
			var commands = '';
            for(var id in selected)
            {
                if(this.fileIsFolder(selected[id]))
                    dir = selected[id];
                else
                    dir = this.fileDirname(selected[id]);
					
				commands += 'cd "'+this.escape(dir)+'"';
				commands += '\n';
				commands += 'git commit "'+this.escape(selected[id])+'" -m "'+this.escape(aMsg)+'" >>"'+output+'" 2>&1';
				commands += '\n';
            }
			commands += 'sleep 1';
			commands += '\n';

			this.temporal['open'][this.temporal['open'].length] = output;
                
	        this.fileWrite(file, commands);
                
            this.run(file);
        }
    }
    
    this.addCommit = function(event)
    {
        var aMsg = this.prompt('Enter a commit message…', '', true);
        if(aMsg != '')
        {
            var selected = this.getSelectedPaths(event);
			var file = this.fileCreateTemporal('kGit.sh');
			var output = this.fileCreateTemporal('kGit.diff');
			
			var dir;
			var commands = '';
            for(var id in selected)
            {
                if(this.fileIsFolder(selected[id]))
                    dir = selected[id];
                else
                    dir = this.fileDirname(selected[id]);
					
				commands += 'cd "'+this.escape(dir)+'"';
				commands += '\n';
				commands += 'git add "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
				commands += '\n';
				commands += 'git commit "'+this.escape(selected[id])+'" -m "'+this.escape(aMsg)+'" >>"'+output+'" 2>&1';
				commands += '\n';
            }
			commands += 'sleep 1';
			commands += '\n';

			this.temporal['open'][this.temporal['open'].length] = output;
                
	        this.fileWrite(file, commands);
                
            this.run(file);
        }
    }
    
    this.addCommitPush = function(event)
    {
        var aMsg = this.prompt('Enter a commit message…', '', true);
        if(aMsg != '')
        {
            var selected = this.getSelectedPaths(event);
			var file = this.fileCreateTemporal('kGit.sh');
			var output = this.fileCreateTemporal('kGit.diff');
			
			var dir;
			var commands = '';
            for(var id in selected)
            {
                if(this.fileIsFolder(selected[id]))
                    dir = selected[id];
                else
                    dir = this.fileDirname(selected[id]);
					
				commands += 'cd "'+this.escape(dir)+'"';
				commands += '\n';
				commands += 'git add "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
				commands += '\n';
				commands += 'git commit "'+this.escape(selected[id])+'" -m "'+this.escape(aMsg)+'" >>"'+output+'" 2>&1';
				commands += '\n';
            }
			commands += 'git push >>"'+output+'" 2>&1';
			commands += '\n';
			commands += 'sleep 1';
			commands += '\n';

			this.temporal['open'][this.temporal['open'].length] = output;
                
	        this.fileWrite(file, commands);
                
            this.run(file);
        }
    }
	this.add = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  var file = this.fileCreateTemporal('kGit.sh');
	  var output = this.fileCreateTemporal('kGit.diff');
	  
	  var dir;
	  var commands = '';
	  for(var id in selected)
	  {
		  if(this.fileIsFolder(selected[id]))
			  dir = selected[id];
		  else
			  dir = this.fileDirname(selected[id]);
			  
		  commands += 'cd "'+this.escape(dir)+'"';
		  commands += '\n';
		  commands += 'git add "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
		  commands += '\n';
	  }
	  commands += 'sleep 1';
	  commands += '\n';

	  this.temporal['open'][this.temporal['open'].length] = output;
		  
	  this.fileWrite(file, commands);
		  
	  this.run(file);
    }
	this.remove = function(event)
    {
	  var selected = this.getSelectedPaths(event);
	  var file = this.fileCreateTemporal('kGit.sh');
	  var output = this.fileCreateTemporal('kGit.diff');
	  
	  var dir;
	  var commands = '';
	  for(var id in selected)
	  {
		  if(this.fileIsFolder(selected[id]))
			  dir = selected[id];
		  else
			  dir = this.fileDirname(selected[id]);
			  
		  commands += 'cd "'+this.escape(dir)+'"';
		  commands += '\n';
		  commands += 'git rm "'+this.escape(selected[id])+'" >>"'+output+'" 2>&1';
		  commands += '\n';
	  }
	  commands += 'sleep 1';
	  commands += '\n';

	  this.temporal['open'][this.temporal['open'].length] = output;
		  
	  this.fileWrite(file, commands);
		  
	  this.run(file);
    }
	this.ignoreOpen = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  var aPath;
	  
	  for(var id in selected)
	  {
		aPath = selected[id];
		while(!this.fileExists(aPath+'/.git'))
		{
		  if(this.fileExists(aPath+'/.gitignore'))
			break;
		  if(this.fileDirname(aPath) == aPath)
			break;
		  aPath = this.fileDirname(aPath);
		}
		if(this.fileExists(aPath+'/.gitignore'))
		  this.openURL(aPath+'/.gitignore', true);
		else
		{
		  if(this.confirm('.gitignore file was not found. Do you want to create one?'))
		  {
			this.fileWrite(aPath+'/.gitignore', '\n');
		  	this.openURL(aPath+'/.gitignore', true);
		  }
		}
	  }
	}
	this.ignore = function(event)
	{
	  var selected = this.getSelectedPaths(event);
	  
	  for(var id in selected)
	  {
		if(this.fileIsFolder(selected[id]))
		  aPath = this.fileDirname(selected[id]);
		else
		  aPath = selected[id];
		  
		while(!this.fileExists(aPath+'/.git'))
		{
		  if(this.fileExists(aPath+'/.gitignore'))
			break;
		  if(this.fileDirname(aPath) == aPath)
			break;
		  aPath = this.fileDirname(aPath);
		}
		
		if(this.fileExists(aPath+'/.gitignore'))
		{
		  var ignore = this.fileRead(aPath+'/.gitignore');
			  ignore += '\n';
			  ignore += selected[id].replace(aPath+'/', '');
		  
			  ignore = this.arrayUnique(ignore.split('\n')).sort(this.sortLocale).join('\n');
		}
		else
		{
		  var ignore = selected[id].replace(this.getGitRoot(aPath)+'/', '');
		}
		ignore += '\n';

		this.fileWrite(aPath+'/.gitignore', ignore);
		this.openURL(aPath+'/.gitignore', true);
	  }
	}
	this.getGitRoot = function(aPath)
	{
	  while(!this.fileExists(aPath+'/.git'))
	  {
		if(this.fileDirname(aPath) == aPath)
		  break;
		aPath = this.fileDirname(aPath);
		if(this.fileExists(aPath+'/.git'))
		  break;
	  }
	  if(this.fileExists(aPath+'/.git'))
		return aPath;
	  else
		return '';
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

  
  
    this.crazyIconsEvent = function(event)
    {
        /*
          gPlacesViewMgr.tree.body.addEventListener('DOMSubtreeModified',
                          function(event){kgit.crazyIcons(event, 1);}, false);
            
             document.getElementById("places-files-tree").addEventListener('DOMSubtreeModified',
                                function(event){kgit.crazyIcons(event, 2);}, false);
             
            document.getElementById("places-files-tree-body").addEventListener('DOMSubtreeModified',
                                function(event){kgit.crazyIcons(event, 3);}, false);
            alert('dale hdp');
        */ 
    }
    this.crazyIcons = function(event, coso)
    {
          /*
            alert(coso);
   var tree = document.getElementById("my-tree");
  var tbo = tree.treeBoxObject;

  // get the row, col and child element at the point
  var row = { }, col = { }, child = { };
  tbo.getCellAt(event.clientX, event.clientY, row, col, child);

  var cellText = tree.view.getCellText(row.value, col.value);
  alert(cellText);  xul:treerows

//gPlacesViewMgr.tree.view
  alert(event.explicitOriginalTarget.tagName)
        if(
           event.explicitOriginalTarget.tagName == 'treechildren' ||
           event.explicitOriginalTarget.tagName == 'tree' || 
           event.explicitOriginalTarget.tagName == 'treerows' ||
           event.explicitOriginalTarget.tagName == 'treerow' || 
           event.explicitOriginalTarget.tagName == 'treeitem'
           )
        {
            for(var id in event.explicitOriginalTarget)
            {
                if(id.indexOf('tag') != -1)
                    alert(id+'=>'+event.explicitOriginalTarget[id])
            }
        }
          */
    
    /*
        this.recentProjectsTreeView.prototype.getCellProperties = function(index, column, properties) {
        var row = this.rows[index];
        var currentProject = ko.projects.manager.currentProject;
        if (currentProject && currentProject.url == row[0]) {
            properties.AppendElement(this._atomService.getAtom("projectActive"));
        }
        
        
        def getCellProperties(self, row_idx, column, properties):
        #assert col.id == "name"
        col_id = column.id
        try:
            rowNode = self._rows[row_idx]
####        zips = rowNode.getCellPropertyNames(col_id)
####            qlog.debug("props(row:%d) name:%s) : %s",
####                       row_idx, rowNode.name,  zips)
            for propName in rowNode.getCellPropertyNames(col_id):
                try:
                    properties.AppendElement(self._atomsFromName[propName])
                except KeyError:
                    log.debug("getCellProperties: no property for %s",
                               propName)
        except AttributeError:
            log.exception("getCellProperties(row_idx:%d, col_id:%r",
                          row_idx, col_id)
            return ""
        if rowNode.properties is None:
            # These values are cached, until there is a file_status change.
            atomProperties = []
            for prop in self._buildCellProperties(rowNode):
                atomProperties.append(self.atomSvc.getAtom(prop))
            rowNode.properties = atomProperties
        for atomProp in rowNode.properties:
            properties.AppendElement(atomProp)
    
    gfvk tkg kgfk gjk y
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
        var aFile = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
            aFile.initWithPath(aFilePath);

            if(aFile.exists())
                return true;
            else
                return false;
    }
    //returns true if a path is a folder
	this.fileIsFolder = function(aFilePath)
	{
        var aFile = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
            aFile.initWithPath(aFilePath);

            if(aFile.exists() && aFile.isDirectory())
                return true;
            else
                return false;
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
	this.fileWrite= function(aFilePath, aData)
	{
		try
		{
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
		var aDestination = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
			aDestination.initWithPath(aFilePath);

		var dirname =  aDestination.parent.path;
		return dirname;
	}
    //returns a file path from a file URI
	this.filePathFromFileURI = function(aURI)
	{
	  if(!this.ios)
		this.ios = Components.classes["@mozilla.org/network/io-service;1"].  
						getService(Components.interfaces.nsIIOService);

	  return String(this.ios.newURI(aURI, null, null)
				  .QueryInterface(Components.interfaces.nsIFileURL).file.path);
	}
	this.escape = function(aString)
	{
	  return aString.replace(/"/g, '\\"');
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
    return this;
}

var kgit = new kGit();

addEventListener('unload', kgit.emptyTemp, false);