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

    // Giữ mục đang chọn trong vùng nhìn thấy của TOC (cuộn ngang trên điện thoại, dọc trên máy tính).
    function keepVisible(box, el) {
        var b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
        if (box.scrollWidth > box.clientWidth + 1) {
            box.scrollLeft += (r.left - b.left) - (b.width - r.width) / 2;
        } else if (box.scrollHeight > box.clientHeight + 1) {
            if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += (r.top - b.top) - (b.height - r.height) / 2;
        }
    }

    function initScroll() {
        var bar = document.querySelector('.scrollbar');
        var topbar = document.querySelector('.bar');
        var timeline = document.querySelector('.timeline');
        var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
        var toc = document.querySelector('.toc');
        var tocList = toc && toc.querySelector('ol');
        var tocLinks = {};
        document.querySelectorAll('.toc a').forEach(function (a) { tocLinks[a.getAttribute('href').slice(1)] = a; });
        var ticking = false, lastId = null;

        function measureBar() { if (topbar) root.style.setProperty('--bar-h', topbar.offsetHeight + 'px'); }

        function update() {
            ticking = false;
            // Đọc hết layout trước, ghi style sau: tránh buộc trình duyệt tính lại bố cục mỗi khung hình.
            var h = root.scrollHeight - window.innerHeight;
            var scrolled = h > 0 ? Math.min(1, window.scrollY / h) : 0;
            var anchor = window.innerHeight * 0.4;
            var fillRatio = 0, current = null;
            if (timeline) {
                var top = timeline.getBoundingClientRect().top;
                var total = timeline.offsetHeight;
                fillRatio = total ? Math.max(0, Math.min(1, (anchor - top) / total)) : 0;
                steps.forEach(function (s) {
                    var r = s.getBoundingClientRect();
                    if (r.top <= anchor && r.bottom > anchor) current = s;
                });
            }
            if (bar) bar.style.setProperty('--scroll', scrolled.toFixed(4));
            if (!timeline) return;
            timeline.style.setProperty('--fillr', fillRatio.toFixed(4));
            steps.forEach(function (s) { s.classList.toggle('active', s === current); });
            var id = current ? current.id : null;
            Object.keys(tocLinks).forEach(function (k) { tocLinks[k].classList.toggle('on', k === id); });
            if (id !== lastId) {
                lastId = id;
                // Điện thoại: dải pill cuộn ngang trong <ol>; máy tính: cả cột TOC cuộn dọc.
                if (id && toc) keepVisible(tocList.scrollWidth > tocList.clientWidth + 1 ? tocList : toc, tocLinks[id]);
            }
        }
        function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', function () { measureBar(); onScroll(); });
        measureBar();
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
            img.alt = (shots[idx].getAttribute('data-cap') || 'Hình minh họa') + ', hình ' + (idx + 1) + ' trên ' + shots.length;
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
