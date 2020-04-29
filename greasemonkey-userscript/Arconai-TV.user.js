// ==UserScript==
// @name         Arconai TV
// @description  Transfer video stream to alternate video players: ExoAirPlayer or WebCast-Reloaded external website (routed through HLS-Proxy).
// @version      0.1.1
// @match        *://arconaitv.us/*
// @match        *://*.arconaitv.us/*
// @icon         https://www.arconaitv.us/favicon.ico
// @run-at       document-idle
// @homepage     https://github.com/warren-bank/crx-Arconai-TV/tree/greasemonkey-userscript
// @supportURL   https://github.com/warren-bank/crx-Arconai-TV/issues
// @downloadURL  https://github.com/warren-bank/crx-Arconai-TV/raw/greasemonkey-userscript/greasemonkey-userscript/Arconai-TV.user.js
// @updateURL    https://github.com/warren-bank/crx-Arconai-TV/raw/greasemonkey-userscript/greasemonkey-userscript/Arconai-TV.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// https://www.chromium.org/developers/design-documents/user-scripts

var user_options = {
  "script_injection_delay_ms":   0,
  "open_in_webcast_reloaded":    false,
  "open_in_exoairplayer_sender": true
}

var payload = function(){
  const process_video_url = (hls_url) => {
    let encoded_hls_url, webcast_reloaded_base, webcast_reloaded_url
    let encoded_referer_url, exoairplayer_base, exoairplayer_url

    encoded_hls_url       = encodeURIComponent(encodeURIComponent(btoa(hls_url)))
    webcast_reloaded_base = {
      "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
      "http":  "http://webcast-reloaded.surge.sh/index.html"
    }
    webcast_reloaded_base = (hls_url.toLowerCase().indexOf('https:') === 0)
                              ? webcast_reloaded_base.https
                              : webcast_reloaded_base.http
    webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_hls_url

    encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(top.location.href)))
    exoairplayer_base     = 'http://webcast-reloaded.surge.sh/airplay_sender.html'
    exoairplayer_url      = exoairplayer_base  + '#/watch/' + encoded_hls_url + '/referer/' + encoded_referer_url

    if (window.open_in_webcast_reloaded && webcast_reloaded_url) {
      top.location = webcast_reloaded_url
      return
    }

    if (window.open_in_exoairplayer_sender && exoairplayer_url) {
      top.location = exoairplayer_url
      return
    }
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

var get_hash_code = function(str){
  var hash, i, char
  hash = 0
  if (str.length == 0) {
    return hash
  }
  for (i = 0; i < str.length; i++) {
    char = str.charCodeAt(i)
    hash = ((hash<<5)-hash)+char
    hash = hash & hash  // Convert to 32bit integer
  }
  return Math.abs(hash)
}

var inject_function = function(_function){
  var inline, script, head

  inline = _function.toString()
  inline = '(' + inline + ')()' + '; //# sourceURL=crx_extension.' + get_hash_code(inline)
  inline = document.createTextNode(inline)

  script = document.createElement('script')
  script.appendChild(inline)

  head = document.head
  head.appendChild(script)
}

var inject_options = function(){
  var _function = `function(){
    window.open_in_webcast_reloaded    = ${user_options['open_in_webcast_reloaded']}
    window.open_in_exoairplayer_sender = ${user_options['open_in_exoairplayer_sender']}
  }`
  inject_function(_function)
}

var inject_options_then_function = function(_function){
  inject_options()
  inject_function(_function)
}

if (user_options['open_in_webcast_reloaded'] || user_options['open_in_exoairplayer_sender']){
  setTimeout(
    function(){
      inject_options_then_function(payload)
    },
    user_options['script_injection_delay_ms']
  )
}
