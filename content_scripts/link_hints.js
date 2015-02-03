"use strict";
// Generated by CoffeeScript 1.8.0
(typeof exports !== "undefined" && exports !== null ? exports : window).LinkHints = {
  CONST: {
    // focused: 1; new tab: 2; queue: 64; job: 128; job-allow-queue: 128 + 32
    OPEN_IN_CURRENT_TAB: 0, // also 1
    OPEN_IN_NEW_BG_TAB: 2,
    OPEN_IN_NEW_FG_TAB: 1 + 2,
    OPEN_WITH_QUEUE: 2 + 64,
    OPEN_FG_WITH_QUEUE: 1 + 2 + 64,
    OPEN_INCOGNITO: 128 + 0,
    DOWNLOAD_LINK: 128 + 32 + 0,
    COPY_LINK_URL: 128 + 32 + 1,
    COPY_LINK_TEXT: 128 + 32 + 2,
    HOVER: 128 + 32 + 3
  },
  spanWrap: null,
  numberToHintString: null,
  hintMarkerContainingDiv: null,
  hintMarkers: [],
  linkActivator: null,
  mode: 0,
  delayMode: false,
  keyStatus: {
    tab: false
  },
  handlerId: 0,
  initScrollY: 0,
  initScrollX: 0,
  markerMatcher: null,
  init: function() {
    this.setMarkerMatcher(settings.values.filterLinkHints);
    this.filterHints.spanWrap = this.alphabetHints.spanWrap = this.spanWrap;
    this.filterHints.numberToHintString = this.alphabetHints.numberToHintString = this.numberToHintString;
  },
  setMarkerMatcher: function(useFilterLinkHints) {
    this.markerMatcher = useFilterLinkHints ? this.filterHints : this.alphabetHints;
  },
  isActive: false,
  clickableElementsXPath: DomUtils.makeXPath(["a", "area[@href]", "textarea",
    "button", "select", "input[not(@type='hidden' or @disabled or @readonly)]",
    "*[@onclick or @tabindex or @role='link' or @role='button' or contains(@class, 'button') or @contenteditable='' or translate(@contenteditable, 'TRUE', 'true')='true']"
    ]),
  activateModeToOpenInNewTab: function() {
    return this.activateMode(this.CONST.OPEN_IN_NEW_BG_TAB);
  },
  activateModeToOpenInNewForegroundTab: function() {
    return this.activateMode(this.CONST.OPEN_IN_NEW_FG_TAB);
  },
  activateModeToCopyLinkUrl: function() {
    return this.activateMode(this.CONST.COPY_LINK_URL);
  },
  activateModeToCopyLinkText: function() {
    return this.activateMode(this.CONST.COPY_LINK_TEXT);
  },
  activateModeWithQueue: function(mode) {
    return this.activateMode(mode || this.CONST.OPEN_WITH_QUEUE);
  },
  activateModeToOpenIncognito: function() {
    return this.activateMode(this.CONST.OPEN_INCOGNITO);
  },
  activateModeToDownloadLink: function() {
    return this.activateMode(this.CONST.DOWNLOAD_LINK);
  },
  activateModeToHover: function() {
    return this.activateMode(this.CONST.HOVER);
  },
  activateMode: function(mode) {
    if (this.isActive || !document.documentElement) {
      return;
    }
    this.setOpenLinkMode(mode || 0);
    this.hintMarkers = this./**oldGetVisibleClickableElements/*/ //
      getVisibleClickableElements/**/().map(this.createMarkerFor);
    this.markerMatcher.fillInMarkers(this.hintMarkers);
    this.isActive = true;
    this.initScrollX = window.scrollX;
    this.initScrollY = window.scrollY;
    this.hintMarkerContainingDiv = DomUtils.addElementList(this.hintMarkers, {
      id: "vimHMC",
      className: "vimB vimR"
    });
    this.ensureRightBottom();
    this.hintMarkerContainingDiv.style.left = window.scrollX + "px";
    this.hintMarkerContainingDiv.style.top = window.scrollY + "px";
    this.handlerId = handlerStack.push({
      keydown: this.onKeyDownInMode.bind(this),
      keypress: function() {
        return false;
      },
      keyup: function() {
        return false;
      }
    });
  },
  setOpenLinkMode: function(mode) {
    switch (mode >= 128 ? ((mode | 64) ^ 64) : mode) {
    case this.CONST.OPEN_IN_NEW_BG_TAB:
      HUD.show("Open a link in new tab");
      break;
    case this.CONST.OPEN_IN_NEW_FG_TAB: 
      HUD.show("Open in new active tab");
      break;
    case this.CONST.OPEN_WITH_QUEUE:
      HUD.show("Open multiple links");
      break;
    case this.CONST.OPEN_FG_WITH_QUEUE:
      HUD.show("activate link and hold on");
      break;
    case this.CONST.COPY_LINK_URL:
      HUD.show(mode >= 192 ? "Copy link URL one by one" : "Copy link URL to Clipboard");
      this.linkActivator = this.linkActivator || function(link) {
        var str = (link.getAttribute("data-vim-url") || link.href).trim() || "";
        if (!str) return;
        str = Utils.correctSpace(Utils.decodeURI(str));
        mainPort.postMessage({
          handler: "copyToClipboard",
          data: str
        });
      };
      break;
    case this.CONST.COPY_LINK_TEXT:
      HUD.show(mode >= 192 ? "Copy link text one by one" : "Copy link text to Clipboard");
      this.linkActivator = this.linkActivator || function(link) {
        var str = (link.getAttribute("data-vim-text") || "").trim() || link.innerText.trim();
        str = str || Utils.decodeTextFromHtml(link.innerHTML).trim() || link.title.trim();
        if (!str) return;
        str = Utils.correctSpace(str);
        mainPort.postMessage({
          handler: "copyToClipboard",
          data: str
        });
      };
      break;
    case this.CONST.OPEN_INCOGNITO:
      HUD.show("Open link in incognito window");
      this.linkActivator = this.linkActivator || function(link) {
        mainPort.postMessage({
          handler: 'openUrlInIncognito',
          url: link.href
        });
      };
      break;
    case this.CONST.DOWNLOAD_LINK:
      HUD.show(mode >= 192 ? "Download multiple links" : "Download link");
      this.linkActivator = this.linkActivator || function(link) {
        DomUtils.simulateClick(link, {
          altKey: true,
          ctrlKey: false,
          metaKey: false,
          shiftKey: false
        });
      };
      break;
    case this.CONST.HOVER:
      HUD.show(mode >= 192 ? "hover objects continuously" : "hover selected");
      this.linkActivator = this.linkActivator || function(link) {
        DomUtils.simulateHover(link);
      };
      break;
    default:
      HUD.show("Open link in current tab");
      mode != 1 && (mode = 0);
      break;
    }
    if (!this.linkActivator && mode < 128) {
      this.linkActivator = function(link) {
        DomUtils.simulateClick(link, {
          altKey: false,
          ctrlKey: (this.mode & 2) === 2 && KeyboardUtils.platform !== "Mac",
          metaKey: (this.mode & 2) === 2 && KeyboardUtils.platform === "Mac",
          shiftKey: (this.mode & 3) === 3
        });
      };
    }
    this.mode = mode;
  },
  createMarkerFor: function(link) {
    var marker = document.createElement("div");
    marker.className = "vimB vimI vimLHi vimLH";
    marker.clickableItem = link.element;
    marker.style.left = link.rect[0] + "px";
    marker.style.top = link.rect[1] + "px";
    marker.rect = link.rect;
    return marker;
  },
  ensureRightBottom: function() {
    var ww, wh, _ref = this.hintMarkers, _i = _ref.length, el, temp, pos, str;
    if (_i <= 0) {
      return;
    }
    ww = window.innerWidth, wh = window.innerHeight - 13;
    str = wh + "px";
    while (0 <= --_i) {
      el = _ref[_i];
      pos = el.innerText.length;
      pos = ww - (pos <= 3 ? pos * 10 + 4 : 40);
      if (el.rect[0] > pos) {
        el.style.left = pos + "px";
      }
      if (el.rect[1] > wh) {
        el.style.top = str;
      }
    }
  },
  GetVisibleClickable: (function() {
    var hashRegex = /^#/, quoteRegex = /"/g;
    return function(element) {
      var clientRect, isClickable, s;
      switch (element.tagName.toLowerCase()) {
      case "a": isClickable = true; break;
      case "textarea": isClickable = !element.disabled && !element.readOnly; break;
      case "input":
        isClickable = !(element.type === "hidden" || element.disabled //
          || (element.readOnly && DomUtils.isSelectable(element)));
        break;
      case "button": case "select": isClickable = !element.disabled; break;
      case "script": case "link": case "style":
        return;
      case "img":
        var imgClientRects, map;
        if ((s = element.useMap) && (imgClientRects = element.getClientRects()).length > 0) {
          if (map = document.querySelector('map[name="' + s.replace(hashRegex, "").replace(quoteRegex, '\\"') + '"]')) {
            DomUtils.getClientRectsForAreas(this, imgClientRects[0], map.getElementsByTagName("area"));
          }
        }
        // no "break;"
      default: 
        /* if ( ((s = element.getAttribute("aria-hidden"  )) != null && (s ? s.toLowerCase() === "true" : true)) //
          || ((s = element.getAttribute("aria-disabled")) != null && (s ? s.toLowerCase() === "true" : true)) ) {
          return;
        } */
        if ( element.onclick //
          /* || ((s = element.className) && s.toLowerCase().indexOf("button") >= 0) */
          || ((s = element.getAttribute("role")) && (s = s.toLowerCase(), s === "button" || s === "link")) //
          || ((s = element.getAttribute("contentEditable")) != null && (s ? (s = s.toLowerCase(), s === "contenteditable" || s === "true") : true)) //
          ) {
          isClickable = true;
        }
        else {
          if (s = element.getAttribute("jsaction")) {
            var jsactionRules = s.split(";"), _i = jsactionRules.length;
            while (0 <= --_i) {
              s = jsactionRules[_i].trim();
              if (s.startsWith("click:") || (s !== "none" && s.indexOf(":") === -1)) {
                isClickable = true;
                break;
              }
            }
          }
          if (!isClickable) {
            s = element.getAttribute("tabindex");
            if (s == null || !(s === "" || parseInt(s) >= 0)) {
              return; // work around
            }
          }
        }
        break;
      }
      if (clientRect = DomUtils.getVisibleClientRect(element)) {
        this.push({
          element: element,
          rect: clientRect,
          notSecond: isClickable ? true : false
        });
      }
    };
  })(),
  getVisibleClickableElements: function() {
    var output = [], visibleElements = [], visibleElement, rects, rects2, _len, _i;
    output.forEach.call(document.documentElement.getElementsByTagName("*") //
      , this.GetVisibleClickable.bind(visibleElements));
    visibleElements.reverse();
    for (_len = visibleElements.length; 0 <= --_len; ) {
      visibleElement = visibleElements[_len];
      rects = [visibleElement.rect];
      for (_i = 0; _i < _len; _i++) {
        rects.forEach(VRect.SubtractSequence.bind(rects2 = [], visibleElements[_i].rect));
        if ((rects = rects2).length === 0) {
          break;
        }
      }
      if (rects.length > 0) {
        output.push({
          element: visibleElement.element,
          rect: rects[0]
        });
      } else if (visibleElement.notSecond) {
        output.push({
          element: visibleElement.element,
          rect: visibleElement.rect
        });
      }
    }
    return output;
  },
  oldGetVisibleClickableElements: function() {
    var c, rect, element, img, cr0, map, rect, resultSet, visibleElements, _i, _ref;
    resultSet = DomUtils.evaluateXPath(this.clickableElementsXPath, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
    visibleElements = [];
    for (_i = 0, _ref = resultSet.snapshotLength; _i < _ref; ++_i) {
      element = resultSet.snapshotItem(_i);
      rect = DomUtils.getVisibleClientRect(element, rect);
      if (rect) {
        visibleElements.push({
          element: element,
          rect: rect
        });
      }
      else if (element.localName === "area") {
        if ( (map = element.parentElement)
          && (img = document.querySelector("img[usemap='#" + map.getAttribute("name") + "']"))
          && (cr0 = img.getClientRects()[0]) ) {
        } else {
          continue;
        }
        c = element.coords.split(',').map(parseInt);
        visibleElements.push({
          element: element,
          rect: [cr0[0].left + c[0], cr0[0].top + c[1], cr0[0].left + c[2], cr0[0].top + c[3]]
        });
      }
    }
    return visibleElements;
  },
  onKeyDownInMode: function(event) {
    var delay, keyResult, linksMatched, _i, _len, _j, _ref, _len2;
    if (this.delayMode) {
      return false;
    }
    if (KeyboardUtils.isEscape(event)) {
      this.deactivateMode();
      return false;
    } else if (event.keyCode > keyCodes.f1 && event.keyCode <= keyCodes.f12) {
      return true;
    }
    keyResult = this.markerMatcher.matchHintsByKey(this.hintMarkers, event, this.keyStatus);
    linksMatched = keyResult.linksMatched;
    delay = keyResult.delay || 0;
    if (linksMatched.length === 0) {
      this.deactivateMode();
      return false;
    }
    if (event.keyCode === keyCodes.shiftKey) {
      if (this.mode < 128) {
        this.setOpenLinkMode((this.mode | 1) ^ (this.mode < 64 ? 3 : 67));
      }
    } else if (event.keyCode === keyCodes[keyCodes.modifier]) {
      if (this.mode < 128) {
        this.setOpenLinkMode((this.mode | 2) ^ 1);
      }
    } else if (event.keyCode === keyCodes.altKey) {
      if ((this.mode | 64) >= 160) {
        this.setOpenLinkMode(this.mode ^ 64);
      } else if (this.mode < 128) {
        this.setOpenLinkMode((this.mode | 2) ^ 64);
      }
    }
    if (linksMatched.length === 1) {
      if (linksMatched[0]) {
        this.activateLink(linksMatched[0], delay);
      }
    } else {
      for (_i = 0, linksMatched = this.hintMarkers, _len = linksMatched.length; _i < _len; _i++) {
        linksMatched[_i].style.display = "none";
      }
      delay = this.markerMatcher.hintKeystrokeQueue.length;
      if (this.keyStatus.tab) {
        for (_i = 0, linksMatched = keyResult.linksMatched, _len = linksMatched.length; _i < _len; _i++) {
          linksMatched[_i].style.display = "";
          for (_j = 0, _ref = linksMatched[_i].childNodes, _len2 = Math.min(_ref.length, delay); _j < _len2; ++_j) {
            _ref[_j].classList.remove("vimMC");
          }
        }
      } else {
        for (_i = 0, linksMatched = keyResult.linksMatched, _len = linksMatched.length; _i < _len; _i++) {
          linksMatched[_i].style.display = "";
          for (_j = 0, _ref = linksMatched[_i].childNodes, _len2 = _ref.length; _j < _len2; ++_j) {
            if (_j < delay) {
              _ref[_j].classList.add("vimMC");
            } else {
              _ref[_j].classList.remove("vimMC");
            }
          }
        }
      }
    }
    return false;
  },
  activateLink: function(matchedLink, delay) {
    var clickEl = matchedLink.clickableItem, temp, rect;
    this.delayMode = true;
    if (DomUtils.isSelectable(clickEl)) {
      DomUtils.simulateSelect(clickEl);
      this.deactivateMode(delay, function() {
        this.delayMode = false;
      });
    } else {
      if (clickEl.nodeName.toLowerCase() === "input" && clickEl.type !== "button") {
        clickEl.focus();
      }
      if (clickEl.classList.contains("vimOIUrl")) {
        var parEl = clickEl;
        do {
          parEl = parEl.parentElement;
        } while (parEl && !parEl.classList.contains("vimOItem"));
        if (parEl) {
          rect = VRect.copy(parEl.getClientRects()[0]);
          rect[0] += 10, rect[2] -= 12, rect[3] -= 3;
        }
      }
      if (!rect) {
        temp = [];
        this.GetVisibleClickable.call(temp, clickEl);
        if (temp.length === 1) {
          rect = temp[0].rect;
          temp = null;
        } else {
          temp = null;
          rect = matchedLink.rect;
          var dx = window.scrollX - this.initScrollX, dy = window.scrollY - this.initScrollY;
          rect[0] -= dx;
          rect[2] -= dx;
          rect[1] -= dy;
          rect[3] -= dy;
        }
      }
      DomUtils.flashVRect(rect);
      this.linkActivator(clickEl);
      if ((this.mode & 64) === 64) {
        var mode = this.mode, linkActivator = this.linkActivator;
        this.deactivateMode(delay, function() {
          this.delayMode = false;
          this.linkActivator = linkActivator;
          this.activateModeWithQueue(mode);
        });
      } else {
        this.deactivateMode(delay, function() {
          this.delayMode = false;
        });
      }
    }
  },
  deactivate2: function(callback) {
    if (this.markerMatcher.deactivate) {
      this.markerMatcher.deactivate();
    }
    this.linkActivator = null;
    this.hintMarkers = [];
    if (this.hintMarkerContainingDiv) {
      DomUtils.removeNode(this.hintMarkerContainingDiv);
      this.hintMarkerContainingDiv = null;
    }
    this.keyStatus.tab = false;
    handlerStack.remove(this.handlerId);
    this.handlerId = 0;
    HUD.hide();
    this.mode = 0;
    this.isActive = false;
    if (callback) {
      callback.call(this);
    }
  },
  deactivateMode: function(delay, callback) {
    if (delay) {
      setTimeout(this.deactivate2.bind(this, callback), delay);
    } else {
      this.deactivate2(callback);
    }
  }
};

(typeof exports !== "undefined" && exports !== null ? exports : window).LinkHints.alphabetHints = {
  hintKeystrokeQueue: [],
  spanWrap: null,
  numberToHintString: null,
  logXOfBase: function(x, base) {
    return Math.log(x) / Math.log(base);
  },
  fillInMarkers: function(hintMarkers) {
    var hintStrings, idx, marker, _len;
    hintStrings = this.hintStrings(hintMarkers.length);
    for (idx = 0, _len = hintMarkers.length; idx < _len; ++idx) {
      marker = hintMarkers[idx];
      marker.hintString = hintStrings[idx];
      marker.innerHTML = this.spanWrap(marker.hintString.toUpperCase());
    }
    return hintMarkers;
  },
  hintStrings: function(linkCount) {
    var digitsNeeded, hintStrings, i, linkHintCharacters, longHintCount, shortHintCount, start, _ref;
    linkHintCharacters = settings.values.linkHintCharacters || "";
    digitsNeeded = Math.ceil(this.logXOfBase(linkCount, linkHintCharacters.length));
    shortHintCount = Math.floor((Math.pow(linkHintCharacters.length, digitsNeeded) - linkCount) / linkHintCharacters.length);
    longHintCount = linkCount - shortHintCount;
    hintStrings = [];
    if (digitsNeeded > 1) {
      for (i = 0; i < shortHintCount; ++i) {
        hintStrings.push(this.numberToHintString(i, linkHintCharacters, digitsNeeded - 1));
      }
    }
    start = shortHintCount * linkHintCharacters.length;
    for (i = start, _ref = start + longHintCount; i < _ref; ++i) {
      hintStrings.push(this.numberToHintString(i, linkHintCharacters, digitsNeeded));
    }
    return this.shuffleHints(hintStrings, linkHintCharacters.length);
  },
  shuffleHints: function(hints, characterSetLength) {
    var buckets, result, i, _len;
    buckets = new Array(characterSetLength);
    for (i = 0, _len = characterSetLength; i < _len; ++i) {
      buckets[i] = [];
    }
    for (i = 0, _len = hints.length; i < _len; ++i) {
      buckets[i % characterSetLength].push(hints[i]);
    }
    result = [];
    for (i = 0, _len = characterSetLength; i < _len; ++i) {
      result = result.concat(buckets[i]);
    }
    return result;
  },
  matchHintsByKey: function(hintMarkers, event, keyStatus) {
    var keyChar, key = event.keyCode;
    if (key === keyCodes.tab) {
      if (this.hintKeystrokeQueue.length === 0) {
        return { linksMatched: [ null ] };
      }
      keyStatus.tab = !keyStatus.tab;
    } else {
      if (keyStatus.tab) {
        this.hintKeystrokeQueue = [];
        keyStatus.tab = false;
      }
      if (key === keyCodes.backspace || key === keyCodes.deleteKey || key === keyCodes.f1) {
        if (!this.hintKeystrokeQueue.pop()) {
          return { linksMatched: [] };
        }
      } else if (keyChar = KeyboardUtils.getKeyChar(event).toLowerCase()) {
        this.hintKeystrokeQueue.push(keyChar);
      } else {
        return { linksMatched: [null] };
      }
    }
    keyChar = this.hintKeystrokeQueue.join("");
    return {
      linksMatched: hintMarkers.filter(keyStatus.tab ? function(linkMarker) {
        return ! linkMarker.hintString.startsWith(keyChar);
      } : function(linkMarker) {
        return linkMarker.hintString.startsWith(keyChar);
      })
    };
  },
  deactivate: function() {
    this.hintKeystrokeQueue = [];
  }
};

(typeof exports !== "undefined" && exports !== null ? exports : window).LinkHints.filterHints = {
  hintKeystrokeQueue: [],
  linkTextKeystrokeQueue: [],
  labelMap: {},
  spanWrap: null,
  numberToHintString: null,
  generateLabelMap: function() {
    var forElement, label, labelText, labels, _i, _len;
    labels = document.querySelectorAll("label");
    for (_i = 0, _len = labels.length; _i < _len; _i++) {
      label = labels[_i];
      forElement = label.getAttribute("for");
      if (forElement) {
        labelText = label.textContent.trim();
        if (labelText[labelText.length - 1] === ":") {
          labelText = labelText.substring(0, labelText.length - 1);
        }
        this.labelMap[forElement] = labelText;
      }
    }
  },
  generateHintString: function(linkHintNumber) {
    return (this.numberToHintString(linkHintNumber + 1, settings.values.linkHintNumbers || "")).toUpperCase();
  },
  generateLinkText: function(element) {
    var linkText, nodeName, showLinkText;
    linkText = "";
    showLinkText = false;
    nodeName = element.nodeName.toLowerCase();
    if (nodeName === "input") {
      if (this.labelMap[element.id]) {
        linkText = this.labelMap[element.id];
        showLinkText = true;
      } else if (element.type !== "password") {
        linkText = element.value;
        if (!linkText && element.placeholder) {
          linkText = element.placeholder;
        }
      }
    } else if (nodeName === "a" && !element.textContent.trim() && element.firstElementChild && element.firstElementChild.nodeName.toLowerCase() === "img") {
      linkText = element.firstElementChild.alt || element.firstElementChild.title;
      if (linkText) {
        showLinkText = true;
      }
    } else {
      linkText = element.textContent || element.innerHTML;
    }
    return {
      text: linkText,
      show: showLinkText
    };
  },
  renderMarker: function(marker) {
    marker.innerHTML = marker.showLinkText ? this.spanWrap(marker.hintString + ": " + marker.linkText) : this.spanWrap(marker.hintString);
  },
  fillInMarkers: function(hintMarkers) {
    var idx, linkTextObject, marker, _i, _len;
    this.generateLabelMap();
    for (idx = _i = 0, _len = hintMarkers.length; _i < _len; idx = ++_i) {
      marker = hintMarkers[idx];
      marker.hintString = this.generateHintString(idx);
      linkTextObject = this.generateLinkText(marker.clickableItem);
      marker.linkText = linkTextObject.text;
      marker.linkTextLower = linkTextObject.text.toLowerCase();
      marker.showLinkText = linkTextObject.show;
      this.renderMarker(marker);
    }
    return hintMarkers;
  },
  matchHintsByKey: function(hintMarkers, event, keyStatus) {
    var key = event.keyCode, keyChar, userIsTypingLinkText = false, linksMatched;
    if (key === keyCodes.tab) {
      if (this.hintKeystrokeQueue.length === 0) {
        return { linksMatched: [ null ] };
      }
      keyStatus.tab = !keyStatus.tab;
    } else if (key === keyCodes.enter) {
      keyStatus.tab = false;
      for (var marker, _i = 0, _len = hintMarkers.length; _i < _len; _i++) {
        marker = hintMarkers[_i];
        if (marker.style.display !== "none") {
          return {
            linksMatched: [marker]
          };
        }
      }
      return { linksMatched: [null] };
    } else {
      if (keyStatus.tab) {
        this.hintKeystrokeQueue = [];
        keyStatus.tab = false;
      }
      if (key === keyCodes.backspace || key === keyCodes.deleteKey || key === keyCodes.f1) {
        if (!this.hintKeystrokeQueue.pop() && !this.linkTextKeystrokeQueue.pop()) {
          return {
            linksMatched: []
          };
        }
      } else if (keyChar = KeyboardUtils.getKeyChar(event).toLowerCase()) {
        if ((settings.values.linkHintNumbers || "").indexOf(keyChar) >= 0) {
          this.hintKeystrokeQueue.push(keyChar);
        } else {
          this.hintKeystrokeQueue = [];
          this.linkTextKeystrokeQueue.push(keyChar);
          userIsTypingLinkText = true;
        }
      } else {
        return { linksMatched: [null] };
      }
    }
    keyChar = this.hintKeystrokeQueue.join("");
    linksMatched = this.filterLinkHints(hintMarkers).filter(keyStatus.tab ? function(linkMarker) {
      return ! linkMarker.hintString.startsWith(keyChar);
    } : function(linkMarker) {
      return linkMarker.hintString.startsWith(keyChar);
    });
    return {
      linksMatched: linksMatched,
      delay: (linksMatched.length === 1 && userIsTypingLinkText) ? 200 : 0
    };
  },
  filterLinkHints: function(hintMarkers) {
    var linkMarker, linkSearchString, linksMatched, oldHintString, _i, _len, doLinkSearch;
    linksMatched = [];
    linkSearchString = this.linkTextKeystrokeQueue.join("");
    doLinkSearch = linkSearchString.length > 0;
    for (_i = 0, _len = hintMarkers.length; _i < _len; _i++) {
      linkMarker = hintMarkers[_i];
      if (doLinkSearch && linkMarker.linkTextLower.indexOf(linkSearchString) === -1) {
        linkMarker.filtered = true;
      } else {
        linkMarker.filtered = false;
        oldHintString = linkMarker.hintString;
        linkMarker.hintString = this.generateHintString(linksMatched.length);
        if (linkMarker.hintString !== oldHintString) {
          this.renderMarker(linkMarker);
        }
        linksMatched.push(linkMarker);
      }
    }
    return linksMatched;
  },
  deactivate: function() {
    this.hintKeystrokeQueue = [];
    this.linkTextKeystrokeQueue = [];
    this.labelMap = {};
  }
};

(typeof exports !== "undefined" && exports !== null ? exports : window).LinkHints.spanWrap = function(hintString) {
  for (var _i = 0, _j = -1, _len = hintString.length, innerHTML = new Array(_len * 3); _i < _len; _i++) {
    innerHTML[++_j] = "<span class=\"vimB vimI\">";
    innerHTML[++_j] = hintString[_i];
    innerHTML[++_j] = "</span>";
  }
  return innerHTML.join("");
};

(typeof exports !== "undefined" && exports !== null ? exports : window).LinkHints //
.numberToHintString = function(number, characterSet, numHintDigits) {
  var base, hintString, leftLength, remainder;
  if (numHintDigits == null) {
    numHintDigits = 0;
  }
  base = characterSet.length;
  hintString = [];
  remainder = 0;
  while (true) {
    remainder = number % base;
    hintString.unshift(characterSet[remainder]);
    number -= remainder;
    number /= Math.floor(base);
    if (!(number > 0)) {
      break;
    }
  }
  leftLength = numHintDigits - hintString.length;
  while (0 <= --leftLength) {
    hintString.unshift(characterSet[0]);
  }
  return hintString.join("");
};
