(function () {
    'use strict';
    var THEME_KEY = 'ff7r-vi-theme';
    var PREFIX = 'ff7r-vi-progress:';

    function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* tiến độ không lưu được */ } }

    var saved = get(THEME_KEY);
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved);

    function readDone(key) {
        try { return JSON.parse(get(PREFIX + key)) || []; } catch (e) { return []; }
    }

    function init() {
        var toggle = document.getElementById('theme-toggle');
        if (toggle) toggle.addEventListener('click', function () {
            var cur = document.documentElement.getAttribute('data-theme');
            if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            var next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            set(THEME_KEY, next);
        });

        // Trang chương: lưu các mục tiêu đã tick.
        var key = document.body.getAttribute('data-chapter');
        if (key) {
            var done = readDone(key);
            var boxes = document.querySelectorAll('input[data-obj]');
            boxes.forEach(function (b) {
                b.checked = done.indexOf(b.getAttribute('data-obj')) !== -1;
                b.addEventListener('change', function () {
                    var now = [];
                    boxes.forEach(function (x) { if (x.checked) now.push(x.getAttribute('data-obj')); });
                    set(PREFIX + key, JSON.stringify(now));
                });
            });
        }

        // Mục lục chương: đánh dấu mục đang đọc.
        var links = document.querySelectorAll('.toc a');
        if (links.length && 'IntersectionObserver' in window) {
            var byId = {};
            links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting && byId[en.target.id]) {
                        links.forEach(function (a) { a.classList.remove('on'); });
                        byId[en.target.id].classList.add('on');
                    }
                });
            }, { rootMargin: '-10% 0px -80% 0px' });
            document.querySelectorAll('main h2[id]').forEach(function (h) { io.observe(h); });
        }

        // Trang chủ: hiện tiến độ từng chương.
        document.querySelectorAll('.chapters a[data-chapter]').forEach(function (a) {
            var total = parseInt(a.getAttribute('data-total'), 10) || 0;
            var n = readDone(a.getAttribute('data-chapter')).length;
            var slot = a.querySelector('.ch-progress');
            if (slot && total) slot.textContent = n + '/' + total + ' mục tiêu';
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
