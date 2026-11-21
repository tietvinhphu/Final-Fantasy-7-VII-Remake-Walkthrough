/**
 * Hai đoạn script rất nhỏ chạy trước khi trình duyệt vẽ để không bị nháy:
 * 1) trong <head>: theme và chế độ đọc đã lưu;
 * 2) cuối khu bước: chọn bước đang xem (từ #hash hoặc bước đã xem lần trước).
 * Nội dung cố định nên postbuild tính được hash cho CSP, không cần 'unsafe-inline'.
 */
export const HEAD_BOOT =
  "(function(){var r=document.documentElement,m='focus';try{var t=localStorage.getItem('ff7r-vi-theme');if(t==='light'||t==='dark')r.setAttribute('data-theme',t);if(localStorage.getItem('ff7r-vi-mode')==='list')m='list'}catch(e){}r.setAttribute('data-mode',m)})()";

export const STEP_BOOT =
  "(function(){var d=document,s=d.getElementById('stage');if(!s)return;var c=null;try{var k=s.getAttribute('data-key'),h=decodeURIComponent(location.hash.slice(1));c=h&&d.getElementById(h);if(!c||c.tagName!=='ARTICLE'){var l=localStorage.getItem('ff7r-vi-last:'+k);c=l&&d.getElementById(l)}}catch(e){}if(!c||c.tagName!=='ARTICLE')c=s.querySelector('article.step');if(c)c.setAttribute('data-current','')})()";
