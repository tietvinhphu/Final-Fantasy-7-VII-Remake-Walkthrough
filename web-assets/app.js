(function () {
    'use strict';
    var THEME_KEY = 'ff7r-vi-theme';
    var PREFIX = 'ff7r-vi-progress:';
    var root = document.documentElement;

    function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* không lưu được */ } }
    function readDone(key) { try { return JSON.parse(get(PREFIX + key)) || []; } catch (e) { return []; } }

    // Chạy ngay trong <head>: tránh nháy giao diện, và chỉ ẩn phần reveal khi JS có mặt.
    root.classList.add('js');
    var saved = get(THEME_KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    function initTheme() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var cur = root.getAttribute('data-theme');
            if (!cur) cur = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            var next = cur === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            set(THEME_KEY, next);
        });
    }

    function initMenu() {
        var menu = document.querySelector('.menu');
        if (!menu) return;
        document.addEventListener('click', function (e) { if (!menu.contains(e.target)) menu.removeAttribute('open'); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.removeAttribute('open'); });
    }

    function initReveal() {
        var items = document.querySelectorAll('.reveal');
        document.querySelectorAll('.grid').forEach(function (g) {
            g.querySelectorAll('.reveal').forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 12)); });
        });
        if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        items.forEach(function (el) { io.observe(el); });
    }

    function initScroll() {
        var bar = document.querySelector('.scrollbar');
        var timeline = document.querySelector('.timeline');
        var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
        var tocLinks = {};
        document.querySelectorAll('.toc a').forEach(function (a) { tocLinks[a.getAttribute('href').slice(1)] = a; });
        var ticking = false;

        function update() {
            ticking = false;
            var h = root.scrollHeight - window.innerHeight;
            if (bar) bar.style.setProperty('--scroll', h > 0 ? Math.min(1, window.scrollY / h).toFixed(4) : 0);
            if (!timeline) return;
            var anchor = window.innerHeight * 0.4;
            var top = timeline.getBoundingClientRect().top;
            var fill = Math.max(0, Math.min(timeline.offsetHeight, anchor - top));
            timeline.style.setProperty('--fill', fill + 'px');
            var current = null;
            steps.forEach(function (s) {
                var r = s.getBoundingClientRect();
                if (r.top <= anchor && r.bottom > anchor) current = s;
                s.classList.toggle('active', s === current);
            });
            Object.keys(tocLinks).forEach(function (id) {
                tocLinks[id].classList.toggle('on', !!current && current.id === id);
            });
        }
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
    }

    function initProgress() {
        var key = document.body.getAttribute('data-chapter');
        if (!key) return;
        var total = parseInt(document.body.getAttribute('data-total'), 10) || 0;
        var done = readDone(key);
        var boxes = document.querySelectorAll('input[data-step-box]');
        var meter = document.querySelector('.meter');
        var text = document.getElementById('meter-text');

        function paint() {
            var n = 0;
            boxes.forEach(function (b) {
                var step = document.getElementById(b.getAttribute('data-step-box'));
                if (b.checked) n += 1;
                if (step) step.classList.toggle('complete', b.checked);
            });
            if (meter) {
                meter.style.setProperty('--p', total ? n / total : 0);
                meter.setAttribute('aria-valuenow', n);
            }
            if (text) text.textContent = n + '/' + total;
        }
        boxes.forEach(function (b) {
            b.checked = done.indexOf(b.getAttribute('data-step-box')) !== -1;
            b.addEventListener('change', function () {
                var now = [];
                boxes.forEach(function (x) { if (x.checked) now.push(x.getAttribute('data-step-box')); });
                set(PREFIX + key, JSON.stringify(now));
                paint();
            });
        });
        paint();
    }

    function initHome() {
        document.querySelectorAll('a.ccard[data-chapter]').forEach(function (a) {
            var total = parseInt(a.getAttribute('data-total'), 10) || 0;
            var n = readDone(a.getAttribute('data-chapter')).length;
            var ring = a.querySelector('.ring');
            if (ring && total) {
                ring.style.setProperty('--p', Math.min(1, n / total));
                ring.setAttribute('aria-label', 'Đã xong ' + n + '/' + total + ' bước');
            }
        });
    }

    function initLightbox() {
        var dlg = document.getElementById('lightbox');
        var shots = Array.prototype.slice.call(document.querySelectorAll('a.shot'));
        if (!dlg || !shots.length || typeof dlg.showModal !== 'function') return;
        var img = dlg.querySelector('img');
        var cap = dlg.querySelector('figcaption');
        var idx = 0;
        function show(i) {
            idx = (i + shots.length) % shots.length;
            img.src = shots[idx].getAttribute('href');
            img.alt = 'Hình ' + (idx + 1) + '/' + shots.length;
            cap.textContent = (shots[idx].getAttribute('data-cap') || '') + ' · ' + (idx + 1) + '/' + shots.length;
        }
        shots.forEach(function (a, i) {
            a.addEventListener('click', function (e) { e.preventDefault(); show(i); dlg.showModal(); });
        });
        dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
        dlg.querySelector('.lb-nx').addEventListener('click', function () { show(idx + 1); });
        dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
        dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
        dlg.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') show(idx - 1);
            if (e.key === 'ArrowRight') show(idx + 1);
        });
        var x0 = null;
        dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        dlg.addEventListener('touchend', function (e) {
            if (x0 === null) return;
            var dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
            x0 = null;
        });
    }

    function init() {
        initTheme(); initMenu(); initReveal(); initScroll(); initProgress(); initHome(); initLightbox();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
