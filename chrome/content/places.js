
function kGit()
{
    this.temporal = [];
    this.temporal['diff'] = [];
    this.temporal['log'] = [];

    this.observe = function(aSubject, aTopic, aData)
	{
        for(var id in this.temporal['diff'])
        {
            var file = this.temporal['diff'][id];
                this.temporal['diff'][id] = null;
                delete this.temporal['diff'][id];
            ko.open.multipleURIs([file]);
        }
        
        for(var id in this.temporal['log'])
        {
            var file = this.temporal['log'][id];
                this.temporal['log'][id] = null;
                delete this.temporal['log'][id];
            ko.open.multipleURIs([file]);
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
      var selected =   gPlacesViewMgr.getSelectedURIs();
      for(var id in selected)
        selected[id] = selected[id].replace(/file\:\/\//, '').replace(/"/g, '\"'); 
      return selected;
    }
    this.commit = function()
    {
       this.run();
    }
    this.status = function()
    {
        /*
        this.alert(document.popupNode);
        var childs = document.popupNode.getElementsByTagName('treerow');
        for(var id=0;id < childs.length;id++)
        {
            this.alert(childs[id].getAttribute('value'))
            this.alert(childs[id].getAttribute('href'))
            this.alert(childs[id].getAttribute('url'))
        }
        
        */
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
            
            this.temporal['diff'][this.temporal['diff'].length] = output;
            
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
            var output = this.fileCreateTemporal('kGit.log');
            
            var dir;
            
            if(this.fileIsFolder(selected[id]))
                dir = selected[id];
            else
                dir = this.fileDirname(selected[id]);
            
            this.temporal['log'][this.temporal['log'].length] = output;
            
            this.fileWrite(file, 'cd "'+dir+'" \ngit log "'+selected[id]+'" > "'+output+'" ');
            
            this.run(file);
        }
    }
    
    
    
    
    
    
    
    
    
    
    
    /* UTILS */
    
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
    //returns true if a file exists
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