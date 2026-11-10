(() => {
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ---------- build card internals ---------- */
  document.querySelectorAll(".card").forEach((card) => {
    const thumb = card.querySelector(".thumb");
    const meta = card.querySelector(".meta");

    if (card.classList.contains("yt")) {
      const id = card.dataset.yt;
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
      img.onload = () => { if (img.naturalWidth < 200) img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; };
      img.onerror = () => { img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; };
      thumb.prepend(img);
    }

    thumb.insertAdjacentHTML("beforeend", '<span class="play-hint"></span><span class="preview-label">PREVIEW</span>');
    const isLocal = card.classList.contains("local");
    meta.insertAdjacentHTML("beforeend", `<span class="go">${isLocal ? "PLAY FULL VIDEO" : "WATCH ON YOUTUBE"} <b>↗</b></span>`);
  });

  /* ---------- hover preview ---------- */
  const startPreview = (card) => {
    if (card.classList.contains("playing")) return;
    const thumb = card.querySelector(".thumb");
    clearTimeout(card._t);
    card._t = setTimeout(() => {
      let el;
      if (card.classList.contains("yt")) {
        const id = card.dataset.yt;
        const start = card.dataset.start || 0;
        el = document.createElement("iframe");
        el.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&start=${start}&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1`;
        el.allow = "autoplay; encrypted-media";
        el.tabIndex = -1;
        el.title = "preview";
      } else {
        el = document.createElement("video");
        el.src = card.dataset.preview;
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.autoplay = true;
      }
      el.className = "pv";
      thumb.insertBefore(el, thumb.querySelector(".badge"));
      const show = () => card.classList.add("playing");
      if (el.tagName === "VIDEO") { el.addEventListener("playing", show, { once: true }); el.play().catch(() => {}); }
      else el.addEventListener("load", () => setTimeout(show, 700), { once: true });
    }, card.classList.contains("yt") ? 250 : 80);
  };

  const stopPreview = (card) => {
    clearTimeout(card._t);
    card.classList.remove("playing");
    const pv = card.querySelector(".pv");
    if (pv) setTimeout(() => { if (!card.classList.contains("playing")) pv.remove(); }, 350);
  };

  document.querySelectorAll(".card").forEach((card) => {
    if (canHover) {
      card.addEventListener("mouseenter", () => startPreview(card));
      card.addEventListener("mouseleave", () => stopPreview(card));
      card.addEventListener("focus", () => startPreview(card));
      card.addEventListener("blur", () => stopPreview(card));
    }

    const open = () => {
      if (card.classList.contains("local")) openModal(card.dataset.full, card.dataset.title);
      else window.open(card.dataset.url, "_blank", "noopener");
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });

  /* touch devices: autoplay local previews while in view */
  if (!canHover) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.target.classList.contains("local")) return;
        en.isIntersecting ? startPreview(en.target) : stopPreview(en.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".card.local").forEach((c) => io.observe(c));
  }

  /* ---------- modal ---------- */
  const modal = document.getElementById("modal");
  const mv = document.getElementById("modal-video");
  const mt = document.getElementById("modal-title");
  function openModal(src, title) {
    mt.textContent = title || "";
    mv.src = src;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    mv.play().catch(() => {});
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    mv.pause();
    setTimeout(() => mv.removeAttribute("src"), 300);
  }
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  /* ---------- filter ---------- */
  const btns = document.querySelectorAll(".filter-btns button");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => x.classList.toggle("is-active", x === b));
    const f = b.dataset.filter;
    document.querySelectorAll(".genre").forEach((g) => g.classList.toggle("is-hidden", f !== "all" && g.dataset.genre !== f));
    document.getElementById("works").scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- reveal on scroll ---------- */
  const rev = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const i = [...en.target.parentElement.children].indexOf(en.target);
        setTimeout(() => en.target.classList.add("in"), i * 90);
        rev.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".card").forEach((c) => rev.observe(c));

  /* ---------- count up ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    let n = 0;
    const tick = () => { n++; el.textContent = String(n).padStart(2, "0"); if (n < target) setTimeout(tick, 120); };
    setTimeout(tick, 600);
  });
})();
