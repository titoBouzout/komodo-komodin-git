#!/usr/bin/env python

import hashlib
import logging
from xpcom import components
from xpcom.server import UnwrapObject
#qlog = logging.getLogger("KoPlaceTreeView.q")
#qlog.setLevel(logging.DEBUG)
class KGit:
    _com_interfaces_ = [components.interfaces.nsISupports,components.interfaces.IKGit]
    _reg_clsid_ = "{04e01b80-6eca-11e0-a1f0-0800200c9a66}"
    _reg_contractid_ = "@particle.universe.tito/kGit;1"
    _reg_desc_ = "extends buildCellProperties to add a md5 of the file path to be able to style treeitems"
    #registered = False
        
    def KGit_hookFunction(self):
        #if self.registered == True:
        #  return
        #self.registered = True;
        wm = components.classes["@mozilla.org/appshell/window-mediator;1"].getService(components.interfaces.nsIWindowMediator)
        win = wm.getMostRecentWindow("Komodo")
        tree = win.document.getElementById('places-files-tree')
        treebox = tree.boxObject.QueryInterface(components.interfaces.nsITreeBoxObject)
        pview = UnwrapObject(treebox.view)
        self._buildCellProperties_old = pview._buildCellProperties
        pview._buildCellProperties = self.KGit_buildCellProperties
  
    def KGit_buildCellProperties(self, rowNode):
        properties = self._buildCellProperties_old(rowNode)
        koFileObject = rowNode.koFile
        if not koFileObject:
            return properties
        koFileObject = UnwrapObject(koFileObject)
        m = hashlib.md5()
        m.update(koFileObject.path.replace('\\', '/'))
        #qlog.debug("koFile getter: file:%s, isLink:%r",
        #              koFileObject.path.replace('\\', '/'),
        #               m.hexdigest())
        properties.append('k'+m.hexdigest())#the css selector need start with a letter
        return properties