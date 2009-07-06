/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is hid.im.
 *
 * The Initial Developer of the Original Code is
 * Michael Nutt.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var hidim = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("hidim-strings");
    document.getElementById("contentAreaContextMenu")
    .addEventListener("popupshowing", function(e) { hidim.showContextMenu(e); }, false);
  },

  showContextMenu: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-hidim").hidden = !gContextMenu.onImage;
  },
  onMenuItemCommand: function(e) {
    var torrent = PngReader.readPng(gContextMenu.target);
    if(!torrent) {
      alert("The image is either not a torrent or corrupted.");
      return false;
    }

    // Check to make sure stated sha1 matches computed sha1
    if(torrent.file.sha1 != torrent.sha1) {
      alert("The torrent seems to be corrupted.");
      return false;
    }

    const nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
                   .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, "Save Torrent As...", nsIFilePicker.modeSave);
    fp.appendFilter("Torrents", "*.torrent");
    fp.appendFilters(0x01);

    // Make sure it gets saved as a .torrent, no cheating...
    if(!torrent.fileName.match(/\.torrent$/)) {
      torrent.fileName = torrent.fileName + ".torrent";
    }
    fp.defaultString = torrent.fileName;

    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {

      var aFile = Components.classes["@mozilla.org/file/local;1"]
      .createInstance(Components.interfaces.nsILocalFile);
      aFile.initWithPath(fp.file.path);
      aFile.createUnique( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);

      var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].
      createInstance(Components.interfaces.nsIFileOutputStream);
      stream.init(aFile, 0x02 | 0x08 | 0x20, 0600, 0); // write, create, truncate

      stream.write(torrent.file.data, torrent.file.data.length);
      if (stream instanceof Components.interfaces.nsISafeOutputStream) {
	stream.finish();
      } else {
	stream.close();
      }
    }

  }

};
window.addEventListener("load", function(e) { hidim.onLoad(e); }, false);
