'use strict'

// element list

const directoryTree = document.getElementById('directory-tree');
module.exports.directoryTree = directoryTree;

// const bookmarkDirectoryIcon = document.getElementById('bookmark-directory');
// module.exports.bookmarkDirectoryIcon = bookmarkDirectoryIcon;

const directoryCurrentDiv = document.getElementById('directory-current-name');
module.exports.directoryCurrentDiv = directoryCurrentDiv;

const searchInputForm = document.getElementById('search-form-input')
module.exports.searchInputForm = searchInputForm

// get element

module.exports.getCurrent = function () {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryTree.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}
