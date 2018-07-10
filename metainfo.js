// ==UserScript==
// @name         MetaInfo
// @namespace    https://orlov.cv.ua
// @version      0.1
// @description  Shows information from meta tags of the page
// @author       Vitaliy Orlov
// @match        *://*/*
// @exclude      https://github.com/*
// @exclude      https://*google.*/*
// @grant GM_setValue
// @grant GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) return false;

    class Z {
        constructor(el){
            this.el = ((typeof el != 'undefined') && el) ? el : document.createElement(null);
            return this;
        }

        static create(tagName) {
            return new Z(document.createElement(tagName));
        }

        static findAll(path) {
            var els = document.querySelectorAll(path);
            var ret = [];
            if (els.length) {
                for(var i=0; i<els.length; i++) {
                    ret.push(new Z(els[i]))
                }
            }
            return ret;
        }

        static findOne(path) {
            return new Z(document.querySelector(path));
        }

        static find(path) {
            return this.findOne(path);
        }

        attr(name, val){
            if (typeof val == 'undefined') {
                return this.el.getAttribute(name);
            } else {
                this.el.setAttribute(name, val);
                return this;
            }
        }

        append(innerHTML) {
            this.el.innerHTML += innerHTML;
            return this;
        }

        prepend(innerHTML) {
            this.el.innerHTML = innerHTML + this.el.innerHTML;
            return this;
        }

        html(innerHTML) {
            if (typeof innerHTML == 'undefined') {
                return this.el.innerHTML;
            } else {
                this.el.innerHTML = innerHTML;
            }
            return this;
        }

        text(innerText) {
            if (typeof innerText == 'undefined') {
                return this.el.innerText;
            } else {
                this.el.innerHTML = (new Z()).html(innerText).text();
            }
            return this;
        }

        on(eventsEnum, func, useCapture){
            var events = eventsEnum.split(' ');
            for (var i=0; i<events.length; i++) {
                if(events[i].trim().length){
                    this.el.addEventListener(events[i].trim(), func, useCapture);
                }
            }
            return this;
        }

        static ready(func, timeout) {
            var domReadyFunc = function(){
                document.removeEventListener( "DOMContentLoaded", domReadyFunc, false );
                if (typeof timeout != 'undefined') {
                    setTimeout(func, timeout);
                } else {
                    func();
                }
            };
            document.addEventListener("DOMContentLoaded", domReadyFunc, false );
        }

        addClass(className){this.el.classList.add(className);return this;}
        removeClass(className){this.el.classList.remove(className);return this;}
        toggleClass(className){this.el.classList.toggle(className);return this;}
        hasClass(className){return this.el.classList.contains(className);}
    };

    // ==============================================

    var title = document.title;
    var description = Z.find('meta[name="description"]').attr("content");
    var keywords = Z.find('meta[name="keywords"]').attr("content");
    var canonical = Z.find('link[rel="canonical"]').attr("href");
    var amphtml = Z.find('link[rel="amphtml"]').attr("href");
    var charset = Z.find('meta[charset]').attr("charset");
    if (!charset) charset = Z.find('meta[http-equiv]').attr("content");
    var viewport = Z.find('meta[name="viewport"]').attr("content");
    var robots = Z.find('meta[name="robots"]').attr("content");
    if (robots) robots = robots.replace('noindex', '<span class="metainfo_redhl">noindex</span>').replace('nofollow', '<span class="metainfo_redhl">nofollow</span>');
    var googlebot = Z.find('meta[name="googlebot"]').attr("content");
    if (googlebot) googlebot = googlebot.replace('noindex', '<span class="metainfo_redhl">noindex</span>').replace('nofollow', '<span class="metainfo_redhl">nofollow</span>');

    var css = '';
    css += '.metainfo_panel {position:fixed; bottom:0px; right:0px; background-color:#eee; border: 1px solid #444; max-width:480px; z-index:100000; display:flex;}';
    css += '.metainfo_panel table th, .metainfo_panel table td {padding:0px 5px; font-size:12px; font-family:Verdana; border-bottom:1px solid #ccc; color:black;}';
    css += '.metainfo_panel table tr th {background-color:#e0e0e0; font-weight:normal; text-align:left;}';
    css += '.metainfo_panel table tr td.center {text-align:center;}';
    css += '.metainfo_panel table {margin:5px 5px 5px 5px;}';
    css += '.metainfo_hidden {display:none;}';
    css += '#metainfo_toggle_btn {display:block; padding:5px; line-height:14px; text-align:center; text-decoration:none; background-color:#444;; color:white; font-size:12px; font-weight:bold;}';
    css += '.metainfo_redhl {display:inline-block; background-color:red; color:white; padding: 0 2px;}';

    var miPanelVisible = GM_getValue("metainfo_panel_visible", false);

    var html = '';
    html += '<div class="metainfo_panel">';
    html += '<a href="#" id="metainfo_toggle_btn">M<br>E<br>T<br>A</a>';
    html += '<table id="metainfo_table" class="'+(!miPanelVisible ? 'metainfo_hidden' : '')+'">';
    html += '<tr><th>Title</th><td>'+(title?title:'-')+'</td><td class="center">['+(title?title.length:'0')+']</td></tr>';
    html += '<tr><th>Description</th><td>'+(description?description:'-')+'</td><td class="center">['+(description?description.length:'0')+']</td></tr>';
    html += '<tr><th>Keywords</th><td>'+(keywords?keywords:'-')+'</td><td class="center">['+(keywords?keywords.split(',').length:'0')+']</td></tr>';
    html += '<tr><th>Canonical</th><td>'+(canonical?canonical:'-')+'</td><td class="center">['+(canonical?'<a href="'+canonical+'">go</a>':'-')+']</td></tr>';
    html += '<tr><th>AMP &#9889;</th><td>'+ (amphtml ? amphtml : '-') + '</td><td class="center">['+ (amphtml ? '<a href="'+amphtml+'">go</a>' : '-')+']</td></tr>';
    html += '<tr><th>Charset</th><td colspan="2">'+(charset?charset:'-')+'</td></tr>';
    html += '<tr><th>Viewport</th><td colspan="2">'+(viewport?viewport:'-')+'</td></tr>';
    html += '<tr><th>Robots</th><td colspan="2">'+(robots?robots:'-')+'</td></tr>';
    html += '<tr><th>GoogleBot</th><td colspan="2">'+(googlebot?googlebot:'-')+'</td></tr>';
    html += '</table>';
    html += '</div>';


    Z.ready(function(){
       Z.find('head').el.appendChild(Z.create('style').attr('type','text/css').append(css).el);
       Z.find('body').prepend(html);
       Z.find('#metainfo_toggle_btn').on('click', function(){
           Z.find('#metainfo_table').toggleClass('metainfo_hidden');
           GM_setValue("metainfo_panel_visible", !Z.find('#metainfo_table').hasClass('metainfo_hidden'));
           this.blur();
           return false;
       });
    }, 500);

    // ==============================================
})();
