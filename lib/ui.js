'use strict'

// element list

const directoryTree = document.getElementById('directory-tree')
module.exports.directoryTree = directoryTree
module.exports.sideBar = document.getElementById('sidebar')

const directoryPath = document.getElementById('path-directory')
module.exports.directoryPath = directoryPath

const searchInputForm = document.getElementById('search-form-input')
module.exports.searchInputForm = searchInputForm

// get element

module.exports.getCurrent = function() {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryTree.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}
