const weddingAudio = document.querySelector("#wedding-audio");
const audioSource = document.querySelector("#audio-source");
const audioToggle = document.querySelector("#audio-toggle");
const previousTrackButton = document.querySelector("#previous-track");
const nextTrackButton = document.querySelector("#next-track");
const favoriteToggle = document.querySelector("#favorite-toggle");
const playlistToggle = document.querySelector("#playlist-toggle");
const trackList = document.querySelector("#track-list");
const playlistPlusIcon = document.querySelector("#playlist-plus-icon");
const playlistCloseIcon = document.querySelector("#playlist-close-icon");
const trackTitle = document.querySelector("#track-title");
const trackComposer = document.querySelector("#track-composer");
const playerStatus = document.querySelector("#player-status");
const playIcon = document.querySelector("#play-icon");
const pauseIcon = document.querySelector("#pause-icon");

const tracks = [
  {
    title: "Clair de Lune",
    composer: "Claude Debussy",
    src: "assets/clair-de-lune.mp3",
    type: "audio/mpeg",
  },
  {
    title: "Gymnopédie No. 1",
    composer: "Erik Satie",
    src: "assets/gymnopedie-no-1.mp3",
    type: "audio/mpeg",
  },
  {
    title: "Nocturno op. 9 n.º 2",
    composer: "Frédéric Chopin",
    src: "assets/nocturne-op-9-no-2.mp3",
    type: "audio/mpeg",
  },
];

let currentTrackIndex = 0;
let playbackPending = false;
const favoriteTrackIndexes = new Set();
const trackOptions = trackList ? [...trackList.querySelectorAll(".track-option")] : [];

function updatePlaybackControl(isPlaying) {
  if (!audioToggle || !playIcon || !pauseIcon) return;
  audioToggle.dataset.playing = String(isPlaying);
  audioToggle.setAttribute("aria-pressed", String(isPlaying));
  audioToggle.setAttribute("aria-label", `${isPlaying ? "Pausar" : "Reproducir"} ${tracks[currentTrackIndex].title}`);
}

function playCurrentTrack() {
  playbackPending = true;
  updatePlaybackControl(true);
  return weddingAudio.play().then(() => {
    playbackPending = false;
    updatePlaybackControl(true);
  }).catch((error) => {
    playbackPending = false;
    updatePlaybackControl(false);
    throw error;
  });
}

function renderCurrentTrack() {
  const track = tracks[currentTrackIndex];
  trackTitle.textContent = track.title;
  trackComposer.textContent = track.composer;

  const isFavorite = favoriteTrackIndexes.has(currentTrackIndex);
  favoriteToggle.setAttribute("aria-pressed", String(isFavorite));
  favoriteToggle.setAttribute(
    "aria-label",
    `${isFavorite ? "Quitar" : "Guardar"} ${track.title} ${isFavorite ? "de" : "en"} favoritos`,
  );

  trackOptions.forEach((option, index) => {
    if (index === currentTrackIndex) option.setAttribute("aria-current", "true");
    else option.removeAttribute("aria-current");
  });
}

function setTrack(index, autoplay = false) {
  currentTrackIndex = (index + tracks.length) % tracks.length;
  const track = tracks[currentTrackIndex];

  weddingAudio.pause();
  playbackPending = false;
  updatePlaybackControl(false);
  audioSource.src = track.src;
  audioSource.type = track.type;
  weddingAudio.load();
  renderCurrentTrack();
  playerStatus.textContent = `Canción ${currentTrackIndex + 1} de ${tracks.length}: ${track.title}.`;

  if (autoplay) {
    playCurrentTrack().catch(() => {
      playerStatus.textContent = "No se pudo iniciar la reproducción. Vuelve a intentarlo.";
    });
  }
}

if (weddingAudio && audioSource && audioToggle && trackList && playerStatus && playIcon && pauseIcon) {
  renderCurrentTrack();
  updatePlaybackControl(false);

  weddingAudio.addEventListener("play", () => {
    playbackPending = false;
    updatePlaybackControl(true);
    playerStatus.textContent = `Reproduciendo ${tracks[currentTrackIndex].title}.`;
  });

  weddingAudio.addEventListener("pause", () => {
    playbackPending = false;
    updatePlaybackControl(false);
    if (!weddingAudio.ended) playerStatus.textContent = `En pausa: ${tracks[currentTrackIndex].title}.`;
  });

  weddingAudio.addEventListener("ended", () => {
    playbackPending = false;
    updatePlaybackControl(false);
    playerStatus.textContent = `Terminó ${tracks[currentTrackIndex].title}.`;
  });

  weddingAudio.addEventListener("error", () => {
    playerStatus.textContent = "No se pudo cargar esta pista.";
  });

  audioToggle.addEventListener("click", async () => {
    if (weddingAudio.paused && !playbackPending) {
      try {
        await playCurrentTrack();
      } catch {
        playerStatus.textContent = "No se pudo iniciar la reproducción. Vuelve a intentarlo.";
      }
    } else {
      playbackPending = false;
      weddingAudio.pause();
      updatePlaybackControl(false);
    }
  });

  const moveTrack = (direction) => {
    const wasPlaying = !weddingAudio.paused;
    setTrack(currentTrackIndex + direction, wasPlaying);
  };

  previousTrackButton.addEventListener("click", () => moveTrack(-1));
  nextTrackButton.addEventListener("click", () => moveTrack(1));

  favoriteToggle.addEventListener("click", () => {
    if (favoriteTrackIndexes.has(currentTrackIndex)) favoriteTrackIndexes.delete(currentTrackIndex);
    else favoriteTrackIndexes.add(currentTrackIndex);
    renderCurrentTrack();
  });

  playlistToggle.addEventListener("click", () => {
    const expanded = playlistToggle.getAttribute("aria-expanded") !== "true";
    playlistToggle.setAttribute("aria-expanded", String(expanded));
    playlistToggle.setAttribute("aria-label", expanded ? "Ocultar canciones" : "Ver canciones");
    trackList.hidden = !expanded;
    playlistPlusIcon.hidden = expanded;
    playlistCloseIcon.hidden = !expanded;
  });

  trackOptions.forEach((option) => {
    option.addEventListener("click", () => {
      setTrack(Number(option.dataset.trackIndex), true);
      trackList.hidden = true;
      playlistToggle.setAttribute("aria-expanded", "false");
      playlistToggle.setAttribute("aria-label", "Ver canciones");
      playlistPlusIcon.hidden = false;
      playlistCloseIcon.hidden = true;
    });
  });
}

const rsvpForm = document.querySelector("#rsvp-form");
if (rsvpForm) {
  const guestDetails = rsvpForm.querySelector("#rsvp-guest-details");
  const attendanceChoices = [...rsvpForm.querySelectorAll('input[name="attendance"]')];
  const guestCount = rsvpForm.querySelector("#rsvp-count");
  const companionName = rsvpForm.querySelector("#rsvp-companion");
  const companionRequired = rsvpForm.querySelector("#companion-required");
  const allergies = rsvpForm.querySelector("#rsvp-allergies");
  const rsvpStatus = rsvpForm.querySelector("#rsvp-status");

  function updateRsvpFields() {
    const selectedAttendance = attendanceChoices.find((choice) => choice.checked)?.value;
    const attending = selectedAttendance === "yes";
    const declining = selectedAttendance === "no";

    guestDetails.hidden = declining;
    guestDetails.setAttribute("aria-disabled", String(!attending));
    [guestCount, companionName, allergies].forEach((field) => {
      field.disabled = !attending;
    });

    guestCount.required = attending;
    companionName.required = attending && Number(guestCount.value) > 1;
    companionRequired.hidden = !companionName.required;
  }

  attendanceChoices.forEach((choice) => choice.addEventListener("change", updateRsvpFields));
  guestCount.addEventListener("change", updateRsvpFields);
  updateRsvpFields();

  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    rsvpStatus.hidden = false;
    rsvpStatus.textContent = "Vista previa: este formulario aún no envía ni guarda las respuestas.";
  });
}

