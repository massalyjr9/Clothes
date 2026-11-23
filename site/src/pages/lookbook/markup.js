// Static markup of the ring lookbook; wired up by engine.js
export default `<section class="deck" id="deck" aria-labelledby="deck-title">
    <div class="deck__intro">
      <h1 id="deck-title"><span>Stay out of the</span> <span>loop, <i>pal.</i></span></h1>
      <p><span>Vol. 01. Nine looks for going quiet.</span> <span>Spin the ring, choose a fit, tap a dot to shop the item.</span></p>
    </div>
    <div class="deck__stage" id="stage" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Looks — arrow keys turn the ring, Enter opens the look">
      <span class="loop__ring" id="loopRing" aria-hidden="true"></span>
      <div class="loop" aria-hidden="true">
        <p class="loop__t">Stay out<br>of the loop</p>
        <p class="loop__s">Vol. 01 — Nine looks</p>
      </div>
      <div class="deck__crowd" id="crowd"></div>
      <div class="deck__labels" id="labels" aria-hidden="true"></div>
      <span class="deck__glint" aria-hidden="true"></span>
      <span class="follow" id="follow" aria-hidden="true"><span class="follow__in"><b class="f-drag">Drag</b><b class="f-view">View</b></span></span>
      <span class="deck__live" id="live" aria-live="polite"></span>
    </div>

    <div class="dock">
      <div class="dock__now" id="now">
        <div class="dock__count">
          <span class="cap"><span id="nowIdx">01</span> / <span id="nowTotal">09</span></span>
          <button class="dock__auto" id="auto" type="button" aria-label="Autoplay" aria-pressed="true">
            <svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5z"/><path d="M14 4.5h3.5v15H14z"/></svg>
            <svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>
          </button>
        </div>
        <div class="dock__name" id="nowName">Somewhere Else</div>
      </div>
      <ul class="dock__pieces" id="pieces" aria-label="Items in this fit"></ul>
      <button class="dock__shop" id="shop" type="button" aria-label="Shop this fit">
        <span class="cap">Shop this fit</span>
        <span class="dock__dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg></span>
      </button>
    </div>

    <a class="deck__qr" href="#/postcards" aria-label="Nowhere code"><svg id="qr" viewBox="0 0 25 25" shape-rendering="crispEdges" aria-hidden="true"></svg></a>
    <button class="deck__looksbtn pill" id="drawerBtn" type="button" aria-expanded="false" aria-controls="drawer">Looks</button>
    <div class="deck__view" role="group" aria-label="View">
      <button class="deck__vbtn" type="button" data-v="ring" aria-pressed="true">Ring</button>
      <button class="deck__vbtn" type="button" data-v="grid" aria-pressed="false">Grid</button>
    </div>

    <div class="drawer" id="drawer" aria-hidden="true">
      <div class="drawer__top">
        <span class="cap">Looks · Vol. 01</span>
        <button class="pill" id="drawerClose" type="button">Close</button>
      </div>
      <ol class="drawer__list" id="drawerList"></ol>
      <nav class="drawer__nav" aria-label="Main">
        <a class="pill" href="#/vol-01">Vol. 01</a><a class="pill" href="#/places">Places</a><a class="pill" href="#/letters">Letters</a><a class="pill" href="#/postcards">Postcards</a>
      </nav>
    </div>

    <div class="focus" id="focus" aria-hidden="true">
      <div class="focus__stage" id="focusStage"></div>
      <div class="focus__top">
        <p class="focus__cap"><span id="focusNum">01.</span><i id="focusName">Somewhere Else</i></p>
        <button class="focus__close" id="focusClose" type="button" aria-label="Close look">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
        </button>
      </div>
      <p class="focus__hint cap">Tap a dot to shop this item</p>
    </div>

    <aside class="slip" id="slip" aria-label="In this fit" aria-hidden="true">
      <div class="slip__head">
        <div class="slip__logo">Nowhere<i>®</i></div>
        <span class="cap">Vol. 01 · Till 0004 · Lisbon</span>
        <span class="cap" id="slipLook">Look 01 — Somewhere Else</span>
      </div>
      <ul class="slip__lines" id="lines" role="list"></ul>
      <div class="slip__bundle">
        <p class="slip__msg" id="msg" role="status" aria-live="polite" hidden></p>
        <dl class="sum">
          <div class="sum__row"><dt class="cap">Subtotal</dt><dd id="sumSub">$142</dd></div>
          <div class="sum__row"><dt class="cap">Whole fit −10%</dt><dd id="sumOff">−$14.20</dd></div>
          <div class="sum__total"><dt>Total</dt><dd id="sumTotal">$127.80</dd></div>
        </dl>
        <button class="slip__cta" id="cta" type="button">
          <span class="t-add">Add whole fit to bag</span><span class="t-done">Whole fit in your bag</span>
          <svg width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>
        </button>
      </div>
      <div class="slip__foot" aria-hidden="true">
        <span class="slip__code"></span>
        <span class="cap">Thanks for going nowhere.</span>
      </div>
    </aside>
  </section>`;
