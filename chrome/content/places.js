
function kGit()
{
    this.temporal = [];
    this.temporal['open'] = [];//opens in a new tab the output
    this.temporal['display'] = [];//shows in the command output the output

    this.observe = function(aSubject, aTopic, aData)
	{
	  
	  for(var id in this.temporal['open'])
	  {
		  var file = this.temporal['open'][id];
			  this.temporal['open'][id] = null;
			  delete this.temporal['open'][id];
		  ko.open.multipleURIs([file]);
	  }
	  for(var id in this.temporal['display'])
	  {
		  var file = this.temporal['display'][id];
			  this.temporal['display'][id] = null;
			  delete this.temporal['display'][id];
		  this.commandOutput(this.fileRead(file));
	  }
    }
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
    this.getSelectedURIs = function()
    {
      var selected = gPlacesViewMgr.getSelectedURIs();
	  
	  if(selected && selected.length && selected.length > 0)
	  {
		for(var id in selected)
		  selected[id] = selected[id].replace(/file\:\/\//, '').replace(/"/g, '\\"');
	  }
	  else if(ko && ko.places && ko.places.manager && ko.places.manager.currentPlace &&  ko.places.manager.currentPlace != '')
	  {
		 selected = [];
		 selected[0] = String(ko.places.manager.currentPlace).replace(/file\:\/\//, '').replace(/"/g, '\\"');
	  }
	  else
	  {
		this.error('no path');
	  }
      return selected;
    }
    this.getSelectedURIFolder = function()
    {
      var selected = this.getSelectedURIs()[0];
        if(this.fileIsFolder(selected)){}
        else
            selected = this.fileDirname(selected);
      return selected;
    }

    this.diff = function()
    {
        var selected = this.getSelectedURIs();
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
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit diff "'+selected[id]+'" > "'+output+'" ');
            
            this.run(file);
        }
    }
    this.log = function()
    {
        var selected = this.getSelectedURIs();
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
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit log "'+selected[id]+'" > "'+output+'" ');
            
            this.run(file);
        }
    }
    this.status = function()
    {
        var selected = this.getSelectedURIs();
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
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit status "'+selected[id]+'" > "'+output+'" ');
            
            this.run(file);
        }
    }
    this.revertClean = function()
    {
        var selected = this.getSelectedURIs();
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
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit checkout -- "'+selected[id]+'" >>"'+output+'" 2>&1 \n git clean "'+selected[id]+'" -f -d >>"'+output+'" 2>&1  \n ');
            
            this.run(file);
        }
    }
    this.revert = function()
    {
        var selected = this.getSelectedURIs();
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
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit checkout -- "'+selected[id]+'" >> "'+output+'"  \n \n ');
            
            this.run(file);
        }
    }
    this.revertToObject = function()
    {
        var aMsg = this.prompt('Revert to object...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIFolder();
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+selected+'" \ngit revert '+aMsg+' >>"'+output+'" 2>&1 \n ');
            
            this.run(file);
        }
    }
    this.checkoutTo = function()
    {
        var aMsg = this.prompt('Checkout to...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIFolder();
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['open'][this.temporal['open'].length] = output;
            
            this.fileWrite(file, 'cd "'+selected+'" \ngit checkout '+aMsg+' >>"'+output+'" 2>&1 \n ');
            
            this.run(file);
        }
    }

    this.push = function()
    {
        var selected = this.getSelectedURIFolder();

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+selected+'" \ngit push >>"'+output+'" 2>&1 \n ');
        
        this.run(file);
    }

    this.init = function()
    {
        var selected = this.getSelectedURIFolder();

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+selected+'" \ngit init >>"'+output+'" 2>&1 \n ');
        
        this.run(file);
    }
    this.clone = function()
    {
        var aMsg = this.prompt('Enter URL to clone...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIFolder();
            
            var file = this.fileCreateTemporal('kGit.sh');
            var output = this.fileCreateTemporal('kGit.diff');
            
            this.temporal['display'][this.temporal['display'].length] = output;
            
            this.fileWrite(file, 'cd "'+selected+'" \ngit clone '+aMsg+' >>"'+output+'" 2>&1 \n ');
            
            this.run(file);
        }
    }

    this.pull = function()
    {
        var selected = this.getSelectedURIFolder();

        var file = this.fileCreateTemporal('kGit.sh');
        var output = this.fileCreateTemporal('kGit.diff');
        
        this.temporal['display'][this.temporal['display'].length] = output;
        
        this.fileWrite(file, 'cd "'+selected+'" \ngit pull >>"'+output+'" 2>&1 \n ');
        
        this.run(file);
    }

    this.commit = function()
    {
        var aMsg = this.prompt('Enter a commit message...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIs();
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
                
                this.fileWrite(file, 'cd "'+dir+'" \ngit commit "'+selected[id]+'" -m "'+aMsg+'" >>"'+output+'" 2>&1 \n ');
                
                this.run(file);
            }
        }
    }
    
    this.addCommit = function()
    {
        var aMsg = this.prompt('Enter a commit message...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIs();
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
                
                this.fileWrite(file, 'cd "'+dir+'" \ngit add "'+selected[id]+'" \ngit commit "'+selected[id]+'" -m "'+aMsg+'" >>"'+output+'" 2>&1 \n ');
                
                this.run(file);
            }
        }
    }
    
    this.addCommitPush = function()
    {
        var aMsg = this.prompt('Enter a commit message...').replace(/"/g, '\\"');
        if(aMsg != '')
        {
            var selected = this.getSelectedURIs();
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
                
                this.fileWrite(file, 'cd "'+dir+'" \ngit add "'+selected[id]+'" \ngit commit "'+selected[id]+'" -m "'+aMsg+'" >>"'+output+'" 2>&1 \n \ngit push >>"'+output+'" 2>&1 \n ');
                
                this.run(file);
            }
        }
    }
	//empty our temp folder when komodo is closed.
    this.emptyTemp = function()
    {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
						 .getService(Components.interfaces.nsIProperties)
						 .get("TmpD", Components.interfaces.nsIFile);
		//security - works always in a folder with with the name of this extension
		file.append('kGit');
		
		if( !file.exists() || !file.isDirectory() )   // if it doesn't exist..
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
	this.prompt = function(aString, aDefault)
	{
		if(!aDefault)
			aDefault = '';
		
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
    
    return this;
}

var kgit = new kGit();

addEventListener('unload', kgit.emptyTemp, false);