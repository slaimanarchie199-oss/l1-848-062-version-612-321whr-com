(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dotsWrap = document.querySelector("[data-hero-dots]");
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (!slides.length || !dotsWrap) {
      return;
    }

    var index = 0;
    var timer = null;
    var dots = slides.map(function (_, dotIndex) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "切换到第 " + (dotIndex + 1) + " 部推荐影片");
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var scope = panel.nextElementSibling;
      if (!scope || !scope.matches("[data-filter-scope]")) {
        scope = document.querySelector("[data-filter-scope]");
      }
      if (!scope) {
        return;
      }
      var input = panel.querySelector("[data-search-input]");
      var select = panel.querySelector("[data-year-filter]");
      var empty = panel.querySelector("[data-filter-empty]");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));

      function applyFilter() {
        var keyword = normalize(input ? input.value : "");
        var year = select ? select.value : "";
        var visible = 0;
        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags")
          ].join(" "));
          var itemYear = parseInt(item.getAttribute("data-year") || "0", 10);
          var yearMatch = true;
          if (year === "2022") {
            yearMatch = itemYear <= 2022;
          } else if (year) {
            yearMatch = String(itemYear) === year;
          }
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var shouldShow = keywordMatch && yearMatch;
          item.classList.toggle("is-hidden", !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (select) {
        select.addEventListener("change", applyFilter);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector("[data-play]");
      var hlsInstance = null;

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
        }
        if (!video) {
          return;
        }
        var source = video.getAttribute("data-src");
        if (!source) {
          return;
        }
        player.classList.add("is-playing");

        if (video.src) {
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (playButton) {
        playButton.addEventListener("click", startPlayback);
      }
      player.addEventListener("click", function (event) {
        if (event.target === player || event.target.closest(".player-cover")) {
          startPlayback(event);
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
