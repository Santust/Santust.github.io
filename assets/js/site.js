/* ============================================================
   site.js — boot sequence, nav, scroll reveals, writeups loader
   ============================================================ */
(function(){
  "use strict";

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CONFIG = {
    owner: 'Santust',
    repo:  'Santust.github.io',
    path:  'writeups',
    branch:'main'
  };

  /* =========================================================
     BOOT SEQUENCE — sigil sears in, word carves, embers rise
     ========================================================= */
  var boot = document.getElementById('boot');
  var booted = false;
  function finishBoot(){
    if (booted) return;
    booted = true;
    boot.classList.add('gone');
    setTimeout(function(){ if (boot && boot.parentNode) boot.style.display = 'none'; }, 600);
  }
  if (boot){
    boot.addEventListener('click', finishBoot);

    if (reduced){
      document.getElementById('boot-sigil').classList.add('show');
      document.getElementById('boot-tag').classList.add('show');
      setTimeout(finishBoot, 300);
    } else {
      // ember burn behind the sigil
      var bc = document.getElementById('boot-canvas');
      if (bc){
        var bctx = bc.getContext('2d');
        bc.width = innerWidth; bc.height = innerHeight;
        var sparks = [];
        for (var i = 0; i < 60; i++){
          sparks.push({ x: bc.width/2 + (Math.random()-0.5)*220, y: bc.height/2 + (Math.random()-0.5)*220,
                        vx:(Math.random()-0.5)*0.6, vy:-(Math.random()*0.8+0.2), life:Math.random(), r:Math.random()*1.4+0.4 });
        }
        var burning = true;
        (function burn(){
          if (!burning) return;
          bctx.clearRect(0,0,bc.width,bc.height);
          sparks.forEach(function(s){
            s.x+=s.vx; s.y+=s.vy; s.life-=0.006;
            if (s.life<=0){ s.x=bc.width/2+(Math.random()-0.5)*220; s.y=bc.height/2+(Math.random()-0.5)*160; s.life=1; }
            bctx.fillStyle='rgba(224,70,40,'+(s.life*0.5)+')';
            bctx.shadowColor='rgba(224,70,40,0.8)'; bctx.shadowBlur=5;
            bctx.beginPath(); bctx.arc(s.x,s.y,s.r,0,Math.PI*2); bctx.fill();
          });
          bctx.shadowBlur=0;
          requestAnimationFrame(burn);
        })();
        setTimeout(function(){ burning = false; }, 3400);
      }

      setTimeout(function(){ document.getElementById('boot-sigil').classList.add('show'); }, 200);

      // carve the word out of glyphs
      var word = 'SANTUST';
      var glyphs = 'ᛝᚦᚱᚨᚾᛊ#%&';
      var wordEl = document.getElementById('boot-word');
      var spans = [];
      for (var c = 0; c < word.length; c++){
        var sp = document.createElement('span');
        sp.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
        wordEl.appendChild(sp);
        spans.push(sp);
      }
      spans.forEach(function(sp, idx){
        var cycles = 0, max = 10 + idx * 3, done = false;
        var iv = setInterval(function(){
          if (done) return;
          cycles++;
          if (cycles >= max){ sp.textContent = word[idx]; done = true; clearInterval(iv); }
          else sp.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
        }, 45);
      });

      setTimeout(function(){ document.getElementById('boot-tag').classList.add('show'); }, 900);

      var lines = [
        'unsealing operator mark',
        'loading offensive toolkit',
        'binding session to ~/santust',
        'the sacrifice is accepted'
      ];
      var linesEl = document.getElementById('boot-lines');
      lines.forEach(function(text, i){
        var d = document.createElement('div');
        d.className = 'l';
        d.innerHTML = '[<span class="m">' + (i === lines.length-1 ? '\u2020' : '+') + '</span>] ' + text;
        linesEl.appendChild(d);
        setTimeout(function(){ d.classList.add('show'); }, 1100 + i * 300);
      });

      var barFill = document.querySelector('#boot-bar i');
      var pctEl = document.getElementById('boot-pct');
      var pct = 0;
      var barTimer = setInterval(function(){
        pct = Math.min(100, pct + (Math.random() < 0.12 ? 0 : Math.random()*8 + 2));
        barFill.style.width = pct + '%';
        pctEl.textContent = Math.floor(pct) + '%';
        if (pct >= 100){ clearInterval(barTimer); setTimeout(finishBoot, 400); }
      }, 95);

      setTimeout(finishBoot, 3600);
    }
  }

  /* =========================================================
     NAV ACTIVE LINK ON SCROLL
     ========================================================= */
  var navLinks = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window){
    var sections = document.querySelectorAll('section, header');
    var navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('href') === '#' + id); });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(function(s){ if (s.id) navObs.observe(s); });
  }

  /* =========================================================
     SCROLL REVEAL
     ========================================================= */
  if ('IntersectionObserver' in window){
    var revObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); revObs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ revObs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  // no username-based profile URL exists, so show the handle and copy it
  var dcBtn = document.getElementById('discord-btn');
  if (dcBtn){
    dcBtn.addEventListener('click', function(){
      var handle = dcBtn.getAttribute('data-handle');
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(handle).then(function(){
        var original = dcBtn.textContent;
        dcBtn.textContent = 'copied ✓';
        dcBtn.classList.add('copied');
        setTimeout(function(){
          dcBtn.textContent = original;
          dcBtn.classList.remove('copied');
        }, 1400);
      }).catch(function(){});
    });
  }

  var thmBadge = document.getElementById('thm-badge');
  if (thmBadge){
    thmBadge.addEventListener('error', function(){ thmBadge.remove(); });
  }

  /* =========================================================
     WRITEUPS AUTO-LOADER (reads /writeups from GitHub)
     ========================================================= */
  var wuGrid = document.getElementById('wu-grid');
  var wuModal = document.getElementById('wu-modal');
  var wuTitle = document.getElementById('wu-modal-title');
  var wuDate = document.getElementById('wu-modal-date');
  var wuContent = document.getElementById('wu-content');

  // null-prototype: a slug like "constructor" must not hit an inherited key
  var wuBySlug = Object.create(null);
  var wuReady = false;

  var HASH_PREFIX = '#writeup/';
  function slugFromHash(){
    var h = location.hash || '';
    if (h.indexOf(HASH_PREFIX) !== 0) return '';
    var raw = h.slice(HASH_PREFIX.length);
    try { return decodeURIComponent(raw); } catch (e) { return raw; }
  }

  // history.* throws on opaque origins
  function setHash(value, replace){
    try {
      var url = value ? value : (location.pathname + location.search);
      history[replace ? 'replaceState' : 'pushState'](null, '', url);
    } catch (e) {
      if (value) location.hash = value;
      else if (location.hash) location.hash = '';
    }
  }

  function closeWriteup(){
    if (!wuModal.classList.contains('open')) return;
    wuModal.classList.remove('open');
    if (slugFromHash()) setHash('', true);
  }

  if (document.getElementById('wu-modal-close')){
    document.getElementById('wu-modal-close').addEventListener('click', closeWriteup);
    wuModal.addEventListener('click', function(e){ if (e.target === wuModal) closeWriteup(); });
  }

  /* =========================================================
     IMAGE LIGHTBOX — one overlay reused for every writeup image.
     Clicks are delegated off .wu-content because the images are
     injected after the markdown renders.
     ========================================================= */
  var lightbox, lightboxImg;
  function buildLightbox(){
    lightbox = document.createElement('div');
    lightbox.id = 'img-lightbox';
    lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);
    lightbox.addEventListener('click', closeLightbox);
    document.body.appendChild(lightbox);
  }
  function openLightbox(src, alt){
    if (!lightbox) buildLightbox();
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
  }
  function closeLightbox(){
    if (lightbox){ lightbox.classList.remove('open'); lightboxImg.src = ''; }
  }
  function lightboxOpen(){ return lightbox && lightbox.classList.contains('open'); }

  if (wuContent){
    wuContent.addEventListener('click', function(e){
      var img = e.target.closest && e.target.closest('img');
      if (img && wuContent.contains(img)) openLightbox(img.src, img.alt);
    });
  }

  // lightbox first, then the writeup
  window.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    if (lightboxOpen()) closeLightbox();
    else closeWriteup();
  });

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function parseFrontmatter(raw){
    var meta = { title:null, date:null, tags:[] };
    var body = raw;
    var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
    if (m){
      var fm = m[1]; body = m[2];
      var tm = fm.match(/title:\s*(.+)/i);
      var dm = fm.match(/date:\s*(.+)/i);
      var gm = fm.match(/tags:\s*(.+)/i);
      if (tm) meta.title = tm[1].trim().replace(/^["']|["']$/g,'');
      if (dm) meta.date = dm[1].trim();
      if (gm) meta.tags = gm[1].split(',').map(function(x){return x.trim();}).filter(Boolean);
    }
    if (!meta.title){ var h = body.match(/^#\s+(.+)/m); if (h) meta.title = h[1].trim(); }
    return { meta:meta, body:body };
  }

  // reject any scheme but http/https/mailto; relative paths have none
  function safeUrl(u){
    u = String(u).trim().replace(/"/g, '%22');
    var probe = u.replace(/[\u0000-\u0020]/g, '').toLowerCase();
    var scheme = probe.match(/^([a-z][a-z0-9+.\-]*):/);
    if (scheme && ['http', 'https', 'mailto'].indexOf(scheme[1]) === -1) return '#';
    return u;
  }

  // folder the current writeup came from, for resolving its relative assets
  var mdBase = '';
  function resolveAsset(u){
    if (!mdBase || u === '#' || /^(https?:)?\/\//i.test(u) || u.charAt(0) === '/') return u;
    return mdBase + u.replace(/^\.\//, '');
  }

  function inlineMd(t){
    t = escapeHtml(t);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/`(.+?)`/g, '<code>$1</code>');
    // one level of nested parens, so URLs containing them survive
    var URL_G = '\\(((?:[^()]|\\([^()]*\\))*)\\)';
    // before links: the link rule would otherwise eat ![...]
    t = t.replace(new RegExp('!\\[(.*?)\\]' + URL_G, 'g'), function(_, alt, src){
      return '<img src="' + resolveAsset(safeUrl(src)) + '" alt="' + alt.replace(/"/g,'&quot;') + '" loading="lazy">';
    });
    t = t.replace(new RegExp('\\[(.+?)\\]' + URL_G, 'g'), function(_, txt, href){
      return '<a href="' + safeUrl(href) + '" target="_blank" rel="noopener">' + txt + '</a>';
    });
    return t;
  }

  function tinyMarkdown(md){
    var lines = md.split('\n'), html = '', inCode = false, list = null, inQuote = false;
    function closeList(){ if (list){ html += '</' + list + '>'; list = null; } }
    function closeQuote(){ if (inQuote){ html += '</blockquote>'; inQuote = false; } }

    lines.forEach(function(line){
      if (/^```/.test(line)){
        closeList(); closeQuote();
        if (!inCode){ html += '<pre><code>'; inCode = true; } else { html += '</code></pre>'; inCode = false; }
        return;
      }
      if (inCode){ html += escapeHtml(line) + '\n'; return; }

      var h = line.match(/^(#{1,3})\s+(.+)/);
      if (h){
        closeList(); closeQuote();
        html += '<h' + h[1].length + '>' + escapeHtml(h[2]) + '</h' + h[1].length + '>';
        return;
      }

      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)){
        closeList(); closeQuote(); html += '<hr>'; return;
      }

      var ol = line.match(/^\s*\d+[.)]\s+(.+)/);
      if (ol){
        closeQuote();
        if (list !== 'ol'){ closeList(); html += '<ol>'; list = 'ol'; }
        html += '<li>' + inlineMd(ol[1]) + '</li>';
        return;
      }

      var ul = line.match(/^\s*[-*+]\s+(.+)/);
      if (ul){
        closeQuote();
        if (list !== 'ul'){ closeList(); html += '<ul>'; list = 'ul'; }
        html += '<li>' + inlineMd(ul[1]) + '</li>';
        return;
      }

      var bq = line.match(/^>\s?(.*)/);
      if (bq){
        closeList();
        if (!inQuote){ html += '<blockquote>'; inQuote = true; }
        html += '<p>' + inlineMd(bq[1]) + '</p>';
        return;
      }

      closeList(); closeQuote();
      if (line.trim() === '') return;
      html += '<p>' + inlineMd(line) + '</p>';
    });

    closeList(); closeQuote();
    if (inCode) html += '</code></pre>';
    return html;
  }
  function titleFromFilename(name){
    return name.replace(/\.md$/,'').replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/[-_]/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
  }

  function openWriteup(item, fromHash){
    wuTitle.textContent = item.title;
    wuDate.textContent = item.date || '';
    mdBase = item.base || '';
    wuContent.innerHTML = tinyMarkdown(item.body);
    wuModal.classList.add('open');
    wuModal.scrollTop = 0;
    if (!fromHash && item.slug){
      var want = HASH_PREFIX + encodeURIComponent(item.slug);
      if (location.hash !== want) setHash(want, false);
    }
  }

  function openFromHash(){
    var slug = slugFromHash();
    if (slug && wuBySlug[slug]) openWriteup(wuBySlug[slug], true);
    else closeWriteup();
  }
  window.addEventListener('hashchange', function(){ if (wuReady) openFromHash(); });

  function renderWriteups(items){
    if (!items.length){
      wuGrid.innerHTML = '<div class="wu-empty">no writeups yet — drop a <code>.md</code> file into <code>/'+CONFIG.path+'</code> and push. it appears here automatically.</div>';
      return;
    }
    items.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
    wuGrid.innerHTML = '';
    wuBySlug = Object.create(null);
    items.forEach(function(item){
      if (item.slug) wuBySlug[item.slug] = item;
      var card = document.createElement('a');
      card.className = 'wu-card';
      card.href = item.slug ? HASH_PREFIX + encodeURIComponent(item.slug) : '#';
      var excerpt = item.body.replace(/^#.+\n/,'').replace(/```[\s\S]*?```/g,'').replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/[#*`>]/g,'').trim().slice(0,150);
      card.innerHTML =
        (item.date ? '<div class="wu-date">'+escapeHtml(item.date)+'</div>' : '') +
        '<h3>'+escapeHtml(item.title)+'</h3>' +
        '<div class="wu-excerpt">'+escapeHtml(excerpt)+(excerpt.length>=150?'…':'')+'</div>' +
        (item.tags.length ? '<div class="wu-tags">'+item.tags.map(function(t){return '<span>#'+escapeHtml(t)+'</span>';}).join('')+'</div>' : '');
      card.addEventListener('click', function(e){
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        openWriteup(item);
      });
      wuGrid.appendChild(card);
    });
    wuReady = true;
    // a bad hash must not take down a grid that rendered fine
    try { openFromHash(); } catch (e) {}
  }

  function loadWriteups(){
    if (!wuGrid) return;
    if (CONFIG.owner === 'your-username'){
      wuGrid.innerHTML = '<div class="wu-empty">set <code>owner</code> / <code>repo</code> at the top of <code>assets/js/site.js</code>, add a <code>/'+CONFIG.path+'</code> folder with <code>.md</code> files, and they load here automatically.</div>';
      return;
    }
    var api = 'https://api.github.com/repos/'+CONFIG.owner+'/'+CONFIG.repo+'/contents/'+CONFIG.path+'?ref='+CONFIG.branch;
    fetch(api, { headers:{ Accept:'application/vnd.github+json' } })
      .then(function(r){ if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(function(files){
        // _ prefix = draft: committed, not published
        var md = files.filter(function(f){
          return f.type === 'file' && /\.md$/i.test(f.name) && f.name.charAt(0) !== '_';
        });
        if (!md.length){ renderWriteups([]); return; }
        return Promise.all(md.map(function(f){
          return fetch(f.download_url).then(function(r){ return r.text(); }).then(function(raw){
            var p = parseFrontmatter(raw);
            return {
              title: p.meta.title || titleFromFilename(f.name),
              date:  p.meta.date || '',
              tags:  p.meta.tags || [],
              body:  p.body,
              slug:  f.name.replace(/\.md$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
              base:  f.download_url.replace(/[^/]+$/, '')
            };
          });
        })).then(renderWriteups);
      })
      .catch(function(){
        wuGrid.innerHTML = '<div class="wu-empty">couldn\'t reach the <code>/'+CONFIG.path+'</code> folder yet — it\'ll populate once the repo is live and the folder has <code>.md</code> files.</div>';
      });
  }
  loadWriteups();

})();
