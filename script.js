/* ========================================
   CONVITE JOEL — interações da opção 1
   JavaScript puro, pronto para hospedagem estática.
   ======================================== */

"use strict";

const body = document.body;
const openButton = document.querySelector("#abrir-convite");
const closeButton = document.querySelector("#fechar-convite");
const invitation = document.querySelector("#convite");
const invitationTitle = document.querySelector("#titulo-convite");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Alterna entre capa e convite, mantendo foco e leitores de tela sincronizados. */
function setInvitationOpen(shouldOpen) {
  body.classList.toggle("is-open", shouldOpen);
  body.classList.toggle("is-closed", !shouldOpen);
  openButton.setAttribute("aria-expanded", String(shouldOpen));
  invitation.setAttribute("aria-hidden", String(!shouldOpen));
  invitation.inert = !shouldOpen;

  if (shouldOpen) {
    invitation.scrollTop = 0;
    window.setTimeout(() => invitationTitle.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 260);
  } else {
    window.setTimeout(() => openButton.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 260);
  }
}

openButton.addEventListener("click", () => setInvitationOpen(true));
closeButton.addEventListener("click", () => setInvitationOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("is-open")) setInvitationOpen(false);
});

/** Inicia cada carrossel com arraste nativo, botões, pontos e teclado. */
function setupCarousel(carousel) {
  const track = carousel.querySelector(".gift-track");
  const slides = [...track.children];
  const previousButton = carousel.querySelector("[data-prev]");
  const nextButton = carousel.querySelector("[data-next]");
  const dotsContainer = carousel.querySelector(".carousel__dots");
  let activeIndex = 0;
  let scrollFrame = null;

  // Os pontos são botões reais: também funcionam com toque e teclado.
  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver sugestão ${index + 1}`);
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.append(dot);
    return dot;
  });

  function goToSlide(index) {
    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({
      left: slides[safeIndex].offsetLeft - track.offsetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  }

  function updateControls() {
    const currentPosition = track.scrollLeft + track.offsetLeft;
    activeIndex = slides.reduce((closest, slide, index) => {
      const currentDistance = Math.abs(slide.offsetLeft - currentPosition);
      const closestDistance = Math.abs(slides[closest].offsetLeft - currentPosition);
      return currentDistance < closestDistance ? index : closest;
    }, 0);

    previousButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
    dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === activeIndex)));
  }

  previousButton.addEventListener("click", () => goToSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => goToSlide(activeIndex + 1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); goToSlide(activeIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); goToSlide(activeIndex - 1); }
  });

  // requestAnimationFrame evita atualizações excessivas durante o gesto.
  track.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      updateControls();
      scrollFrame = null;
    });
  }, { passive: true });

  window.addEventListener("resize", updateControls, { passive: true });
  updateControls();
}

document.querySelectorAll("[data-carousel]").forEach(setupCarousel);
