'use strict'
const mainContent = document.getElementById('main-content')
const mainCollection = document.getElementById('main-collection')

module.exports.showContent = function () {
  mainContent.style.display = "block";
  mainCollection.style.display = "none";
}

module.exports.showCollection = function () {
  mainContent.style.display = "none";
  mainCollection.style.display = "block";
}

module.exports.isShowingContent = function () {
  if (mainContent.style.display == "block") {
    return true;
  }
  if (mainContent.style.display == undefined) {
    return true;
  }

  return false;
}

module.exports.cleanContents = function () {
  while (mainContent.firstChild) {
    mainContent.removeChild(mainContent.firstChild)
  }

  while (mainCollection.firstChild) {
    mainCollection.removeChild(mainCollection.firstChild)
  }
  const videoSlider = document.getElementById('video-slider');
  videoSlider.style.display = "none";
}

module.exports.clean = function (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild)
  }
}
