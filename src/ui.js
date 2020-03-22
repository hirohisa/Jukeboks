'use strict'

// element list

const directoryTree = document.getElementById('directory-tree');
module.exports.directoryTree = directoryTree;
module.exports.sideBar = document.getElementById('sidebar');

const dirPath = document.getElementById('path-directory');
module.exports.dirPath = dirPath;

const directoryIcon = document.getElementById('bookmark-directory');
module.exports.directoryIcon = directoryIcon;

const directoryName = document.getElementById('path-directory-name');
module.exports.directoryName = directoryName;

const searchInputForm = document.getElementById('search-form-input')
module.exports.searchInputForm = searchInputForm

// utils

// https://stackoverflow.com/questions/494143/
module.exports.createElementFromHTML = function (htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

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
