// ==UserScript==
// @name         Arconai TV
// @description  Route video stream through HLS-Proxy and transfer to player on WebCast-Reloaded external website.
// @version      0.1.0
// @match        *://*.arconaitv.us/*
// @icon         https://www.arconaitv.us/favicon.ico
// @run-at       document-idle
// @homepage     https://github.com/warren-bank/crx-Arconai-TV
// @supportURL   https://github.com/warren-bank/crx-Arconai-TV/issues
// @downloadURL  https://github.com/warren-bank/crx-Arconai-TV/raw/greasemonkey-userscript/greasemonkey-userscript/Arconai-TV.user.js
// @updateURL    https://github.com/warren-bank/crx-Arconai-TV/raw/greasemonkey-userscript/greasemonkey-userscript/Arconai-TV.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

var payload = function(){
  const process_video_url = (hls_url) => {
    let encoded_hls_url, webcast_reloaded_base, webcast_reloaded_url

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/proxy.html#/watch/",
      "http":  "http://gitcdn.link/cdn/warren-bank/crx-webcast-reloaded/gh-pages/external_website/proxy.html#/watch/"
    }
    webcast_reloaded_base = (hls_url.toLowerCase().indexOf('https:') === 0)
                              ? webcast_reloaded_base.https
                              : webcast_reloaded_base.http
    webcast_reloaded_url  = webcast_reloaded_base + encoded_hls_url

    top.location = webcast_reloaded_url
  }

  const videojs = () => {
    return {
      src: (video) => {
        if (video.src && (video.type.toLowerCase() === 'application/x-mpegurl')) {
          process_video_url(video.src)
        }
      },
      play: () => {}
    }
  }

  const process_eval = () => {
    try {
      const $script = document.querySelector('.video-container > script').innerText.replace(/[\r\n]+/g, ' ').replace(/^.*?(eval)/, '$1').trim()
      eval($script)
    }
    catch(e) {}
  }

  process_eval()
}

var inject_payload = function(){
  var inline, script, head

  inline = document.createTextNode(
    '(' + payload.toString() + ')()'
  )

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.getElementsByTagName('head')[0]
  head.appendChild(script)
}

if (document.readyState === 'complete'){
  inject_payload()
}
else {
  document.onreadystatechange = function(){
    if (document.readyState === 'complete'){
      inject_payload()
    }
  }
}
