const _ = require('underscore')

const directoryLink = document.getElementById('directory-link')
const sideBar = document.getElementById('sidebar')

// functions

function createElement(type, id, className, innerHTML = "") {
  var element = document.createElement(type)
  if (id) element.id = id
  if (className) element.className = className
  element.innerHTML = innerHTML
  return element
}

function clearContent() {
  while (directoryLink.firstChild) {
      directoryLink.removeChild(directoryLink.firstChild)
  }
}

function createLink(filePath, referer) {
  const path = require('path')

  var file = path.basename(filePath)
  var id = referer === file ? 'directory-current-page' : ''
  var innerHTML = '<span class="icon ' + ensureIconName(filePath) + '"></span>' + file + '</span>'
  var link = createElement('span', id, 'nav-group-item', innerHTML)
  link.setAttribute('href', path.normalize(filePath))
  return link
}

function ensureIconName(filePath) {
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    return "icon-folder"
  }

  return "icon-picture"
}

function findCurrent() {
  var current = document.getElementById('directory-current-page')
  if (current) {
    return current
  }

  current = directoryLink.firstChild
  if (!current) return

  current.id = 'directory-current-page'
  return current
}

function clickFileLink(filePath) {
  const fs = require('fs')
  var stats = fs.lstatSync(filePath)

  if (stats.isDirectory()) {
    functions.jump(filePath)
  }
}

function scrollTo(element) {
  var top = element.getBoundingClientRect().top
  sideBar.scrollTop = top
}

function scrollToRelative(from, to) {
  var fromTop = from.getBoundingClientRect().top
  var toTop = to.getBoundingClientRect().top
  sideBar.scrollTop += toTop - fromTop
}

/////////////

class FileNavigator {

  constructor(transport) {
    this.transport = transport
  }

  // change to select a file
  prefiousSibling() {
    var current = findCurrent()
    if (!current) return
    var previous = current.previousSibling
    if (!previous) return
    this.select(previous)
    scrollToRelative(current, previous)
  }

  nextSibling() {
    var current = findCurrent()
    if (!current) return
    var next = current.nextSibling
    if (!next) return
    this.select(next)
    scrollToRelative(current, next)
  }

  upDirectory() {
    var href = directoryContent.getAttribute("href")
    functions.jump(href + '/..', directoryContentInner.innerHTML)
  }

  downDirectory() {
    var current = findCurrent()
    clickFileLink(current.getAttribute('href'))
  }

  select(element) {
    var current = findCurrent()
    current.id = ''
    element.id = 'directory-current-page'
    this.transport.on({type: 'selectFile', data: element})
  }

  selectRandom() {
    var nodes = []
    var children = directoryLink.childNodes
    for (var i in children) {
      var element = children[i]
      if (element.id != 'directory-current-page') {
        nodes.push(element)
      }
    }
    this.select(_.sample(nodes))
  }

  render(data) {
    clearContent()
    this.transport.on({type: 'changeDirectory', data: data})

    for (var i in data.files) {
      var filePath = data.files[i]

      var link = createLink(filePath, data.referer)
      var self = this
      link.addEventListener("click", function() {
        self.select(this)
        clickFileLink(this.getAttribute('href'))
      }, false)
      directoryLink.appendChild(link)
    }

    var current = findCurrent()
    if (current) {
      // render media
      this.select(current)
      // scroll
      scrollTo(current)
    }
  }
}

module.exports = FileNavigator
