(() => {
  "use strict";
  const e = (e, t = document) => t.querySelector(e),
    t = (e, t = document) => Array.from(t.querySelectorAll(e)),
    n = ["mp3", "ogg", "wav", "flac", "m4a", "aac", "mp4"],
    o = [
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/flac",
      "audio/x-flac",
      "audio/mp4",
      "audio/m4a",
      "audio/x-m4a",
      "audio/aac",
    ];
  let isTimeEndFading = false;
  function toggleTimeEndFading(a) {
    isTimeEndFading = a;
    const t = e(".pp-time-end");
    if (t) t.classList.toggle("fading", a);
  }
  function retProg() {
    const p = e(".player-progress");
    if (p) {
      p.classList.add("returning");
      setTimeout(() => p.classList.remove("returning"), 250);
    }
  }
  let r = [],
    i = null,
    s = 1,
    a = null,
    l = !1,
    c = !1,
    d = 0,
    u = null,
    p = !1,
    h = null,
    m = !1;
  const g = ["name", "type", "size", "duration", "played"];
  let v = 0,
    f = !0,
    w = "",
    k = null;
  function b() {
    const e = w.toLowerCase().trim();
    return e ? r.filter((t) => t.name.toLowerCase().includes(e)) : r;
  }

  // Icons
  const y = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="5" cy="5" r="1.5" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/>
        <circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="19" r="1.5" fill="currentColor"/>
      </svg>`;
  const L = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 12c3-4 6-4 9 0s6 4 9 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="7.5" cy="9" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="16.5" cy="15" r="1.5" fill="currentColor" stroke="none"/>
        <circle cx="21" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      </svg>`;
  const x = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 20V8M18 20v-5M6 20v-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="9" y1="4" x2="15" y2="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  const C = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  const M = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2 12h20M4 12q2-8 6-8t6 16q4 0 6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  const E = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2 12h20M4 8h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  const T = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="8" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="16" cy="12" r="5" stroke="currentColor" stroke-width="1.6"/>
      </svg>`;
  const A = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2 20L12 4l10 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  const S = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>
      </svg>`;
  const $ = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="lgMark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop stop-color="#ff6076"/>
            <stop offset="1" stop-color="#a91a2c"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" stroke="url(#lgMark)" stroke-width="1.4"/>
        <circle cx="12" cy="12" r="2.2" fill="url(#lgMark)"/>
      </svg>`;
  const q = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 17V7l10-3v10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="6.5" cy="17" r="2.5" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="16.5" cy="14" r="2.5" stroke="currentColor" stroke-width="1.6"/>
      </svg>`;
  const B = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7.5 5.5v13l11-6.5-11-6.5z" fill="currentColor"/>
      </svg>`;
  const F = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>
        <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>
      </svg>`;
  const j = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
  const z = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
        <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>
      </svg>`;
  const D = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="repeat-icon">
        <path d="M17 1l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M7 23l-4-4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path class="repeat-one-path" d="M11 10h1v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  // Icons for requested track metadata: Name, Artist, Album, Comment, Composer, Discnumber, Genre, Track, Year, Lyrics
  const iconName = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const iconArtist = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const iconAlbum = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`;

  const iconComment = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="8" y1="13" x2="13" y2="13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`;

  const iconComposer = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="11" cy="11" r="1" fill="currentColor"/>
      </svg>`;

  const iconDiscnumber = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
        <path d="M6 12a6 6 0 0 1 6-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M18 12a6 6 0 0 1-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`;

  const iconGenre = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
      </svg>`;

  const iconTrack = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="10" y1="3" x2="8" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="16" y1="3" x2="14" y2="21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`;

  const iconYear = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="1.6"/>
      </svg>`;

  const iconLyrics = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 6h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M4 12h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M4 18h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M18 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0V8l4-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const iconTransition = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2 17c3.5 0 4.5-10 10-10s6.5 10 10 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19 14l3 3-3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

  const H = (e) => {
    const t = e / 1048576;
    return t >= 1 ? `${t.toFixed(2)} MB` : `${(e / 1024).toFixed(0)} KB`;
  };
  const R = (e) => {
    if (!isFinite(e) || e <= 0) return "0:00";
    const t = Math.floor(e / 3600),
      n = Math.floor((e % 3600) / 60),
      o = Math.floor(e % 60);
    return t > 0
      ? `${t}:${String(n).padStart(2, "0")}:${String(o).padStart(2, "0")}`
      : `${n}:${String(o).padStart(2, "0")}`;
  };
  const I = (e) => {
    const t = /\.([a-z0-9]+)$/i.exec(e);
    return t ? t[1].toLowerCase() : "";
  };
  const P = (e) =>
    !!n.includes(I(e.name)) ||
    !(!e.type || !o.includes(e.type.toLowerCase()));
  const Y = (e) =>
    e
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const N = (e) =>
    new Promise((t) => {
      const n = new Audio();
      n.preload = "metadata";
      n.src = e;
      let o = !1;
      const r = (e) => {
        o || ((o = !0), t(e));
      };
      n.addEventListener("loadedmetadata", () => r(n.duration || 0));
      n.addEventListener("error", () => r(0));
      setTimeout(() => r(0), 4e3);
    });
  const O = (e) =>
    String(e).replace(
      /[&<>"']/g,
      (e) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[e]
    );

  // Audio metadata parser (ID3v2, ID3v1, FLAC Vorbis, Ogg Vorbis, WAV INFO)
  function parseAudioTags(buffer) {
    const tags = {
      artist: "N/A",
      album: "N/A",
      comment: "N/A",
      composer: "N/A",
      discnumber: "N/A",
      genre: "N/A",
      track: "N/A",
      year: "N/A",
      lyrics: null,
      picture: null,
    };
    if (!buffer || buffer.byteLength < 10) return tags;
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    const ID3_GENRES = [
      "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop",
      "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock",
      "Techno", "Industrial", "Alternative", "Ska", "Death Metal", "Pranks", "Soundtrack",
      "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance",
      "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel",
      "Noise", "Alternative Rock", "Bass", "Soul", "Punk", "Space", "Meditative",
      "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic", "Darkwave",
      "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock",
      "Comedy", "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle",
      "Native American", "Cabaret", "New Wave", "Psychadelic", "Rave", "Showtunes",
      "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro",
      "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk-Rock", "National Folk",
      "Swing", "Fast Fusion", "Bebop", "Latin", "Revival", "Celtic", "Bluegrass",
      "Avantgarde", "Gothic Rock", "Progressive Rock", "Psychedelic Rock", "Symphonic Rock",
      "Slow Rock", "Big Band", "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech",
      "Chanson", "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus",
      "Porn Groove", "Satire", "Slow Jam", "Club", "Tango", "Samba", "Folklore", "Ballad",
      "Power Ballad", "Rhythmic Soul", "Freestyle", "Duet", "Punk Rock", "Drum Solo",
      "Acapella", "Euro-House", "Dance Hall", "Goa", "Drum & Bass", "Club-House",
      "Hardcore", "Terror", "Indie", "BritPop", "Negerpunk", "Polsk Punk", "Beat",
      "Christian Gangsta Rap", "Heavy Metal", "Black Metal", "Crossover", "Contemporary Christian",
      "Christian Rock", "Merengue", "Salsa", "Thrash Metal", "Anime", "Jpop", "Synthpop",
    ];

    function decodeText(slice, enc) {
      if (!slice || !slice.length) return "";
      try {
        if (enc === 0) {
          let s = "";
          for (let i = 0; i < slice.length; i++) {
            if (slice[i] === 0) break;
            s += String.fromCharCode(slice[i]);
          }
          return s.trim();
        } else if (enc === 1) {
          return new TextDecoder("utf-16").decode(slice).replace(/\0.*$/g, "").trim();
        } else if (enc === 2) {
          return new TextDecoder("utf-16be").decode(slice).replace(/\0.*$/g, "").trim();
        } else {
          return new TextDecoder("utf-8").decode(slice).replace(/\0.*$/g, "").trim();
        }
      } catch (err) {
        return "";
      }
    }

    function cleanVal(v) {
      if (!v) return "N/A";
      const s = String(v).replace(/\0/g, "").trim();
      return s.length > 0 ? s : "N/A";
    }

    function extractAPIC(slice, ver) {
      if (!slice || slice.length < 8) return null;
      try {
        const enc = slice[0];
        let pos = 1;
        let mime = "image/jpeg";
        if (ver === 2) {
          if (pos + 3 > slice.length) return null;
          const fmt = String.fromCharCode(slice[pos], slice[pos + 1], slice[pos + 2]).toLowerCase();
          pos += 3;
          mime = fmt === "png" ? "image/png" : fmt === "gif" ? "image/gif" : "image/jpeg";
          pos += 1;
          if (enc === 1 || enc === 2) {
            while (pos + 1 < slice.length && !(slice[pos] === 0 && slice[pos + 1] === 0)) pos += 2;
            pos += 2;
          } else {
            while (pos < slice.length && slice[pos] !== 0) pos++;
            pos++;
          }
        } else {
          let mimeEnd = pos;
          while (mimeEnd < slice.length && slice[mimeEnd] !== 0) mimeEnd++;
          if (mimeEnd > pos) {
            let mStr = "";
            for (let i = pos; i < mimeEnd; i++) mStr += String.fromCharCode(slice[i]);
            mStr = mStr.trim().toLowerCase();
            if (mStr && mStr !== "-->") mime = mStr;
          }
          pos = mimeEnd + 1;
          if (pos >= slice.length) return null;
          pos += 1; // picture type
          if (enc === 1 || enc === 2) {
            while (pos + 1 < slice.length && !(slice[pos] === 0 && slice[pos + 1] === 0)) pos += 2;
            pos += 2;
          } else {
            while (pos < slice.length && slice[pos] !== 0) pos++;
            pos++;
          }
        }
        if (pos >= slice.length) return null;
        const imgData = slice.subarray(pos);
        if (imgData.length < 4) return null;
        if (imgData[0] === 0x89 && imgData[1] === 0x50 && imgData[2] === 0x4e && imgData[3] === 0x47) {
          mime = "image/png";
        } else if (imgData[0] === 0xff && imgData[1] === 0xd8) {
          mime = "image/jpeg";
        } else if (imgData[0] === 0x47 && imgData[1] === 0x49 && imgData[2] === 0x46) {
          mime = "image/gif";
        } else if (imgData[0] === 0x52 && imgData[1] === 0x49 && imgData[2] === 0x46 && imgData[3] === 0x46) {
          mime = "image/webp";
        }
        return { data: imgData, mime };
      } catch (e) {
        return null;
      }
    }

    function parseFlacPictureBlock(u8, offset, length) {
      if (!u8 || offset + length > u8.length || length < 32) return null;
      try {
        const v = new DataView(u8.buffer, u8.byteOffset + offset, length);
        let p = 0;
        p += 4; // picture type
        const mimeLen = v.getUint32(p, false);
        p += 4;
        if (p + mimeLen > length) return null;
        let mime = "";
        for (let i = 0; i < mimeLen; i++) mime += String.fromCharCode(u8[offset + p + i]);
        mime = mime.trim().toLowerCase() || "image/jpeg";
        p += mimeLen;
        const descLen = v.getUint32(p, false);
        p += 4 + descLen;
        if (p + 16 > length) return null;
        p += 16; // width, height, depth, colors
        const dataLen = v.getUint32(p, false);
        p += 4;
        if (p + dataLen > length) return null;
        const imgData = u8.subarray(offset + p, offset + p + dataLen);
        if (imgData.length < 4) return null;
        if (imgData[0] === 0x89 && imgData[1] === 0x50) mime = "image/png";
        else if (imgData[0] === 0xff && imgData[1] === 0xd8) mime = "image/jpeg";
        return { data: imgData, mime };
      } catch (e) {
        return null;
      }
    }

    function extractUSLT(slice, enc) {
      if (!slice || slice.length < 4) return null;
      let p = 3;
      const isUTF16 = (enc === 1 || enc === 2);
      let isBE = (enc === 2);
      if (isUTF16) {
        if (p + 1 < slice.length) {
          if (slice[p] === 0xfe && slice[p + 1] === 0xff) {
            isBE = true;
            p += 2;
          } else if (slice[p] === 0xff && slice[p + 1] === 0xfe) {
            isBE = false;
            p += 2;
          }
        }
        let descEnd = p;
        while (descEnd + 1 < slice.length) {
          if (slice[descEnd] === 0 && slice[descEnd + 1] === 0) {
            descEnd += 2;
            break;
          }
          descEnd += 2;
        }
        const lyrSlice = slice.subarray(descEnd);
        if (lyrSlice.length > 0) {
          try {
            const dec = new TextDecoder(isBE ? "utf-16be" : "utf-16");
            const text = dec.decode(lyrSlice).replace(/^\0+/, "").replace(/\0+$/, "").trim();
            if (text) return text;
          } catch (e) {}
        }
        try {
          const dec = new TextDecoder(isBE ? "utf-16be" : "utf-16");
          const text = dec.decode(slice.subarray(3)).replace(/^\0+/, "").replace(/\0+$/, "").trim();
          if (text) return text;
        } catch (e) {}
      } else {
        while (p < slice.length && slice[p] !== 0) p++;
        if (p < slice.length && slice[p] === 0) p++;
        const lyrSlice = slice.subarray(p);
        if (lyrSlice.length > 0) {
          try {
            const text = new TextDecoder("utf-8").decode(lyrSlice).replace(/^\0+/, "").replace(/\0+$/, "").trim();
            if (text) return text;
          } catch (e) {}
          try {
            const text = new TextDecoder("windows-1252").decode(lyrSlice).replace(/^\0+/, "").replace(/\0+$/, "").trim();
            if (text) return text;
          } catch (e) {}
        }
        try {
          const text = new TextDecoder("utf-8").decode(slice.subarray(3)).replace(/^\0+/, "").replace(/\0+$/, "").trim();
          if (text) return text;
        } catch (e) {}
      }
      return null;
    }

    function extractSYLT(slice, enc) {
      if (!slice || slice.length < 6) return null;
      let p = 5;
      const isUTF16 = (enc === 1 || enc === 2);
      let isBE = (enc === 2);
      if (isUTF16) {
        if (p + 1 < slice.length && ((slice[p] === 0xff && slice[p + 1] === 0xfe) || (slice[p] === 0xfe && slice[p + 1] === 0xff))) p += 2;
        while (p + 1 < slice.length && !(slice[p] === 0 && slice[p + 1] === 0)) p += 2;
        p += 2;
      } else {
        while (p < slice.length && slice[p] !== 0) p++;
        p++;
      }
      const lines = [];
      const decoder = isUTF16 ? new TextDecoder(isBE ? "utf-16be" : "utf-16") : new TextDecoder("utf-8");
      while (p < slice.length) {
        const textStart = p;
        if (isUTF16) {
          while (p + 1 < slice.length && !(slice[p] === 0 && slice[p + 1] === 0)) p += 2;
          const textSlice = slice.subarray(textStart, p);
          p += 2;
          if (p + 4 <= slice.length) p += 4;
          try {
            const line = decoder.decode(textSlice).replace(/\0/g, "").trim();
            if (line) lines.push(line);
          } catch (e) {}
        } else {
          while (p < slice.length && slice[p] !== 0) p++;
          const textSlice = slice.subarray(textStart, p);
          p++;
          if (p + 4 <= slice.length) p += 4;
          try {
            const line = decoder.decode(textSlice).replace(/\0/g, "").trim();
            if (line) lines.push(line);
          } catch (e) {}
        }
      }
      if (lines.length > 0) return lines.join("\n");
      return null;
    }

    function extractTXXX(slice, enc) {
      if (!slice || slice.length < 2) return null;
      let p = 0;
      let desc = "";
      const isUTF16 = (enc === 1 || enc === 2);
      let isBE = (enc === 2);
      const decoder = isUTF16 ? new TextDecoder(isBE ? "utf-16be" : "utf-16") : new TextDecoder("utf-8");
      if (isUTF16) {
        if (slice.length >= 2 && ((slice[0] === 0xff && slice[1] === 0xfe) || (slice[0] === 0xfe && slice[1] === 0xff))) p += 2;
        const descStart = p;
        while (p + 1 < slice.length && !(slice[p] === 0 && slice[p + 1] === 0)) p += 2;
        try {
          desc = decoder.decode(slice.subarray(descStart, p)).trim();
        } catch (e) {}
        p += 2;
      } else {
        const descStart = p;
        while (p < slice.length && slice[p] !== 0) p++;
        try {
          desc = decoder.decode(slice.subarray(descStart, p)).trim();
        } catch (e) {}
        p++;
      }
      const cleanDesc = desc.toUpperCase().replace(/[\s_-]+/g, "");
      if (
        cleanDesc === "LYRICS" ||
        cleanDesc === "UNSYNCEDLYRICS" ||
        cleanDesc === "SYNCEDLYRICS" ||
        cleanDesc === "LYRIC" ||
        cleanDesc === "SCRIPT"
      ) {
        const valSlice = slice.subarray(p);
        try {
          const val = decoder.decode(valSlice).replace(/^\0+/, "").replace(/\0+$/, "").trim();
          if (val) return val;
        } catch (e) {}
      }
      return null;
    }

    // 1. ID3v2
    function parseID3v2(offset = 0) {
      if (offset + 10 > buffer.byteLength) return false;
      if (bytes[offset] !== 0x49 || bytes[offset + 1] !== 0x44 || bytes[offset + 2] !== 0x33) return false;
      const ver = bytes[offset + 3];
      const flags = bytes[offset + 5];
      const tagSize =
        ((bytes[offset + 6] & 0x7f) << 21) |
        ((bytes[offset + 7] & 0x7f) << 14) |
        ((bytes[offset + 8] & 0x7f) << 7) |
        (bytes[offset + 9] & 0x7f);
      let pos = offset + 10;
      const end = Math.min(buffer.byteLength, offset + 10 + tagSize);

      if ((flags & 0x40) !== 0 && pos + 4 <= end) {
        let extSize = 0;
        if (ver === 3) {
          extSize = view.getUint32(pos, false) + 4;
        } else if (ver === 4) {
          extSize =
            ((bytes[pos] & 0x7f) << 21) |
            ((bytes[pos + 1] & 0x7f) << 14) |
            ((bytes[pos + 2] & 0x7f) << 7) |
            (bytes[pos + 3] & 0x7f);
        }
        if (extSize > 0 && pos + extSize <= end) {
          pos += extSize;
        }
      }

      while (pos + 10 <= end) {
        let frameId = "";
        let frameSize = 0;
        if (ver === 2) {
          if (pos + 6 > end) break;
          frameId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2]);
          if (frameId.charCodeAt(0) === 0) break;
          frameSize = (bytes[pos + 3] << 16) | (bytes[pos + 4] << 8) | bytes[pos + 5];
          pos += 6;
        } else {
          frameId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
          if (frameId.charCodeAt(0) === 0) break;
          if (ver === 4) {
            const syncSafe =
              ((bytes[pos + 4] & 0x7f) << 21) |
              ((bytes[pos + 5] & 0x7f) << 14) |
              ((bytes[pos + 6] & 0x7f) << 7) |
              (bytes[pos + 7] & 0x7f);
            const standard =
              (bytes[pos + 4] << 24) | (bytes[pos + 5] << 16) | (bytes[pos + 6] << 8) | bytes[pos + 7];
            if (bytes[pos + 4] > 127 || bytes[pos + 5] > 127 || bytes[pos + 6] > 127 || bytes[pos + 7] > 127) {
              frameSize = standard;
            } else {
              frameSize = syncSafe;
            }
          } else {
            frameSize = (bytes[pos + 4] << 24) | (bytes[pos + 5] << 16) | (bytes[pos + 6] << 8) | bytes[pos + 7];
          }
          pos += 10;
        }
        if (frameSize <= 0 || pos + frameSize > end) break;

        const enc = bytes[pos];
        const dataSlice = bytes.subarray(pos + 1, pos + frameSize);

        if (frameId === "TPE1" || frameId === "TPE2" || frameId === "TP1") {
          if (tags.artist === "N/A") tags.artist = cleanVal(decodeText(dataSlice, enc));
        } else if (frameId === "TALB" || frameId === "TAL") {
          if (tags.album === "N/A") tags.album = cleanVal(decodeText(dataSlice, enc));
        } else if (frameId === "COMM" || frameId === "COM") {
          let cpos = 3;
          let desc = "";
          if (enc === 1 || enc === 2) {
            while (cpos + 1 < dataSlice.length && !(dataSlice[cpos] === 0 && dataSlice[cpos + 1] === 0)) cpos += 2;
            try {
              desc = new TextDecoder(enc === 2 ? "utf-16be" : "utf-16").decode(dataSlice.subarray(3, cpos)).trim();
            } catch (e) {}
            cpos += 2;
          } else {
            while (cpos < dataSlice.length && dataSlice[cpos] !== 0) cpos++;
            try {
              desc = new TextDecoder("utf-8").decode(dataSlice.subarray(3, cpos)).trim();
            } catch (e) {}
            cpos++;
          }
          const commentText = cleanVal(decodeText(dataSlice.subarray(cpos), enc));
          if (tags.comment === "N/A") tags.comment = commentText;
          const cleanDesc = desc.toUpperCase().replace(/[\s_-]+/g, "");
          if ((cleanDesc === "LYRICS" || cleanDesc === "UNSYNCEDLYRICS" || cleanDesc === "LYRIC") && !tags.lyrics && commentText !== "N/A") {
            tags.lyrics = commentText;
          } else if (!tags.lyrics && commentText !== "N/A" && commentText.length > 50 && commentText.includes("\n")) {
            tags.lyrics = commentText;
          }
        } else if (frameId === "TCOM" || frameId === "TCM") {
          if (tags.composer === "N/A") tags.composer = cleanVal(decodeText(dataSlice, enc));
        } else if (frameId === "TPOS" || frameId === "TPA") {
          if (tags.discnumber === "N/A") tags.discnumber = cleanVal(decodeText(dataSlice, enc));
        } else if (frameId === "TCON" || frameId === "TCO") {
          if (tags.genre === "N/A") {
            let g = cleanVal(decodeText(dataSlice, enc));
            const m = /^\((\d+)\)/.exec(g);
            if (m && ID3_GENRES[parseInt(m[1], 10)]) {
              g = ID3_GENRES[parseInt(m[1], 10)];
            } else if (/^\d+$/.test(g) && ID3_GENRES[parseInt(g, 10)]) {
              g = ID3_GENRES[parseInt(g, 10)];
            }
            tags.genre = cleanVal(g);
          }
        } else if (frameId === "TRCK" || frameId === "TRK") {
          if (tags.track === "N/A") tags.track = cleanVal(decodeText(dataSlice, enc));
        } else if (frameId === "TYER" || frameId === "TDRC" || frameId === "TYE") {
          if (tags.year === "N/A") {
            const y = cleanVal(decodeText(dataSlice, enc));
            const ym = /(\d{4})/.exec(y);
            tags.year = ym ? ym[1] : y;
          }
        } else if (frameId === "USLT" || frameId === "ULT") {
          if (!tags.lyrics) {
            const lyr = extractUSLT(dataSlice, enc);
            if (lyr) tags.lyrics = lyr;
          }
        } else if (frameId === "SYLT" || frameId === "SLT") {
          if (!tags.lyrics) {
            const lyr = extractSYLT(dataSlice, enc);
            if (lyr) tags.lyrics = lyr;
          }
        } else if (frameId === "TXXX" || frameId === "TXX") {
          if (!tags.lyrics) {
            const lyr = extractTXXX(dataSlice, enc);
            if (lyr) tags.lyrics = lyr;
          }
        } else if (frameId === "APIC" || frameId === "PIC") {
          if (!tags.picture) {
            const pic = extractAPIC(dataSlice, ver);
            if (pic) tags.picture = pic;
          }
        }
        pos += frameSize;
      }
      return true;
    }

    // 2. FLAC Vorbis
    function parseFLAC() {
      if (bytes[0] !== 0x66 || bytes[1] !== 0x4c || bytes[2] !== 0x61 || bytes[3] !== 0x43) return false;
      let pos = 4;
      while (pos + 4 < buffer.byteLength) {
        const header = bytes[pos];
        const isLast = (header & 0x80) !== 0;
        const type = header & 0x7f;
        const length = (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
        pos += 4;
        if (type === 4) {
          parseVorbisComment(pos, length);
        } else if (type === 6 && !tags.picture) {
          const pic = parseFlacPictureBlock(bytes, pos, length);
          if (pic) tags.picture = pic;
        }
        pos += length;
        if (isLast) break;
      }
      return true;
    }

    function parseVorbisComment(offset, length) {
      let p = offset;
      const end = offset + length;
      if (p + 4 > end) return;
      const vendorLen = view.getUint32(p, true);
      p += 4 + vendorLen;
      if (p + 4 > end) return;
      const commentCount = view.getUint32(p, true);
      p += 4;
      for (let i = 0; i < commentCount && p + 4 <= end; i++) {
        const cLen = view.getUint32(p, true);
        p += 4;
        if (p + cLen > end) break;
        const str = new TextDecoder("utf-8").decode(bytes.subarray(p, p + cLen));
        p += cLen;
        const eq = str.indexOf("=");
        if (eq > 0) {
          const key = str.slice(0, eq).toUpperCase().trim();
          const val = cleanVal(str.slice(eq + 1));
          if (key === "ARTIST" && tags.artist === "N/A") tags.artist = val;
          else if (key === "ALBUM" && tags.album === "N/A") tags.album = val;
          else if ((key === "COMMENT" || key === "DESCRIPTION") && tags.comment === "N/A") tags.comment = val;
          else if (key === "COMPOSER" && tags.composer === "N/A") tags.composer = val;
          else if (key === "DISCNUMBER" && tags.discnumber === "N/A") tags.discnumber = val;
          else if (key === "GENRE" && tags.genre === "N/A") tags.genre = val;
          else if ((key === "TRACKNUMBER" || key === "TRACK") && tags.track === "N/A") tags.track = val;
          else if ((key === "DATE" || key === "YEAR") && tags.year === "N/A") {
            const ym = /(\d{4})/.exec(val);
          } else if (
            key === "LYRICS" ||
            key === "UNSYNCEDLYRICS" ||
            key === "UNSYNCED LYRICS" ||
            key === "UNSYNCED_LYRICS" ||
            key === "SYNCEDLYRICS" ||
            key === "LYRIC" ||
            key === "TEXT"
          ) {
            const rawVal = str.slice(eq + 1).replace(/\0/g, "").trim();
            if (rawVal) {
              tags.lyrics = tags.lyrics ? tags.lyrics + "\n" + rawVal : rawVal;
            }
          } else if (key === "METADATA_BLOCK_PICTURE" && !tags.picture) {
            try {
              const raw = atob(val);
              const u8 = new Uint8Array(raw.length);
              for (let j = 0; j < raw.length; j++) u8[j] = raw.charCodeAt(j);
              const pic = parseFlacPictureBlock(u8, 0, u8.length);
              if (pic) tags.picture = pic;
            } catch (err) {}
          } else if (key === "COVERART" && !tags.picture) {
            try {
              const raw = atob(val);
              const u8 = new Uint8Array(raw.length);
              for (let j = 0; j < raw.length; j++) u8[j] = raw.charCodeAt(j);
              let mime = (u8[0] === 0x89 && u8[1] === 0x50) ? "image/png" : "image/jpeg";
              tags.picture = { data: u8, mime };
            } catch (err) {}
          }
        }
      }
    }

    // 3. Ogg Vorbis
    function parseOGG() {
      if (bytes[0] !== 0x4f || bytes[1] !== 0x67 || bytes[2] !== 0x67 || bytes[3] !== 0x53) return false;
      for (let i = 0; i < Math.min(buffer.byteLength - 7, 8192); i++) {
        if (
          bytes[i] === 3 &&
          bytes[i + 1] === 0x76 &&
          bytes[i + 2] === 0x6f &&
          bytes[i + 3] === 0x72 &&
          bytes[i + 4] === 0x62 &&
          bytes[i + 5] === 0x69 &&
          bytes[i + 6] === 0x73
        ) {
          parseVorbisComment(i + 7, buffer.byteLength - (i + 7));
          return true;
        }
      }
      return false;
    }

    // 4. WAV RIFF
    function parseWAV() {
      if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) return false;
      let p = 12;
      while (p + 8 < buffer.byteLength) {
        const chunkId = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
        const chunkSize = view.getUint32(p + 4, true);
        p += 8;
        if (chunkId.toLowerCase() === "id3 " || chunkId === "ID3") {
          parseID3v2(p);
        } else if (chunkId === "LIST" && p + 4 <= buffer.byteLength) {
          const type = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
          if (type === "INFO") {
            let ip = p + 4;
            const iend = p + chunkSize;
            while (ip + 8 < iend) {
              const subId = String.fromCharCode(bytes[ip], bytes[ip + 1], bytes[ip + 2], bytes[ip + 3]);
              const subSize = view.getUint32(ip + 4, true);
              ip += 8;
              if (ip + subSize > iend) break;
              const str = cleanVal(new TextDecoder("utf-8").decode(bytes.subarray(ip, ip + subSize)));
              if (subId === "IART" && tags.artist === "N/A") tags.artist = str;
              else if (subId === "IPRD" && tags.album === "N/A") tags.album = str;
              else if (subId === "ICMT" && tags.comment === "N/A") tags.comment = str;
              else if (subId === "IGNR" && tags.genre === "N/A") tags.genre = str;
              else if (subId === "ITRK" && tags.track === "N/A") tags.track = str;
              else if (subId === "ICRD" && tags.year === "N/A") {
                const ym = /(\d{4})/.exec(str);
                tags.year = ym ? ym[1] : str;
              }
              ip += subSize + (subSize % 2);
            }
          }
        }
        p += chunkSize + (chunkSize % 2);
      }
      return true;
    }

    // 5. MP4 / M4A metadata & cover & lyrics
    function parseMP4() {
      if (buffer.byteLength < 32) return false;
      let foundAny = false;
      const scanLimit = Math.min(buffer.byteLength - 8, 33554432);

      function extractDataPayload(startPos) {
        let p = startPos;
        while (p + 16 <= buffer.byteLength) {
          const sz = view.getUint32(p, false);
          if (sz < 8 || p + sz > buffer.byteLength) break;
          const nm = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7]);
          if (nm === "data") {
            const type = view.getUint32(p + 8, false);
            const payload = bytes.subarray(p + 16, p + sz);
            return { type, payload };
          }
          p += sz;
        }
        return null;
      }

      for (let i = 0; i < scanLimit; i++) {
        const b0 = bytes[i];
        const b1 = bytes[i + 1];
        const b2 = bytes[i + 2];
        const b3 = bytes[i + 3];

        if (
          (b0 === 0xa9 && b1 === 0x6c && b2 === 0x79 && b3 === 0x72) ||
          (b0 === 0xa9 && b1 === 0x4c && b2 === 0x59 && b3 === 0x52) ||
          (b0 === 0x6c && b1 === 0x79 && b2 === 0x72 && b3 === 0x20)
        ) {
          if (!tags.lyrics) {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).replace(/^\0+/, "").replace(/\0+$/, "").trim();
                if (text) {
                  tags.lyrics = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        } else if (b0 === 0x63 && b1 === 0x6f && b2 === 0x76 && b3 === 0x72) {
          if (!tags.picture) {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              const mime = res.type === 14 ? "image/png" : "image/jpeg";
              tags.picture = { data: res.payload, mime };
              foundAny = true;
            }
          }
        } else if (
          (b0 === 0xa9 && b1 === 0x41 && b2 === 0x52 && b3 === 0x54) ||
          (b0 === 0x61 && b1 === 0x41 && b2 === 0x52 && b3 === 0x54)
        ) {
          if (tags.artist === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                if (text) {
                  tags.artist = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        } else if (b0 === 0xa9 && b1 === 0x61 && b2 === 0x6c && b3 === 0x62) {
          if (tags.album === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                if (text) {
                  tags.album = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        } else if (b0 === 0xa9 && b1 === 0x64 && b2 === 0x61 && b3 === 0x79) {
          if (tags.year === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                const m = /(\d{4})/.exec(text);
                tags.year = m ? m[1] : text;
                foundAny = true;
              } catch (e) {}
            }
          }
        } else if (
          (b0 === 0xa9 && b1 === 0x67 && b2 === 0x65 && b3 === 0x6e) ||
          (b0 === 0x67 && b1 === 0x6e && b2 === 0x72 && b3 === 0x65)
        ) {
          if (tags.genre === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                if (text) {
                  tags.genre = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        } else if (b0 === 0xa9 && b1 === 0x63 && b2 === 0x6d && b3 === 0x74) {
          if (tags.comment === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                if (text) {
                  tags.comment = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        } else if (b0 === 0xa9 && b1 === 0x77 && b2 === 0x72 && b3 === 0x74) {
          if (tags.composer === "N/A") {
            const res = extractDataPayload(i + 4);
            if (res && res.payload.length > 0) {
              try {
                const text = new TextDecoder("utf-8").decode(res.payload).trim();
                if (text) {
                  tags.composer = text;
                  foundAny = true;
                }
              } catch (e) {}
            }
          }
        }
      }
      return foundAny;
    }

    // 6. APEv2 tags
    function parseAPEv2() {
      if (buffer.byteLength < 64) return false;
      const tagHdr = [0x41, 0x50, 0x45, 0x54, 0x41, 0x47, 0x45, 0x58];
      let apePos = -1;
      const startScan = Math.max(0, buffer.byteLength - 131072);
      for (let i = startScan; i <= buffer.byteLength - 32; i++) {
        if (
          bytes[i] === tagHdr[0] &&
          bytes[i + 1] === tagHdr[1] &&
          bytes[i + 2] === tagHdr[2] &&
          bytes[i + 3] === tagHdr[3] &&
          bytes[i + 4] === tagHdr[4] &&
          bytes[i + 5] === tagHdr[5] &&
          bytes[i + 6] === tagHdr[6] &&
          bytes[i + 7] === tagHdr[7]
        ) {
          apePos = i;
          break;
        }
      }
      if (apePos === -1) {
        for (let i = 0; i <= Math.min(buffer.byteLength - 32, 65536); i++) {
          if (
            bytes[i] === tagHdr[0] &&
            bytes[i + 1] === tagHdr[1] &&
            bytes[i + 2] === tagHdr[2] &&
            bytes[i + 3] === tagHdr[3] &&
            bytes[i + 4] === tagHdr[4] &&
            bytes[i + 5] === tagHdr[5] &&
            bytes[i + 6] === tagHdr[6] &&
            bytes[i + 7] === tagHdr[7]
          ) {
            apePos = i;
            break;
          }
        }
      }
      if (apePos === -1) return false;
      try {
        const v = new DataView(buffer, apePos, 32);
        const tagSize = v.getUint32(12, true);
        const itemCount = v.getUint32(16, true);
        const flags = v.getUint32(20, true);
        const isHeader = (flags & (1 << 29)) !== 0;
        let dataStart = isHeader ? apePos + 32 : apePos - tagSize + 32;
        if (dataStart < 0 || dataStart + tagSize > buffer.byteLength) dataStart = apePos + 32;
        let p = dataStart;
        const end = Math.min(buffer.byteLength, dataStart + tagSize);
        for (let i = 0; i < itemCount && p + 8 < end; i++) {
          const valLen = view.getUint32(p, true);
          const itemFlags = view.getUint32(p + 4, true);
          p += 8;
          let key = "";
          while (p < end && bytes[p] !== 0) {
            key += String.fromCharCode(bytes[p]);
            p++;
          }
          p++;
          if (p + valLen > end) break;
          const isBinary = ((itemFlags >> 1) & 3) === 1;
          const valBytes = bytes.subarray(p, p + valLen);
          p += valLen;
          if (!isBinary) {
            const textVal = new TextDecoder("utf-8").decode(valBytes).trim();
            const upperKey = key.toUpperCase().replace(/[\s_-]+/g, "");
            if (
              (upperKey === "LYRICS" ||
                upperKey === "UNSYNCEDLYRICS" ||
                upperKey === "SYNCEDLYRICS" ||
                upperKey === "LYRIC") &&
              !tags.lyrics
            ) {
              tags.lyrics = textVal;
            } else if (upperKey === "ARTIST" && tags.artist === "N/A") {
              tags.artist = textVal;
            } else if (upperKey === "ALBUM" && tags.album === "N/A") {
              tags.album = textVal;
            } else if (upperKey === "GENRE" && tags.genre === "N/A") {
              tags.genre = textVal;
            } else if (upperKey === "YEAR" && tags.year === "N/A") {
              tags.year = textVal;
            } else if (upperKey === "COMMENT" && tags.comment === "N/A") {
              tags.comment = textVal;
            }
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    }

    // 7. ID3v1
    function parseID3v1() {
      if (buffer.byteLength < 128) return;
      const p = buffer.byteLength - 128;
      if (bytes[p] === 0x54 && bytes[p + 1] === 0x41 && bytes[p + 2] === 0x47) {
        if (tags.artist === "N/A") tags.artist = cleanVal(new TextDecoder("iso-8859-1").decode(bytes.subarray(p + 33, p + 63)));
        if (tags.album === "N/A") tags.album = cleanVal(new TextDecoder("iso-8859-1").decode(bytes.subarray(p + 63, p + 93)));
        if (tags.year === "N/A") tags.year = cleanVal(new TextDecoder("iso-8859-1").decode(bytes.subarray(p + 93, p + 97)));
        if (bytes[p + 125] === 0 && bytes[p + 126] !== 0) {
          if (tags.comment === "N/A") tags.comment = cleanVal(new TextDecoder("iso-8859-1").decode(bytes.subarray(p + 97, p + 125)));
          if (tags.track === "N/A") tags.track = cleanVal(String(bytes[p + 126]));
        } else {
          if (tags.comment === "N/A") tags.comment = cleanVal(new TextDecoder("iso-8859-1").decode(bytes.subarray(p + 97, p + 127)));
        }
        if (tags.genre === "N/A") {
          const gIdx = bytes[p + 127];
          if (ID3_GENRES[gIdx]) tags.genre = ID3_GENRES[gIdx];
        }
      }
    }

    // Parse all metadata formats
    let id3Found = parseID3v2(0);
    if (!id3Found) {
      for (let i = 1; i <= Math.min(buffer.byteLength - 10, 65536); i++) {
        if (bytes[i] === 0x49 && bytes[i + 1] === 0x44 && bytes[i + 2] === 0x33) {
          if (parseID3v2(i)) {
            id3Found = true;
            break;
          }
        }
      }
    }
    if (!id3Found && buffer.byteLength > 128) {
      for (let i = buffer.byteLength - 128; i <= buffer.byteLength - 10; i++) {
        if (bytes[i] === 0x33 && bytes[i + 1] === 0x44 && bytes[i + 2] === 0x49) {
          const tagSize =
            ((bytes[i + 6] & 0x7f) << 21) |
            ((bytes[i + 7] & 0x7f) << 14) |
            ((bytes[i + 8] & 0x7f) << 7) |
            (bytes[i + 9] & 0x7f);
          const tagOffset = i - tagSize;
          if (
            tagOffset >= 0 &&
            bytes[tagOffset] === 0x49 &&
            bytes[tagOffset + 1] === 0x44 &&
            bytes[tagOffset + 2] === 0x33
          ) {
            parseID3v2(tagOffset);
            break;
          }
        }
      }
    }

    parseFLAC();
    parseOGG();
    parseWAV();
    parseMP4();
    parseAPEv2();
    parseID3v1();

    if (tags.lyrics) {
      tags.lyrics = tags.lyrics.replace(/\0/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      if (!tags.lyrics) tags.lyrics = null;
    }

    return tags;
  }

  function U(e) {
    for (const t of e) {
      if (t && t.wrapEl && t.innerEl) {
        t.innerEl.style.transform = "";
      }
    }
    const t = [];
    for (const n of e) {
      if (n && n.wrapEl && n.innerEl) {
        const scrollDiff = n.innerEl.scrollWidth - n.wrapEl.clientWidth;
        const innerRect = n.innerEl.getBoundingClientRect();
        const wrapRect = n.wrapEl.getBoundingClientRect();
        const rectDiff = innerRect.width - wrapRect.width;
        const overflow = Math.max(scrollDiff, rectDiff);
        t.push({
          wrap: n.wrapEl,
          inner: n.innerEl,
          overflow: overflow,
        });
      }
    }
    for (const item of t) {
      if (item.overflow > 0.5) {
        item.wrap.classList.add("long");
        item.inner.style.setProperty(
          "--marquee-shift",
          `-${Math.ceil(item.overflow) + 24}px`
        );
      } else {
        item.wrap.classList.remove("long");
        item.inner.style.removeProperty("--marquee-shift");
      }
    }
  }
  function W(e, t) {
    U([{ wrapEl: e, innerEl: t }]);
  }
  function X(e) {
    const n = new Map(),
      o = t(".rail-sound", e).length > 0;
    return (
      t(o ? ".rail-sound" : ".sound-card", e).forEach((e) =>
        n.set(e.dataset.id, e.getBoundingClientRect())
      ),
      n
    );
  }
  function V(e, n, o = {}) {
    const r = o.duration ?? 420,
      i = o.ease ?? "cubic-bezier(0.16, 1, 0.3, 1)",
      s = t(".rail-sound", n).length > 0;
    t(s ? ".rail-sound" : ".sound-card", n).forEach((t) => {
      const n = e.get(t.dataset.id);
      if (!n) return;
      const o = t.getBoundingClientRect(),
        s = n.left - o.left,
        a = n.top - o.top;
      if (Math.abs(s) < 0.5 && Math.abs(a) < 0.5) return;
      t.classList.add("flipping");
      t.style.transition =
        "transform 0s, background var(--d-mid) var(--ease-soft), border-color var(--d-mid) var(--ease-soft), box-shadow var(--d-mid) var(--ease-soft), opacity var(--d-mid) var(--ease-out), color var(--d-mid) var(--ease-soft)";
      t.style.transform = `translate(${s}px, ${a}px)`;
      t.getBoundingClientRect();
      requestAnimationFrame(() => {
        t.style.transition = `transform ${r}ms ${i}, background var(--d-mid) var(--ease-soft), border-color var(--d-mid) var(--ease-soft), box-shadow var(--d-mid) var(--ease-soft), opacity var(--d-mid) var(--ease-out), color var(--d-mid) var(--ease-soft)`;
        t.style.transform = "";
      });
      const l = () => {
        t.classList.remove("flipping");
        t.style.transition = "";
        t.style.transform = "";
        t.removeEventListener("transitionend", l);
      };
      t.addEventListener("transitionend", l);
    });
  }

  function G() {
    e("#rail");
    const n = e("#railLogo"),
      o = e("#railMark"),
      G = e("#railCount"),
      K = e("#railSounds"),
      Z = e("#railAdd"),
      _ = e("#railAddIcon"),
      J = e("#sidebar"),
      Q = e("#headMark"),
      ee = e("#headClose"),
      te = e("#soundList"),
      ne = e("#libraryCount"),
      oe = e("#orderBtnToggle"),
      re = e("#iconAsc"),
      ie = e("#iconDesc"),
      se = e("#sortBtnMain"),
      ae = e("#sortBtnMainIconWrap"),
      le = e("#sortBtnDrop"),
      ce = e("#sortMenu"),
      de = e("#emptyState"),
      ue = e("#searchEmptyState"),
      pe = e("#searchWrap"),
      he = e("#searchInput"),
      me = e("#addButton"),
      ge = e("#addIcon"),
      ve = e("#fileInput"),
      fe = e("#brandMark"),
      we = e("#dropOverlay"),
      ke = e("#backdrop"),
      be = e("#blurLayer"),
      ye = e("#editModal"),
      Le = e("#editInput"),
      xe = e("#editSave"),
      editSearchWrap = e("#editSearchWrap"),
      editSearchInput = e("#editSearchInput"),
      editSearchClear = e("#editSearchClear"),
      editContentWrap = e("#editContentWrap"),
      editContent = e("#editContent"),
      editScrollbar = e("#editScrollbar"),
      editScrollbarThumb = e("#editScrollbarThumb"),
      Ce = e("#contextMenu"),
      Me = e("#contextEdit"),
      Ee = e("#contextInfo"),
      Te = e("#contextDelete"),
      ctxPin = e("#contextPin"),
      Ae = e("#infoModal"),
      Se = e("#infoContentWrap"),
      $e = e("#infoContent"),
      qe = e("#infoScrollbar"),
      Be = e("#infoScrollbarThumb"),
      infoSearchWrap = e("#infoSearchWrap"),
      infoSearchInput = e("#infoSearchInput"),
      infoSearchClear = e("#infoSearchClear"),
      Fe = e("#topbar"),
      je = Fe ? Fe.querySelector(".topbar-inner") : null,
      ze = e("#topbarName"),
      De = e("#topbarNameInner"),
      He = e("#topbarType"),
      Re = e("#topbarSize"),
      Ie = e("#topbarDuration"),
      topbarCover = e("#topbarCover"),
      topbarCoverSep = e("#topbarCoverSep"),
      lyricsModal = e("#lyricsModal"),
      lyricsTitle = e("#lyricsTitle"),
      lyricsSearchWrap = e("#lyricsSearchWrap"),
      lyricsSearchInput = e("#lyricsSearchInput"),
      lyricsSearchClear = e("#lyricsSearchClear"),
      lyricsBody = e("#lyricsBody"),
      lyricsView = e("#lyricsView"),
      lyricsText = e("#lyricsText"),
      lyricsEmpty = e("#lyricsEmpty"),
      lyricsEditPane = e("#lyricsEditPane"),
      lyricsTextarea = e("#lyricsTextarea"),
      lyricsEditToggle = e("#lyricsEditToggle"),
      lyricsCloseBtn = e("#lyricsCloseBtn"),
      lyricsSaveBtn = e("#lyricsSaveBtn");
    let Pe = null,
      Ye = null,
      isPinnedCollapsed = false,
      lyricsTrackId = null,
      isLyricsEditing = false,
      isLyricsBusy = false,
      lyricsAnimTimer = null,
      isTrackInfoBusy = false,
      trackInfoAnimTimer = null,
      isSidebarAnimating = false,
      sidebarAnimTimer = null;

    function openTrackInfoModal(trackId) {
      if (isTrackInfoBusy) return;
      const sound = r.find((s) => s.id === trackId);
      if (!sound) return;

      isTrackInfoBusy = true;
      jt(trackId);

      let animDone = false;
      let loadDone = sound.advMeta !== "loading";

      function checkReady() {
        if (animDone && loadDone) {
          isTrackInfoBusy = false;
        }
      }

      clearTimeout(trackInfoAnimTimer);
      trackInfoAnimTimer = setTimeout(() => {
        animDone = true;
        checkReady();
      }, 340);

      if (!loadDone) {
        const interval = setInterval(() => {
          if (!Ae || !Ae.classList.contains("open")) {
            clearInterval(interval);
            isTrackInfoBusy = false;
            return;
          }
          if (sound.advMeta !== "loading") {
            clearInterval(interval);
            loadDone = true;
            checkReady();
          }
        }, 50);
      }
    }

    function closeTrackInfoModal() {
      if (Ae && Ae.classList.contains("open")) {
        isTrackInfoBusy = true;
        Ae.classList.remove("open");
        Ae.setAttribute("aria-hidden", "true");
        if (infoSearchInput) infoSearchInput.value = "";
        if (infoSearchWrap) infoSearchWrap.classList.remove("has-text", "is-focused");
        filterInfoCards("", false);
        clearTimeout(trackInfoAnimTimer);
        trackInfoAnimTimer = setTimeout(() => {
          isTrackInfoBusy = false;
        }, 340);
      }
    }

    function highlightInfoMatches(text, query) {
      if (!query || !text) return O(text);
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = String(text).split(regex);
      return parts
        .map((part) => {
          if (part.toLowerCase() === query.toLowerCase()) {
            return `<mark class="info-highlight">${O(part)}</mark>`;
          }
          return O(part);
        })
        .join("");
    }

    function openLyricsModal(trackId, startEditing = false) {
      if (isLyricsBusy) return;
      const sound = r.find((s) => s.id === trackId);
      if (!sound) return;
      isLyricsBusy = true;
      lyricsTrackId = trackId;
      if (lyricsSearchInput) lyricsSearchInput.value = "";
      if (lyricsSearchWrap) lyricsSearchWrap.classList.remove("has-text", "is-focused");
      setLyricsEditMode(startEditing);
      updateLyricsDisplay(sound);
      if (lyricsModal) {
        lyricsModal.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => {
          lyricsModal.classList.add("open");
        });
      }
      clearTimeout(lyricsAnimTimer);
      lyricsAnimTimer = setTimeout(() => {
        isLyricsBusy = false;
      }, 340);
    }

    function closeLyricsModal() {
      if (lyricsModal && lyricsModal.classList.contains("open")) {
        isLyricsBusy = true;
        lyricsModal.classList.remove("open");
        lyricsModal.setAttribute("aria-hidden", "true");
        if (lyricsSearchInput) lyricsSearchInput.value = "";
        if (lyricsSearchWrap) lyricsSearchWrap.classList.remove("has-text", "is-focused");
        filterLyrics("");
        setLyricsEditMode(false);
        lyricsTrackId = null;
        clearTimeout(lyricsAnimTimer);
        lyricsAnimTimer = setTimeout(() => {
          isLyricsBusy = false;
        }, 340);
      }
    }

    function updateLyricsDisplay(sound) {
      const hasLyrics = !!(sound && sound.lyrics && sound.lyrics.trim());
      if (lyricsSearchInput) {
        lyricsSearchInput.value = "";
      }
      if (lyricsSearchWrap) {
        lyricsSearchWrap.classList.remove("has-text", "is-focused");
      }
      if (lyricsText && lyricsEmpty) {
        if (hasLyrics) {
          const lines = sound.lyrics.trim().split("\n");
          lyricsText.innerHTML =
            lines
              .map((line) => {
                const trimmed = line.trim();
                if (!trimmed) {
                  return `<div class="lyrics-line lyrics-line-blank" data-raw-text="">&nbsp;</div>`;
                }
                return `<div class="lyrics-line" data-raw-text="${O(line)}">${O(line)}</div>`;
              })
              .join("") +
            `
            <div class="lyrics-search-empty" id="lyricsSearchEmpty" style="display: none;">
              <div class="search-empty-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="8" x2="14" y2="14" />
                </svg>
              </div>
              <div class="search-empty-title">No matching lyrics found</div>
              <div class="search-empty-sub">Try searching for another word</div>
            </div>
          `;
          lyricsText.style.display = "block";
          lyricsEmpty.style.display = "none";
        } else {
          lyricsText.innerHTML = "";
          lyricsText.style.display = "none";
          lyricsEmpty.style.display = "flex";
        }
      }
      if (lyricsTextarea) {
        lyricsTextarea.value = sound && sound.lyrics ? sound.lyrics : "";
      }
    }

    function filterLyrics(query) {
      if (!lyricsText) return;
      const lines = Array.from(lyricsText.querySelectorAll(".lyrics-line"));
      const emptyEl = lyricsText.querySelector("#lyricsSearchEmpty");
      if (!lines.length) return;

      const q = (query || "").trim().toLowerCase();
      let matchCount = 0;

      for (const line of lines) {
        const raw = line.dataset.rawText || "";
        const isBlank = line.classList.contains("lyrics-line-blank");

        if (!q) {
          line.classList.remove("is-hidden");
          if (!isBlank) {
            line.textContent = raw;
          }
          matchCount++;
        } else {
          if (isBlank) {
            line.classList.add("is-hidden");
          } else {
            const matches = raw.toLowerCase().includes(q);
            if (matches) {
              matchCount++;
              line.classList.remove("is-hidden");
              line.innerHTML = highlightInfoMatches(raw, q);
            } else {
              line.classList.add("is-hidden");
              line.textContent = raw;
            }
          }
        }
      }

      if (emptyEl) {
        emptyEl.style.display = matchCount === 0 && q ? "flex" : "none";
      }
    }

    function setLyricsEditMode(editing) {
      isLyricsEditing = !!editing;
      if (isLyricsEditing) {
        if (lyricsView) lyricsView.style.display = "none";
        if (lyricsEditPane) lyricsEditPane.style.display = "flex";
        if (lyricsSaveBtn) lyricsSaveBtn.style.display = "inline-flex";
        if (lyricsCloseBtn) lyricsCloseBtn.textContent = "Cancel";
        lyricsEditToggle && lyricsEditToggle.classList.add("active");
        setTimeout(() => lyricsTextarea && lyricsTextarea.focus(), 50);
      } else {
        if (lyricsView) lyricsView.style.display = "block";
        if (lyricsEditPane) lyricsEditPane.style.display = "none";
        if (lyricsSaveBtn) lyricsSaveBtn.style.display = "none";
        if (lyricsCloseBtn) lyricsCloseBtn.textContent = "Close";
        lyricsEditToggle && lyricsEditToggle.classList.remove("active");
      }
    }

    function saveLyrics() {
      const sound = r.find((s) => s.id === lyricsTrackId);
      if (!sound) return;
      const val = (lyricsTextarea ? lyricsTextarea.value : "").trim();
      sound.lyrics = val ? val : null;
      if (sound.tags) {
        sound.tags.lyrics = sound.lyrics;
      }
      updateLyricsDisplay(sound);
      setLyricsEditMode(false);
      It("Lyrics saved", "success");
      if (Ae && Ae.classList.contains("open") && sound.id === a) {
        jt(sound.id);
      }
    }

    o && (o.innerHTML = $);
    Q && (Q.innerHTML = $);
    fe && (fe.innerHTML = $);
    _ && (_.innerHTML = j);
    ge && (ge.innerHTML = j);

    const Ne = (function () {
      const e = document.createElement("div");
      e.className = "player";
      e.innerHTML = `
        <div class="player-progress">
          <div class="pp-track">
            <div class="pp-fill"></div>
            <div class="pp-thumb">
              <div class="pp-thumb-dot"></div>
            </div>
          </div>
          <div class="pp-times">
            <span class="pp-time pp-time-start">0:00</span>
            <span class="pp-time pp-time-end">0:00</span>
            <span class="pp-thumb-label">0:00</span>
          </div>
        </div>
        <div class="player-controls">
          <button class="pc-btn pc-info" aria-label="Info" data-tip="Info" style="position: absolute; left: 0;">
            ${z}
          </button>
          <button class="pc-btn pc-lyrics" aria-label="Lyrics" data-tip="Lyrics" style="position: absolute; left: 46px;">
            ${iconLyrics}
          </button>
          <button class="pc-btn pc-shuffle" aria-label="Shuffle" data-tip="Shuffle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 3h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 20L21 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M21 16v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 15l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M4 4l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="pc-btn pc-prev" aria-label="Previous" data-tip="Previous">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 5h2v14H6z" fill="currentColor"/>
              <path d="M20 5L10 12l10 7V5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="pc-btn pc-play" aria-label="Play" data-tip="Play">
            <span class="pc-icon-stack">
              <span class="pc-icon-play">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M7 4.5v15l13-7.5L7 4.5z" fill="currentColor"/>
                </svg>
              </span>
              <span class="pc-icon-pause">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>
                  <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor"/>
                </svg>
              </span>
            </span>
          </button>
          <button class="pc-btn pc-stop" aria-label="Stop & Reset" data-tip="Stop & Reset">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/>
            </svg>
          </button>
          <button class="pc-btn pc-next" aria-label="Next" data-tip="Next">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 5h2v14h-2z" fill="currentColor"/>
              <path d="M4 5l10 7L4 19V5z" fill="currentColor"/>
            </svg>
          </button>
          <button class="pc-btn pc-repeat" aria-label="Repeat" data-tip="Repeat: off">
            ${D}
          </button>
        </div>
      `;

      const t = e.querySelector(".pp-fill"),
        n = e.querySelector(".pp-thumb"),
        o = e.querySelector(".pp-thumb-label"),
        r = e.querySelector(".pp-track"),
        s = e.querySelector(".pp-time-start"),
        a = e.querySelector(".pp-time-end"),
        l = e.querySelector(".pp-times"),
        p = e.querySelector(".pc-info"),
        pcLyrics = e.querySelector(".pc-lyrics"),
        h = e.querySelector(".pc-play"),
        g = e.querySelector(".pc-prev"),
        v = e.querySelector(".pc-next"),
        f = e.querySelector(".pc-shuffle"),
        w = e.querySelector(".pc-repeat");
      let k = 0,
        y = r.clientWidth,
        L = 0,
        x = !1,
        C = 0;

      function M(e) {
        (!isFinite(e) || e < 0) && (e = 0);
        const t = Math.floor(e / 60),
          n = Math.floor(e % 60);
        return `${t}:${String(n).padStart(2, "0")}`;
      }
      function E(e) {
        L = e;
        const r = Math.max(0, Math.min(1, e));
        t.style.width = `${r * 100}%`;
        const i = r * y;
        n.style.transform = `translate3d(calc(${i}px - 50%), -50%, 0)`;
        o.style.transform = `translate3d(calc(${i}px - 50%), -50%, 0)`;
      }
      function T(e) {
        if (!k) return s.classList.remove("hidden"), void a.classList.remove("hidden");
        const t = e * y,
          n = t < 55,
          o = t > y - 55;
        s.classList.toggle("hidden", n);
        a.classList.toggle("hidden", o);
      }
      l.style.cursor = "pointer";
      l?.addEventListener("click", () => {
        k &&
          ((a.style.opacity = "0"),
          setTimeout(() => {
            x = !x;
            $ = "";
            q(C, k);
            a.style.opacity = "";
          }, 180));
      });
      new ResizeObserver((e) => {
        for (let t of e) y = t.contentRect.width;
        E(L);
        T(L);
      }).observe(r);

      let A = -1,
        S = "",
        $ = "";

      function q(e, t) {
        C = e;
        isFinite(t) && t > 0 && (k = t);
        k !== A && ((s.textContent = "0:00"), (A = k));
        let n = "";
        n = x ? "-" + M(Math.max(0, k - e)) : M(k);
        n !== $ && !isTimeEndFading && ((a.textContent = n), ($ = n));
        const r = M(e);
        r !== S && ((o.textContent = r), (S = r));
        const i = k > 0 ? e / k : 0;
        E(i);
        T(i);
      }

      function B(e) {
        h.classList.toggle("is-playing", e);
        h.setAttribute("aria-label", e ? "Pause" : "Play");
        h.setAttribute("data-tip", e ? "Pause" : "Play");
      }

      const F = e.querySelector(".pc-stop");

      function j(e) {
        c = !!e;
        f.classList.toggle("on", c);
        f.setAttribute("data-tip", c ? "Shuffle: on" : "Shuffle: off");
      }

      function updateShuffleAvailability() {
        const hasMultiple = b().length > 1;
        f.classList.toggle("is-unavailable", !hasMultiple);
        g.classList.toggle("is-unavailable", !hasMultiple);
        v.classList.toggle("is-unavailable", !hasMultiple);

        if (!hasMultiple) {
          if (c) j(false);
          if (d === 1) H(2);
        }
      }

      function H(e) {
        d = e;
        w.classList.remove("on", "one");
        0 === e
          ? w.setAttribute("data-tip", "Repeat: off")
          : 1 === e
          ? (w.classList.add("on"), w.setAttribute("data-tip", "Repeat: all"))
          : 2 === e &&
            (w.classList.add("on", "one"), w.setAttribute("data-tip", "Repeat: one"));
      }

      let trackRect = null;
      function R(e) {
        const t = (function (e) {
          const t = trackRect || r.getBoundingClientRect(),
            n = (e.touches ? e.touches[0].clientX : e.clientX) - t.left;
          return Math.max(0, Math.min(1, n / t.width));
        })(e);
        return k > 0 && q(t * k, k), t * (k || 0);
      }

      function I(e) {
        if (!k || (e.button !== undefined && e.button !== 0)) return;
        trackRect = r.getBoundingClientRect();
        m = !0;
        n.classList.add("dragging");
        r.classList.add("dragging");
        const t = R(e);
        if (u) {
          if (!isFadingToPause && !isSwitchFading) {
            cancelFade();
            u.volume = 1;
          }
          u.currentTime = t;
        }
        e.preventDefault();
      }

      function P(e) {
        if (!m) return;
        const t = R(e);
        u && (u.currentTime = t);
      }

      function Y() {
        m &&
          ((m = !1),
          (trackRect = null),
          n.classList.remove("dragging"),
          r.classList.remove("dragging"),
          u && Ne.update(u.currentTime, u.duration || 0));
      }

      return (
        h?.addEventListener("click", () => {
          i && mt(i);
        }),
        F &&
          F?.addEventListener("click", () => {
            cancelFade();
            i && (yt(true), u && (retProg(), u.currentTime = 0, u.volume = 1), (vt = 0), q(0, k));
          }),
        g?.addEventListener("click", () =>
          (function () {
            const e = b();
            if (!e.length) return;
            const t = e.findIndex((e) => e.id === i);
            const currentTrack = r.find((x) => x.id === i);
            if (u && u.currentTime > 3) {
              if (u && !u.paused) {
                const outProfile = computeAdaptiveFadeProfile(currentTrack, "out", u.currentTime);
                const inProfile = computeAdaptiveFadeProfile(currentTrack, "in", 0);
                fadeVolumeTo(
                  0,
                  Math.min(150, Math.round(outProfile.duration * 0.7)),
                  () => {
                    retProg();
                    u.currentTime = 0;
                    bt(i, false, inProfile);
                  },
                  outProfile.curveType,
                  outProfile.exponent
                );
              } else {
                retProg();
                u && (u.currentTime = 0);
              }
            } else if (t <= 0) {
              if (u && !u.paused) {
                const outProfile = computeAdaptiveFadeProfile(currentTrack, "out", u.currentTime);
                const inProfile = computeAdaptiveFadeProfile(currentTrack, "in", 0);
                fadeVolumeTo(
                  0,
                  Math.min(150, Math.round(outProfile.duration * 0.7)),
                  () => {
                    retProg();
                    u.currentTime = 0;
                    bt(i, false, inProfile);
                  },
                  outProfile.curveType,
                  outProfile.exponent
                );
              } else if (u) {
                retProg();
                u.currentTime = 0;
              }
            } else {
              xt(e[t - 1].id, !0);
            }
          })()
        ),
        v?.addEventListener("click", () => Lt()),
        p?.addEventListener("click", () => {
          i && openTrackInfoModal(i);
        }),
        pcLyrics?.addEventListener("click", () => {
          if (i) {
            openLyricsModal(i);
          } else {
            It("No audio playing", "info");
          }
        }),
        f?.addEventListener("click", () => {
          if (b().length <= 1) return;
          if (c) {
            j(false);
          } else {
            if (d !== 0) H(0);
            j(true);
            u &&
              (u.ended || (u.paused && k > 0 && Math.abs(u.currentTime - k) < 0.5)) &&
              Lt();
          }
        }),
        w?.addEventListener("click", () => {
          const sounds = b();
          if (sounds.length === 0) return;
          const hasMultiple = sounds.length > 1;
          if (!hasMultiple) {
            if (c) j(false);
            H(d === 2 ? 0 : 2);
          } else {
            if (c) {
              j(false);
              H(1);
            } else {
              H((d + 1) % 3);
            }
          }
          u &&
            (u.ended || (u.paused && k > 0 && Math.abs(u.currentTime - k) < 0.5)) &&
            (2 === d ? ((retProg(), (u.currentTime = 0)), bt()) : 1 === d && Lt());
        }),
        H(0),
        j(!1),
        updateShuffleAvailability(),
        n.addEventListener("mousedown", I),
        n.addEventListener("touchstart", I, { passive: !1 }),
        r.addEventListener("mousedown", (e) => {
          e.target.closest(".pp-thumb") || (k && I(e));
        }),
        r.addEventListener("touchstart", (e) => {
          e.target.closest(".pp-thumb") || (k && I(e));
        }, { passive: !1 }),
        window.addEventListener("mousemove", P),
        window.addEventListener("touchmove", P, { passive: !0 }),
        window.addEventListener("mouseup", Y),
        window.addEventListener("touchend", Y),
        B(!1),
        { root: e, update: q, setPlayState: B, updateShuffleAvailability, prevBtn: g, nextBtn: v, repeatBtn: w, shuffleBtn: f, stopBtn: F }
      );
    })();

    function updateAllMarquees() {
      if (te) {
        const cards = t(".sound-card", te);
        if (cards.length > 0) {
          const items = cards.map((card) => ({
            wrapEl: card.querySelector(".sound-name-wrap"),
            innerEl: card.querySelector(".sound-name"),
          }));
          U(items);
        }
      }
      if (ze && De) {
        W(ze, De);
      }
    }

    function Oe(e) {
      const shouldOpen = Boolean(e);
      const isCurrentOpen = Boolean(J && J.classList.contains("open"));
      if (isCurrentOpen === shouldOpen && !isSidebarAnimating) return;

      isSidebarAnimating = true;
      clearTimeout(sidebarAnimTimer);

      J && J.classList.toggle("open", shouldOpen);
      ke && ke.classList.toggle("show", shouldOpen);
      be && be.classList.toggle("show", shouldOpen);
      Ne && Ne.root && Ne.root.classList.toggle("shifted", shouldOpen);
      Fe && Fe.classList.toggle("shifted", shouldOpen);
      requestAnimationFrame(updateAllMarquees);
      setTimeout(updateAllMarquees, 320);

      sidebarAnimTimer = setTimeout(() => {
        isSidebarAnimating = false;
        updateAllMarquees();
      }, 440);
    }
    function Ue() {
      ve && ((ve.value = ""), ve.click());
    }

    async function We(e) {
      const t = e.filter(P),
        n = e.length - t.length,
        o = t,
        i = r.length > 0;
      i && te && X(te);

      for (const e of o) {
        const t = URL.createObjectURL(e),
          n = await N(t);
        let o = I(e.name);
        !o &&
          e.type &&
          ((o = e.type.split("/").pop().replace("x-", "")),
          "mpeg" === o && (o = "mp3"),
          "wave" === o && (o = "wav"));

        let coverUrl = null;
        let tags = null;
        try {
          const ab = await e.arrayBuffer();
          tags = parseAudioTags(ab);
          if (tags && tags.picture && tags.picture.data) {
            const blob = new Blob([tags.picture.data], { type: tags.picture.mime || "image/jpeg" });
            coverUrl = URL.createObjectURL(blob);
          }
        } catch (err) {}

        const trackObj = {
          id: s++,
          name: Y(e.name) || "Untitled",
          format: (o || "mp3").toUpperCase(),
          size: e.size,
          duration: n,
          url: t,
          file: e,
          addedAt: Date.now(),
          tags: tags,
          lyrics: (tags && tags.lyrics) ? tags.lyrics : null,
          coverUrl: coverUrl,
          lastPlayed: 0,
        };
        r.push(trackObj);
        analyzeAudioTrack(trackObj);
      }
      ot(i, o.length ? r.slice(-o.length).map((e) => e.id) : []);
      n > 0
        ? It(
            `${n} file${n > 1 ? "s" : ""} skipped — only audio files (.mp3, .ogg, .wav, .flac, .m4a, .aac) accepted.`,
            "danger"
          )
        : o.length > 0 &&
          It(`Added ${o.length} sound${o.length > 1 ? "s" : ""}.`, "success");
    }

    document.body.appendChild(Ne.root);
    n && n.addEventListener("click", () => Oe(!J || !J.classList.contains("open")));
    ee && ee.addEventListener("click", () => Oe(!1));
    ke && ke.addEventListener("click", () => Oe(!1));

    lyricsEditToggle &&
      lyricsEditToggle.addEventListener("click", () => {
        if (isLyricsEditing) {
          const sound = r.find((s) => s.id === lyricsTrackId);
          if (lyricsTextarea) {
            lyricsTextarea.value = sound && sound.lyrics ? sound.lyrics : "";
          }
          setLyricsEditMode(false);
        } else {
          setLyricsEditMode(true);
        }
      });
    lyricsSaveBtn && lyricsSaveBtn.addEventListener("click", saveLyrics);
    lyricsCloseBtn &&
      lyricsCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isLyricsEditing) {
          const sound = r.find((s) => s.id === lyricsTrackId);
          if (lyricsTextarea) {
            lyricsTextarea.value = sound && sound.lyrics ? sound.lyrics : "";
          }
          setLyricsEditMode(false);
        } else {
          closeLyricsModal();
        }
      });
    lyricsModal &&
      lyricsModal.addEventListener("click", (e) => {
        if (
          e.target.closest("#lyricsCloseBtn") ||
          e.target.closest("#lyricsSaveBtn") ||
          e.target.closest("#lyricsEditToggle")
        ) {
          return;
        }
        if (
          e.target.matches("[data-close]") ||
          e.target.closest("[data-close]") ||
          e.target.classList.contains("modal-backdrop")
        ) {
          closeLyricsModal();
        }
      });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Pause" || e.code === "Pause" || e.keyCode === 19) {
        e.preventDefault();
        if (u && !u.paused && l) {
          yt();
        }
        return;
      }
      if ("Escape" === e.key) {
        if (lyricsModal && lyricsModal.classList.contains("open")) {
          closeLyricsModal();
          return;
        }
        if (Ae && Ae.classList.contains("open")) {
          closeTrackInfoModal();
          return;
        }
        if (ye && ye.classList.contains("open")) {
          Bt();
          return;
        }
        if (!isSidebarAnimating) {
          if (J && J.classList.contains("open")) {
            Oe(false);
          } else {
            Oe(true);
          }
        }
        return;
      }
      const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable;
      if (!isInput && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const isTrackLoaded = Boolean(i && document.body.classList.contains("has-player") && r.some((s) => s.id === i));

        if (e.key === "I" || e.key === "i" || e.code === "KeyI") {
          e.preventDefault();
          if (isTrackLoaded && !isTrackInfoBusy) {
            if (Ae && Ae.classList.contains("open")) {
              closeTrackInfoModal();
            } else {
              if (lyricsModal && lyricsModal.classList.contains("open")) {
                closeLyricsModal();
              }
              openTrackInfoModal(i);
            }
          }
          return;
        }
        if (e.key === "L" || e.key === "l" || e.code === "KeyL") {
          e.preventDefault();
          if (isTrackLoaded && !isLyricsBusy) {
            if (lyricsModal && lyricsModal.classList.contains("open")) {
              closeLyricsModal();
            } else {
              if (Ae && Ae.classList.contains("open")) {
                closeTrackInfoModal();
              }
              openLyricsModal(i);
            }
          }
          return;
        }
        if (e.key === "P" || e.key === "p" || e.code === "KeyP") {
          e.preventDefault();
          if (Ne && Ne.prevBtn) {
            Ne.prevBtn.click();
          }
          return;
        }
        if (e.key === "N" || e.key === "n" || e.code === "KeyN") {
          e.preventDefault();
          if (Ne && Ne.nextBtn) {
            Ne.nextBtn.click();
          }
          return;
        }
        if (e.key === "R" || e.key === "r" || e.code === "KeyR") {
          e.preventDefault();
          if (Ne && Ne.repeatBtn) {
            Ne.repeatBtn.click();
          }
          return;
        }
        if (e.key === "S" || e.key === "s" || e.code === "KeyS") {
          e.preventDefault();
          if (Ne && Ne.shuffleBtn) {
            Ne.shuffleBtn.click();
          }
          return;
        }
        if (e.key === "F" || e.key === "f" || e.code === "KeyF") {
          e.preventDefault();
          if (Ne && Ne.stopBtn) {
            Ne.stopBtn.click();
          }
          return;
        }
      }
      if (
        (e.key === " " || e.key === "k" || e.key === "K") &&
        document.body.classList.contains("has-player") &&
        !isInput
      ) {
        e.preventDefault();
        if (i) mt(i);
      }
      if (!isInput && document.body.classList.contains("has-player") && u && u.duration) {
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          retProg();
          if (!isFadingToPause && !isSwitchFading) {
            cancelFade();
            u.volume = 1;
          }
          u.currentTime = u.duration * (parseInt(e.key, 10) / 10);
        }
      }
    });

    pe &&
      (he.addEventListener("input", (e) => {
        pe.classList.contains("is-focused") || he.value
          ? pe.classList.add("has-text")
          : pe.classList.remove("has-text");
        clearTimeout(k);
        k = setTimeout(() => {
          const t = w;
          w = e.target.value;
          t !== w &&
            ((te.style.transition = "opacity 0.3s ease"),
            (te.style.opacity = "0"),
            ue &&
              ((ue.style.transition = "opacity 0.3s ease"),
              (ue.style.opacity = "0")),
            setTimeout(() => {
              ot(!1);
              te.style.opacity = "1";
              ue && (ue.style.opacity = "1");
              setTimeout(() => {
                te.style.transition = "";
                ue && (ue.style.transition = "");
              }, 300);
            }, 300));
        }, 500);
      }),
      he.addEventListener("focus", () => {
        pe.classList.add("is-focused");
      }),
      he.addEventListener("blur", () => {
        pe.classList.remove("is-focused");
        he.value ? pe.classList.add("has-text") : pe.classList.remove("has-text");
      }));

    if (infoSearchWrap && infoSearchInput) {
      infoSearchInput.addEventListener("input", () => {
        const hasText = Boolean(infoSearchInput.value);
        if (hasText) {
          infoSearchWrap.classList.add("has-text");
        } else {
          infoSearchWrap.classList.remove("has-text");
        }
        filterInfoCards(infoSearchInput.value, true);
      });

      infoSearchInput.addEventListener("focus", () => {
        infoSearchWrap.classList.add("is-focused");
      });

      infoSearchInput.addEventListener("blur", () => {
        infoSearchWrap.classList.remove("is-focused");
        if (infoSearchInput.value) {
          infoSearchWrap.classList.add("has-text");
        } else {
          infoSearchWrap.classList.remove("has-text");
        }
      });

      infoSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (infoSearchInput.value) {
            infoSearchInput.value = "";
            infoSearchWrap.classList.remove("has-text");
            filterInfoCards("", true);
          } else if (Ae) {
            closeTrackInfoModal();
          }
        }
      });
    }

    if (infoSearchClear && infoSearchInput) {
      infoSearchClear.addEventListener("click", () => {
        infoSearchInput.value = "";
        infoSearchWrap.classList.remove("has-text");
        infoSearchInput.focus();
        filterInfoCards("", true);
      });
    }

    if (lyricsSearchWrap && lyricsSearchInput) {
      lyricsSearchInput.addEventListener("input", () => {
        const hasText = Boolean(lyricsSearchInput.value);
        if (hasText) {
          lyricsSearchWrap.classList.add("has-text");
        } else {
          lyricsSearchWrap.classList.remove("has-text");
        }
        filterLyrics(lyricsSearchInput.value);
      });

      lyricsSearchInput.addEventListener("focus", () => {
        lyricsSearchWrap.classList.add("is-focused");
      });

      lyricsSearchInput.addEventListener("blur", () => {
        lyricsSearchWrap.classList.remove("is-focused");
        if (lyricsSearchInput.value) {
          lyricsSearchWrap.classList.add("has-text");
        } else {
          lyricsSearchWrap.classList.remove("has-text");
        }
      });

      lyricsSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (lyricsSearchInput.value) {
            lyricsSearchInput.value = "";
            lyricsSearchWrap.classList.remove("has-text");
            filterLyrics("");
          } else {
            closeLyricsModal();
          }
        }
      });
    }

    if (lyricsSearchClear && lyricsSearchInput) {
      lyricsSearchClear.addEventListener("click", () => {
        lyricsSearchInput.value = "";
        lyricsSearchWrap.classList.remove("has-text");
        lyricsSearchInput.focus();
        filterLyrics("");
      });
    }

    if (editSearchWrap && editSearchInput) {
      editSearchInput.addEventListener("input", () => {
        const hasText = Boolean(editSearchInput.value);
        if (hasText) {
          editSearchWrap.classList.add("has-text");
        } else {
          editSearchWrap.classList.remove("has-text");
        }
        filterEditCards(editSearchInput.value, true);
      });

      editSearchInput.addEventListener("focus", () => {
        editSearchWrap.classList.add("is-focused");
      });

      editSearchInput.addEventListener("blur", () => {
        editSearchWrap.classList.remove("is-focused");
        if (editSearchInput.value) {
          editSearchWrap.classList.add("has-text");
        } else {
          editSearchWrap.classList.remove("has-text");
        }
      });

      editSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          if (editSearchInput.value) {
            editSearchInput.value = "";
            editSearchWrap.classList.remove("has-text");
            filterEditCards("", true);
          } else if (ye) {
            Bt();
          }
        }
      });
    }

    if (editSearchClear && editSearchInput) {
      editSearchClear.addEventListener("click", () => {
        editSearchInput.value = "";
        editSearchWrap.classList.remove("has-text");
        editSearchInput.focus();
        filterEditCards("", true);
      });
    }

    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
        if (lyricsModal && lyricsModal.classList.contains("open") && lyricsSearchInput) {
          e.preventDefault();
          lyricsSearchInput.focus();
          lyricsSearchInput.select();
        } else if (Ae && Ae.classList.contains("open") && infoSearchInput) {
          e.preventDefault();
          infoSearchInput.focus();
          infoSearchInput.select();
        } else if (ye && ye.classList.contains("open") && editSearchInput) {
          e.preventDefault();
          editSearchInput.focus();
          editSearchInput.select();
        }
      }
    });

    me && me.addEventListener("click", Ue);
    Z && Z.addEventListener("click", Ue);
    ve &&
      ve.addEventListener("change", (e) => {
        We(Array.from(e.target.files || []));
      });

    let Xe = 0;
    function Ve(e) {
      const t = e.dataTransfer && e.dataTransfer.types;
      if (!t) return !1;
      for (let e = 0; e < t.length; e++) if ("Files" === t[e]) return !0;
      return !1;
    }
    window.addEventListener("dragenter", (e) => {
      Ve(e) && (e.preventDefault(), Xe++, we && we.classList.add("show"));
    });
    window.addEventListener("dragover", (e) => {
      Ve(e) && (e.preventDefault(), (e.dataTransfer.dropEffect = "copy"));
    });
    window.addEventListener("dragleave", () => {
      Xe = Math.max(0, Xe - 1);
      0 === Xe && we && we.classList.remove("show");
    });
    window.addEventListener("drop", (e) => {
      if (!Ve(e)) return;
      e.preventDefault();
      Xe = 0;
      we && we.classList.remove("show");
      const t = Array.from(e.dataTransfer.files || []);
      t.length && We(t);
    });
    window.addEventListener("paste", (e) => {
      const t = e.clipboardData && e.clipboardData.items;
      if (!t) return;
      const n = [];
      for (const e of t)
        if ("file" === e.kind) {
          const t = e.getAsFile();
          t && n.push(t);
        }
      n.length && We(n);
    });

    const Ge = e(".library"),
      Ke = e("#libraryScrollbar"),
      Ze = e("#libraryScrollbarThumb");
    let _e,
      Je = !1;
    function Qe() {
      if (!Ke || !Ze || !te) return;
      const e = te.scrollHeight,
        t = te.clientHeight;
      if (e > t && t > 0) {
        te.classList.add("has-scroll");
        Ke.classList.add("active");
        Ke.style.opacity = "";
        Ke.style.pointerEvents = "";
        const n = Ke.clientHeight,
          o = Math.max(20, (t / e) * n);
        Ze.style.height = `${o}px`;
        const r = te.scrollTop,
          i = e - t,
          s = i > 0 ? (r / i) * (n - o) : 0;
        Ze.style.transform = `translateY(${s}px)`;
      } else {
        te.classList.remove("has-scroll");
        Ke.classList.remove("active");
        Ke.style.opacity = "0";
        Ke.style.pointerEvents = "none";
        Je &&
          ((Je = !1),
          Ze.classList.remove("dragging"),
          Ge && Ge.classList.remove("is-dragging"),
          "grabbing" === document.body.getAttribute("data-cursor") &&
            document.body.removeAttribute("data-cursor"));
      }
      requestAnimationFrame(updateAllMarquees);
    }

    if (
      (te &&
        (te.addEventListener(
          "scroll",
          () => {
            Ze && Ze.classList.add("scrolling");
            clearTimeout(_e);
            _e = setTimeout(() => {
              Ze && Ze.classList.remove("scrolling");
            }, 150);
            requestAnimationFrame(Qe);
          },
          { passive: !0 }
        ),
        new ResizeObserver(() => requestAnimationFrame(Qe)).observe(te),
        new MutationObserver(() => requestAnimationFrame(Qe)).observe(te, {
          childList: !0,
          subtree: !0,
        })),
      Ze)
    ) {
      let e = 0,
        t = 0,
        dragScrollHeight = 0,
        dragClientHeight = 0,
        dragTrackHeight = 0;
      Ze.addEventListener("mousedown", (n) => {
        if (n.button !== 0) return;
        Je = !0;
        e = n.clientY;
        t = te.scrollTop;
        dragScrollHeight = te.scrollHeight;
        dragClientHeight = te.clientHeight;
        dragTrackHeight = Ke.clientHeight;
        Ze.classList.add("dragging");
        Ge && Ge.classList.add("is-dragging");
        document.body.setAttribute("data-cursor", "grabbing");
        n.preventDefault();
      });
      window.addEventListener("mousemove", (n) => {
        if (!Je) return;
        const s = dragScrollHeight - dragClientHeight,
          a =
            dragTrackHeight -
            Math.max(20, (dragClientHeight / dragScrollHeight) * dragTrackHeight),
          l = n.clientY - e,
          c = a > 0 ? (l / a) * s : 0;
        te.scrollTop = t + c;
      });
      window.addEventListener("mouseup", () => {
        Je &&
          ((Je = !1),
          Ze.classList.remove("dragging"),
          Ge && Ge.classList.remove("is-dragging"),
          "grabbing" === document.body.getAttribute("data-cursor") &&
            document.body.removeAttribute("data-cursor"));
      });
    }

    let et,
      tt = !1;
    function nt() {
      if (!(qe && Be && $e && Se)) return;
      const e = $e.scrollHeight,
        t = $e.clientHeight;
      if (e > t && t > 0) {
        Se.classList.add("has-scroll");
        qe.classList.add("active");
        qe.style.opacity = "";
        qe.style.pointerEvents = "";
        const n = qe.clientHeight,
          o = Math.max(20, (t / e) * n);
        Be.style.height = `${o}px`;
        const r = $e.scrollTop,
          i = e - t,
          s = i > 0 ? (r / i) * (n - o) : 0;
        Be.style.transform = `translateY(${s}px)`;
      } else {
        Se.classList.remove("has-scroll");
        qe.classList.remove("active");
        qe.style.opacity = "0";
        qe.style.pointerEvents = "none";
        tt &&
          ((tt = !1),
          Be.classList.remove("dragging"),
          Se && Se.classList.remove("is-dragging"),
          "grabbing" === document.body.getAttribute("data-cursor") &&
            document.body.removeAttribute("data-cursor"));
      }
    }

    if (
      ($e &&
        ($e.addEventListener(
          "scroll",
          () => {
            Be && Be.classList.add("scrolling");
            clearTimeout(et);
            et = setTimeout(() => {
              Be && Be.classList.remove("scrolling");
            }, 150);
            requestAnimationFrame(nt);
          },
          { passive: !0 }
        ),
        new ResizeObserver(() => requestAnimationFrame(nt)).observe($e),
        new MutationObserver(() => requestAnimationFrame(nt)).observe($e, {
          childList: !0,
          subtree: !0,
        })),
      Be)
    ) {
      let e = 0,
        t = 0,
        dragScrollHeightInfo = 0,
        dragClientHeightInfo = 0,
        dragTrackHeightInfo = 0;
      Be.addEventListener("mousedown", (n) => {
        if (n.button !== 0) return;
        tt = !0;
        e = n.clientY;
        t = $e.scrollTop;
        dragScrollHeightInfo = $e.scrollHeight;
        dragClientHeightInfo = $e.clientHeight;
        dragTrackHeightInfo = qe.clientHeight;
        Be.classList.add("dragging");
        Se && Se.classList.add("is-dragging");
        document.body.setAttribute("data-cursor", "grabbing");
        n.preventDefault();
      });
      window.addEventListener("mousemove", (n) => {
        if (tt) {
          const o = n.clientY - e,
            a =
              dragTrackHeightInfo -
              Math.max(
                20,
                (dragClientHeightInfo / dragScrollHeightInfo) * dragTrackHeightInfo
              ),
            l = dragScrollHeightInfo - dragClientHeightInfo,
            c = a > 0 ? o / a : 0;
          $e.scrollTop = t + c * l;
        }
      });
      window.addEventListener("mouseup", () => {
        tt &&
          ((tt = !1),
          Be.classList.remove("dragging"),
          Se && Se.classList.remove("is-dragging"),
          "grabbing" === document.body.getAttribute("data-cursor") &&
            document.body.removeAttribute("data-cursor"));
      });
    }

    let editScrollTimer, editScrollDragging = false;
    function updateEditScrollbar() {
      if (!(editScrollbar && editScrollbarThumb && editContent && editContentWrap)) return;
      const sh = editContent.scrollHeight,
        ch = editContent.clientHeight;
      if (sh > ch && ch > 0) {
        editContentWrap.classList.add("has-scroll");
        editScrollbar.classList.add("active");
        editScrollbar.style.opacity = "";
        editScrollbar.style.pointerEvents = "";
        const trackH = editScrollbar.clientHeight,
          thumbH = Math.max(20, (ch / sh) * trackH);
        editScrollbarThumb.style.height = `${thumbH}px`;
        const st = editContent.scrollTop,
          maxScroll = sh - ch,
          top = maxScroll > 0 ? (st / maxScroll) * (trackH - thumbH) : 0;
        editScrollbarThumb.style.transform = `translateY(${top}px)`;
      } else {
        editContentWrap.classList.remove("has-scroll");
        editScrollbar.classList.remove("active");
        editScrollbar.style.opacity = "0";
        editScrollbar.style.pointerEvents = "none";
        if (editScrollDragging) {
          editScrollDragging = false;
          editScrollbarThumb.classList.remove("dragging");
          editContentWrap.classList.remove("is-dragging");
          if (document.body.getAttribute("data-cursor") === "grabbing") {
            document.body.removeAttribute("data-cursor");
          }
        }
      }
    }

    if (editContent) {
      editContent.addEventListener(
        "scroll",
        () => {
          if (editScrollbarThumb) editScrollbarThumb.classList.add("scrolling");
          clearTimeout(editScrollTimer);
          editScrollTimer = setTimeout(() => {
            if (editScrollbarThumb) editScrollbarThumb.classList.remove("scrolling");
          }, 150);
          requestAnimationFrame(updateEditScrollbar);
        },
        { passive: true }
      );
      new ResizeObserver(() => requestAnimationFrame(updateEditScrollbar)).observe(editContent);
      new MutationObserver(() => requestAnimationFrame(updateEditScrollbar)).observe(editContent, {
        childList: true,
        subtree: true,
      });
    }

    if (editScrollbarThumb) {
      let startY = 0,
        startScrollTop = 0,
        dragScrollH = 0,
        dragClientH = 0,
        dragTrackH = 0;
      editScrollbarThumb.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        editScrollDragging = true;
        startY = e.clientY;
        startScrollTop = editContent.scrollTop;
        dragScrollH = editContent.scrollHeight;
        dragClientH = editContent.clientHeight;
        dragTrackH = editScrollbar.clientHeight;
        editScrollbarThumb.classList.add("dragging");
        if (editContentWrap) editContentWrap.classList.add("is-dragging");
        document.body.setAttribute("data-cursor", "grabbing");
        e.preventDefault();
      });
      window.addEventListener("mousemove", (e) => {
        if (editScrollDragging) {
          const dy = e.clientY - startY,
            availTrack = dragTrackH - Math.max(20, (dragClientH / dragScrollH) * dragTrackH),
            availScroll = dragScrollH - dragClientH,
            ratio = availTrack > 0 ? dy / availTrack : 0;
          editContent.scrollTop = startScrollTop + ratio * availScroll;
        }
      });
      window.addEventListener("mouseup", () => {
        if (editScrollDragging) {
          editScrollDragging = false;
          editScrollbarThumb.classList.remove("dragging");
          if (editContentWrap) editContentWrap.classList.remove("is-dragging");
          if (document.body.getAttribute("data-cursor") === "grabbing") {
            document.body.removeAttribute("data-cursor");
          }
        }
      });
    }

    function ot(e = !0, t = []) {
      if (r.length < 2) return void dt({ newIds: t });
      const n = e && te ? X(te) : null,
        o = e && K ? X(K) : null,
        i = g[v];
      r.sort((e, t) => {
        if (e.pinned && !t.pinned) return -1;
        if (!e.pinned && t.pinned) return 1;
        let n = 0;
        return (
          "name" === i
            ? (n = e.name.localeCompare(t.name))
            : "type" === i
            ? (n =
                e.format === t.format
                  ? e.name.localeCompare(t.name)
                  : e.format.localeCompare(t.format))
            : "size" === i
            ? (n =
                e.size === t.size
                  ? e.name.localeCompare(t.name)
                  : e.size - t.size)
            : "duration" === i
            ? (n =
                e.duration === t.duration
                  ? e.name.localeCompare(t.name)
                  : e.duration - t.duration)
            : "played" === i &&
              (n =
                (t.lastPlayed || 0) !== (e.lastPlayed || 0)
                  ? (t.lastPlayed || 0) - (e.lastPlayed || 0)
                  : e.name.localeCompare(t.name)),
          f ? n : -n
        );
      });
      dt({ newIds: t });
      e && n && te && V(n, te);
      e && o && K && V(o, K);
      setTimeout(() => requestAnimationFrame(Qe), 450);
    }

    oe &&
      oe.addEventListener("click", () => {
        f = !f;
        lt();
        ot();
      });
    se &&
      se.addEventListener("click", () => {
        st();
        v = (v + 1) % g.length;
        lt();
        ot();
      });
    le &&
      le.addEventListener("click", (t) => {
        t.stopPropagation();
        st();
        const n = !ce.classList.contains("show");
        ce.classList.toggle("show", n);
        e("#iconSortDown").classList.toggle("active", !n);
        e("#iconSortUp").classList.toggle("active", n);
      });
    ce &&
      ce.addEventListener("click", (t) => {
        const n = t.target.closest(".sort-item");
        if (!n) return;
        const o = n.dataset.sort,
          r = g.indexOf(o);
        -1 !== r && ((v = r), lt(), ot());
        ce.classList.remove("show");
        e("#iconSortDown").classList.add("active");
        e("#iconSortUp").classList.remove("active");
      });

    document.addEventListener("mousedown", (t) => {
      ce &&
        ce.classList.contains("show") &&
        !t.target.closest("#sortWrap") &&
        !t.target.closest("#sortMenu") &&
        (ce.classList.remove("show"),
        e("#iconSortDown").classList.add("active"),
        e("#iconSortUp").classList.remove("active"));
      Ce &&
        Ce.classList.contains("show") &&
        !t.target.closest("#contextMenu") &&
        st();
    });

    let rt = null,
      it = null,
      ctxAnchorTop = 0,
      ctxScrollContainer = null;
    function st() {
      Ce &&
        (Ce.classList.remove("show"),
        Ce.classList.remove("hidden-by-scroll"),
        Ce.style.setProperty("--ctx-y", "0px"),
        it && (it.classList.remove("context-open"), (it = null)),
        (rt = null),
        (ctxScrollContainer = null));
    }
    let ctxRaf = null;
    function updateContextMenu() {
      if (!Ce || !Ce.classList.contains("show") || !it || !ctxScrollContainer) return;
      if (ctxRaf) cancelAnimationFrame(ctxRaf);
      ctxRaf = requestAnimationFrame(() => {
        const anchorRect = it.getBoundingClientRect();
        const containerRect = ctxScrollContainer.getBoundingClientRect();
        const diffY = anchorRect.top - ctxAnchorTop;
        Ce.style.setProperty("--ctx-y", `${diffY}px`);
        const isVisible =
          anchorRect.top >= containerRect.top && anchorRect.bottom <= containerRect.bottom;
        if (!isVisible) {
          Ce.classList.add("hidden-by-scroll");
        } else {
          Ce.classList.remove("hidden-by-scroll");
        }
      });
    }
    document.addEventListener("scroll", updateContextMenu, !0);
    window.addEventListener("resize", updateContextMenu);

    function at(e, t, n, o) {
      Ce &&
        ((Ce.style.left = `${e}px`),
        (Ce.style.top = `${t}px`),
        Ce.classList.remove("hidden-by-scroll"),
        Ce.style.setProperty("--ctx-y", "0px"),
        requestAnimationFrame(() => {
          const n = Ce.getBoundingClientRect();
          let o = e,
            r = t;
          e + n.width > window.innerWidth && (o = e - n.width);
          t + n.height > window.innerHeight && (r = t - n.height);
          Ce.style.left = `${o}px`;
          Ce.style.top = `${r}px`;
          Ce.classList.add("show");
        }),
        (rt = n),
        it && it.classList.remove("context-open"),
        (it = o),
        o && o.classList.add("context-open"),
        (() => {
          if (!ctxPin) return;
          const target = r.find((x) => x.id === n);
          if (target && target.pinned) {
            ctxPin.classList.add("context-danger");
            ctxPin.querySelector("span").textContent = "Unpin";
          } else {
            ctxPin.classList.remove("context-danger");
            ctxPin.querySelector("span").textContent = "Pin";
          }
        })(),
        (ctxScrollContainer = o ? o.closest(".sound-list, .rail-sounds, .library") : null),
        (ctxAnchorTop = o ? o.getBoundingClientRect().top : 0));
    }

    function lt() {
      const n = g[v];
      if (
        (ce &&
          t(".sort-item", ce).forEach((e) => {
            e.classList.toggle("active", e.dataset.sort === n);
          }),
        ae)
      ) {
        const t = {
          name: e("#iconSortName"),
          type: e("#iconSortType"),
          size: e("#iconSortSize"),
          duration: e("#iconSortDuration"),
          played: e("#iconSortPlayed"),
        };
        for (const [e, o] of Object.entries(t))
          o && o.classList.toggle("active", e === n);
      }
      re &&
        ie &&
        (f
          ? (re.classList.add("active"), ie.classList.remove("active"))
          : (re.classList.remove("active"), ie.classList.add("active")));
    }

    function ct(e, t) {
      const display = t > 999 ? `${Math.floor(t / 1000)}K` : String(t);
      e &&
        e.textContent !== display &&
        ((e.style.transition = "filter 150ms ease, transform 150ms ease"),
        (e.style.filter = "blur(4px)"),
        (e.style.transform = "scale(0.9)"),
        setTimeout(() => {
          e.textContent = display;
          e.style.filter = "blur(0px)";
          e.style.transform = "scale(1)";
        }, 150));
    }

    function dt({ newIds: e = [] } = {}) {
      const n = b();
      Ne.updateShuffleAvailability();
      if (te) {
        const pinnedItems = n.filter((x) => x.pinned);
        const unpinnedItems = n.filter((x) => !x.pinned);
        const o = document.createDocumentFragment();

        if (pinnedItems.length > 0) {
          const headerWrap = document.createElement("li");
          headerWrap.style.margin = "0 0 4px 0";
          headerWrap.style.flexShrink = "0";
          headerWrap.innerHTML = `
            <div class="sort-control pinned-header-btn" style="cursor: pointer;">
              <button class="sort-btn-main pinned-btn" style="flex: 1; justify-content: space-between; padding: 4px 10px; width: 100%;">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <span style="display: flex; align-items: center; color: var(--text-mute);">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <g transform="rotate(45 12 12)">
                        <path d="M12 17v5" />
                        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                      </g>
                    </svg>
                  </span>
                  <span class="pinned-header-sep"></span>
                  <span style="letter-spacing: 0.05em; text-transform: uppercase;">Pinned</span>
                </span>
                <div class="icon-transition-wrap" style="width: 14px; height: 14px; display: grid; place-items: center;">
                  <svg class="transition-icon active pinned-chevron-up" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                  <svg class="transition-icon pinned-chevron-down" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
            </div>
          `;
          const headerBtn = headerWrap.querySelector("button");
          const chevronUp = headerWrap.querySelector(".pinned-chevron-up");
          const chevronDown = headerWrap.querySelector(".pinned-chevron-down");
          const sortControl = headerWrap.querySelector(".sort-control");

          sortControl.addEventListener("mouseover", () => {
            if (document.body.getAttribute("data-cursor") !== "grabbing") {
              document.body.setAttribute("data-cursor", "pointer");
            }
          });
          sortControl.addEventListener("mouseleave", () => {
            if (document.body.getAttribute("data-cursor") === "pointer") {
              document.body.removeAttribute("data-cursor");
            }
          });

          chevronUp.classList.toggle("active", !isPinnedCollapsed);
          chevronDown.classList.toggle("active", isPinnedCollapsed);
          o.appendChild(headerWrap);

          const pinnedContainer = document.createElement("li");
          pinnedContainer.className = "pinned-container";
          pinnedContainer.style.display = "flex";
          pinnedContainer.style.flexDirection = "column";
          pinnedContainer.style.flexShrink = "0";
          pinnedContainer.style.overflow = isPinnedCollapsed ? "hidden" : "visible";

          const cardsWrapper = document.createElement("div");
          cardsWrapper.className = "pinned-cards-wrapper";
          cardsWrapper.style.display = "flex";
          cardsWrapper.style.flexDirection = "column";
          cardsWrapper.style.gap = "10px";
          cardsWrapper.style.padding = "2px 0 2px 0";
          cardsWrapper.style.marginTop = "-2px";

          for (const t of pinnedItems) {
            const el = pt(t);
            if (e.includes(t.id)) {
              el.classList.add("entering");
              el.addEventListener("animationend", () => el.classList.remove("entering"), { once: true });
            }
            cardsWrapper.appendChild(el);
          }
          pinnedContainer.appendChild(cardsWrapper);

          let sep = null;
          if (unpinnedItems.length > 0) {
            sep = document.createElement("div");
            sep.className = "sidebar-separator";
            sep.style.marginTop = "14px";
            sep.style.marginBottom = "4px";
            pinnedContainer.appendChild(sep);
          }

          if (isPinnedCollapsed) {
            pinnedContainer.style.height = "0px";
            pinnedContainer.style.opacity = "0";
            pinnedContainer.style.overflow = "hidden";
          }

          o.appendChild(pinnedContainer);

          let isAnimating = false;
          headerWrap.addEventListener("click", () => {
            if (isAnimating) return;
            isAnimating = true;
            headerBtn.style.pointerEvents = "none";
            sortControl.style.pointerEvents = "none";
            syncCursor();

            isPinnedCollapsed = !isPinnedCollapsed;

            if (isPinnedCollapsed) {
              chevronUp.classList.remove("active");
              chevronDown.classList.add("active");
              pinnedContainer.style.height = pinnedContainer.scrollHeight + "px";
              pinnedContainer.offsetHeight;
              pinnedContainer.style.overflow = "hidden";
              pinnedContainer.style.transition = "height 0.3s var(--ease-out), opacity 0.3s var(--ease-out)";
              pinnedContainer.style.height = "0px";
              pinnedContainer.style.opacity = "0";

              setTimeout(() => {
                pinnedContainer.style.transition = "";
                isAnimating = false;
                headerBtn.style.pointerEvents = "";
                sortControl.style.pointerEvents = "";
                Qe();
                updateAllMarquees();
              }, 300);
            } else {
              chevronUp.classList.add("active");
              chevronDown.classList.remove("active");

              pinnedContainer.style.height = "auto";
              const targetHeight = pinnedContainer.scrollHeight;
              pinnedContainer.style.height = "0px";
              pinnedContainer.style.opacity = "1";
              pinnedContainer.style.overflow = "hidden";
              pinnedContainer.offsetHeight;

              pinnedContainer.style.transition = "height 0.3s var(--ease-out)";
              pinnedContainer.style.height = targetHeight + "px";

              setTimeout(() => {
                pinnedContainer.style.transition = "";
                pinnedContainer.style.height = "auto";
                pinnedContainer.style.overflow = "visible";

                isAnimating = false;
                headerBtn.style.pointerEvents = "";
                sortControl.style.pointerEvents = "";
                syncCursor();
                Qe();
                updateAllMarquees();
              }, 300);
            }
          });
        }

        for (const t of unpinnedItems) {
          const el = pt(t);
          if (e.includes(t.id)) {
            el.classList.add("entering");
            el.addEventListener("animationend", () => el.classList.remove("entering"), { once: true });
          }
          o.appendChild(el);
        }
        te.innerHTML = "";
        te.appendChild(o);
        requestAnimationFrame(() => {
          Qe();
          updateAllMarquees();
        });
      }
      if (K) {
        const pinnedItems = r.filter((x) => x.pinned);
        const unpinnedItems = r.filter((x) => !x.pinned);
        const frag = document.createDocumentFragment();
        if (pinnedItems.length > 0) {
          for (const t of pinnedItems) {
            const el = ut(t);
            if (e.includes(t.id)) {
              el.classList.add("entering");
              el.addEventListener("animationend", () => el.classList.remove("entering"), { once: true });
            }
            frag.appendChild(el);
          }
          if (unpinnedItems.length > 0) {
            const sep = document.createElement("li");
            sep.className = "rail-sound-sep";
            frag.appendChild(sep);
          }
        }
        for (const t of unpinnedItems) {
          const el = ut(t);
          if (e.includes(t.id)) {
            el.classList.add("entering");
            el.addEventListener("animationend", () => el.classList.remove("entering"), { once: true });
          }
          frag.appendChild(el);
        }
        K.innerHTML = "";
        K.appendChild(frag);
      }
      ne && ct(ne, n.length);
      G && ct(G, r.length);
      de && de.classList.toggle("hide", r.length > 0);
      ue && (ue.style.display = r.length > 0 && 0 === n.length ? "flex" : "none");
    }

    function ut(e) {
      const t = document.createElement("li");
      t.className = "rail-sound" + (e.coverUrl ? " has-cover" : "");
      if (e.coverUrl) {
        t.style.setProperty("background-image", `url("${e.coverUrl}")`, "important");
      }
      return (
        (t.dataset.id = String(e.id)),
        e.id === i && t.classList.add("active"),
        e.id === i && l && t.classList.add("is-playing"),
        t.setAttribute("role", "button"),
        t.setAttribute("aria-label", e.name),
        t.setAttribute("tabindex", "0"),
        (t.dataset.tip = e.name),
        (t.dataset.tipPos = "right"),
        (t.innerHTML = `
        <span class="ico-default">${q}</span>
        <span class="ico-hover">${B}</span>
        <span class="ico-active">
          <span class="ico-active-play">${B}</span>
          <span class="ico-active-pause">${F}</span>
        </span>
      `),
        t?.addEventListener("click", () => ht(e.id)),
        t.addEventListener("keydown", (t) => {
          ("Enter" !== t.key && " " !== t.key) || (t.preventDefault(), ht(e.id));
        }),
        t
      );
    }

    function pt(n) {
      const o = document.createElement("li");
      return (
        (o.className = "sound-card"),
        (o.dataset.id = String(n.id)),
        n.id === i && o.classList.add("active"),
        n.id === i && l && o.classList.add("is-playing"),
        (o.innerHTML = `
        <div class="sound-thumb ${n.coverUrl ? "has-cover" : ""}" aria-hidden="true" ${n.coverUrl ? `style="background-image: url('${n.coverUrl}') !important;"` : ""}>
          <span class="ico-default">${q}</span>
          <span class="ico-hover">${B}</span>
          <span class="ico-active">
            <span class="ico-active-play">${B}</span>
            <span class="ico-active-pause">${F}</span>
          </span>
        </div>
        <div class="sound-meta">
          <div class="sound-name-wrap">
            <span class="sound-name"></span>
          </div>
          <div class="sound-sub">
            <span class="pill red"></span>
            <span class="sep"></span>
            <span class="size"></span>
            <span class="sep"></span>
            <span class="duration"></span>
          </div>
        </div>
        <div class="sound-actions">
          <button class="icon-btn info" aria-label="Info">${z}</button>
          <button class="icon-btn edit" aria-label="Edit">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button class="icon-btn pin ${n.pinned ? "active" : ""}" aria-label="${n.pinned ? "Unpin" : "Pin"}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <g transform="rotate(45 12 12)">
                <path d="M12 17v5" />
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
              </g>
            </svg>
          </button>
          <button class="icon-btn danger delete" aria-label="Remove">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      `),
        (o.querySelector(".sound-name").textContent = n.name),
        (o.querySelector(".pill").textContent = n.format),
        (o.querySelector(".size").textContent = H(n.size)),
        (o.querySelector(".duration").textContent = R(n.duration)),
        o.querySelector(".sound-thumb")?.addEventListener("click", (e) => {
          e.stopPropagation();
          st();
          mt(n.id);
        }),
        o?.addEventListener("click", (e) => {
          o.dataset.justDragged ||
            e.target.closest(".sound-thumb") ||
            e.target.closest(".icon-btn") ||
            (function (e) {
              if (e === i) return Tt(!0), void Et();
              xt(e, l);
            })(n.id);
        }),
        o.querySelector(".info")?.addEventListener("click", (e) => {
          e.stopPropagation();
          st();
          jt(n.id);
        }),
        o.querySelector(".edit")?.addEventListener("click", (e) => {
          e.stopPropagation();
          st();
          qt(n.id);
        }),
        o.querySelector(".pin")?.addEventListener("click", (e) => {
          e.stopPropagation();
          st();
          const target = r.find((x) => x.id === n.id);
          if (target) {
            target.pinned = !target.pinned;
            ot(true, [target.id]);
          }
        }),
        o.querySelector(".delete")?.addEventListener("click", (e) => {
          e.stopPropagation();
          st();
          $t(n.id);
        }),
        (function (n) {
          let o = 0,
            i = 0,
            s = !1,
            a = null,
            l = null,
            c = null,
            d = 0,
            listRectCache = null;
          function u() {
            if (!s) return void (c = null);
            const t = e("#soundList");
            if (t && listRectCache) {
              const n = 60;
              let o = 0;
              d < listRectCache.top + n
                ? (o = 0.3 * (d - (listRectCache.top + n)))
                : d > listRectCache.bottom - n && (o = 0.3 * (d - (listRectCache.bottom - n)));
              0 !== o &&
                (t.scrollTop += Math.sign(o) * Math.max(1, Math.min(25, Math.abs(o))));
            }
            c = requestAnimationFrame(u);
          }
          n.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;
            const t = document.querySelector("#soundList");
            if (t) listRectCache = t.getBoundingClientRect();
            let dragMoveScheduled = !1;
            const cardCenters = te
              ? Array.from(te.querySelectorAll(".sound-card:not(.drag-clone)"))
                  .filter((card) => card !== n)
                  .map((card) => {
                    const rect = card.getBoundingClientRect();
                    return { el: card, center: rect.top + rect.height / 2 };
                  })
              : [];
            function updateDropIndicator() {
              let r = null,
                isAbove = !1;
              let closest = Infinity;
              cardCenters.forEach(({ el: card, center }) => {
                const dist = Math.abs(d - center);
                if (dist < closest) {
                  closest = dist;
                  r = card;
                  isAbove = d < center;
                }
              });
              document.querySelectorAll(".drop-above, .drop-below").forEach((el) => {
                if (el !== r) el.classList.remove("drop-above", "drop-below");
              });
              if (r) {
                r.classList.toggle("drop-above", isAbove);
                r.classList.toggle("drop-below", !isAbove);
              }
            }
            function p(e) {
              d = e.clientY;
              if (!s) {
                const t = e.clientX - o,
                  r = e.clientY - i;
                t * t + r * r > 25 &&
                  ((s = !0),
                  n.classList.remove("holding"),
                  n.classList.add("dragging"),
                  (a = n.cloneNode(!0)),
                  a.classList.remove(
                    "dragging",
                    "holding",
                    "active",
                    "is-playing",
                    "entering",
                    "flipping"
                  ),
                  a.classList.add("drag-clone"),
                  (a.style.width = `${n.offsetWidth}px`),
                  (a.style.transform = `translate3d(${e.clientX + 10}px, ${e.clientY + 10}px, 0)`),
                  document.body.appendChild(a),
                  a.getBoundingClientRect(),
                  requestAnimationFrame(() => {
                    a && a.classList.add("show");
                  }),
                  document.body.setAttribute("data-cursor", "grabbing"),
                  (c = requestAnimationFrame(u)));
              }
              if (s) {
                e.preventDefault();
                document.body.setAttribute("data-cursor", "grabbing");
                a.style.transform = `translate3d(${e.clientX + 10}px, ${e.clientY + 10}px, 0)`;
                if (!dragMoveScheduled) {
                  dragMoveScheduled = !0;
                  requestAnimationFrame(() => {
                    dragMoveScheduled = !1;
                    updateDropIndicator();
                  });
                }
              }
            }
            e.target.closest(".icon-btn, .sound-thumb") ||
              (e.preventDefault(),
              n.classList.remove("entering"),
              (o = e.clientX),
              (i = e.clientY),
              (d = e.clientY),
              n.classList.add("holding"),
              (l = Number(n.dataset.id)),
              document.addEventListener("mousemove", p),
              document.addEventListener("mouseup", function e(o) {
                document.removeEventListener("mousemove", p);
                document.removeEventListener("mouseup", e);
                n.classList.remove("holding");
                c && (cancelAnimationFrame(c), (c = null));
                if (s) {
                  s = !1;
                  n.dataset.justDragged = "true";
                  setTimeout(() => delete n.dataset.justDragged, 100);
                  n.classList.remove("dragging");
                  if (a) {
                    const e = a;
                    e.classList.remove("show");
                    setTimeout(() => {
                      e.remove();
                    }, 200);
                  }
                  a = null;
                  let i = null,
                    isAbove = !1;
                  if (te) {
                    const cards = Array.from(te.querySelectorAll(".sound-card:not(.drag-clone)"));
                    let closest = Infinity;
                    cards.forEach((card) => {
                      if (card === n) return;
                      const rect = card.getBoundingClientRect();
                      const center = rect.top + rect.height / 2;
                      const dist = Math.abs(o.clientY - center);
                      if (dist < closest) {
                        closest = dist;
                        i = card;
                        isAbove = o.clientY < center;
                      }
                    });
                  }
                  if (i && i !== n) {
                    const t = isAbove;
                    !(function (e, t, n) {
                      if (!te) return;
                      const o = X(te);
                      let i;
                      K && (i = X(K));
                      const s = r.findIndex((t) => t.id === e);
                      let a = r.findIndex((e) => e.id === t);
                      if (s < 0 || a < 0) return;
                      const [l] = r.splice(s, 1);
                      s < a && (a -= 1);
                      r.splice(n ? a : a + 1, 0, l);
                      dt();
                      V(o, te);
                      i && K && V(i, K);
                      setTimeout(() => requestAnimationFrame(Qe), 450);
                    })(l, Number(i.dataset.id), t);
                  }
                  document
                    .querySelectorAll(".drop-above, .drop-below")
                    .forEach((e) => e.classList.remove("drop-above", "drop-below"));
                  document.body.removeAttribute("data-cursor");
                  o.target.dispatchEvent(new MouseEvent("mouseover", { bubbles: !0 }));
                }
              }));
          });
        })(o),
        o
      );
    }

    function ht(e) {
      e !== i ? xt(e, !0) : l ? yt() : bt();
    }
    function mt(e) {
      if (e !== i) return void xt(e, !0);
      l ? yt() : bt();
    }
    function gt() {
      return (
        u ||
        ((u = new Audio()),
        (u.preload = "auto"),
        u.addEventListener("timeupdate", () => {
          u && !m && u.paused && Ne.update(u.currentTime, u.duration || 0);
        }),
        u.addEventListener("loadedmetadata", () => {
          u && Ne.update(u.currentTime, u.duration || 0);
        }),
        u.addEventListener("ended", Mt),
        u.addEventListener("play", () => {
          l = !0;
          const cur = r.find((x) => x.id === i);
          if (cur) cur.lastPlayed = Date.now();
          h ||
            ((ft = performance.now()),
            (vt = u ? u.currentTime : 0),
            (h = requestAnimationFrame(function e(t) {
              if (u && !u.paused && !m) {
                let e = u.currentTime,
                  n = u.duration || 0;
                if (Math.abs(e - vt) > 0.5) vt = e;
                else {
                  let n = Math.max(0, Math.min(0.1, (t - ft) / 1e3));
                  vt += n;
                  vt += 0.08 * (e - vt);
                }
                Ne.update(vt, n);
              }
              ft = t;
              h = requestAnimationFrame(e);
            })));
          Et();
        }),
        u.addEventListener("pause", () => {
          p || ((l = !1), wt(), Et());
        }),
        u)
      );
    }

    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      ce &&
        ce.classList.contains("show") &&
        (ce.classList.remove("show"),
        document.querySelector("#iconSortDown").classList.add("active"),
        document.querySelector("#iconSortUp").classList.remove("active"));
      const t = e.target.closest(".sound-card, .rail-sound");
      if (t) {
        const n = Number(t.dataset.id);
        Ce && Ce.classList.contains("show")
          ? (st(),
            setTimeout(() => {
              at(e.clientX, e.clientY, n, t);
            }, 180))
          : at(e.clientX, e.clientY, n, t);
      } else st();
    });

    Me &&
      Me.addEventListener("click", () => {
        rt && qt(rt);
        st();
      });
    Ee &&
      Ee.addEventListener("click", () => {
        rt && jt(rt);
        st();
      });
    Te &&
      Te.addEventListener("click", () => {
        rt && $t(rt);
        st();
      });
    ctxPin &&
      ctxPin.addEventListener("click", () => {
        if (null !== rt) {
          const target = r.find((x) => x.id === rt);
          if (target) {
            target.pinned = !target.pinned;
            ot(true, [target.id]);
          }
        }
        st();
      });

    let vt = 0,
      ft = 0;
    function wt() {
      h && (cancelAnimationFrame(h), (h = null));
    }

    let fadeAnimFrame = null;
    let fadeSwitchToken = 0;
    let isFadingToPause = false;
    let isSwitchFading = false;

    function cancelFade() {
      if (fadeAnimFrame) {
        cancelAnimationFrame(fadeAnimFrame);
        fadeAnimFrame = null;
      }
    }

    function analyzeAudioTrack(t) {
      if (!t || t.advMeta || !t.file) return;
      t.advMeta = "loading";
      const n = t.file;
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const arrayBuffer = ev.target.result;
            if (!t.tags) {
              t.tags = parseAudioTags(arrayBuffer);
              if (t.tags && t.tags.picture && t.tags.picture.data && !t.coverUrl) {
                try {
                  t.coverUrl = URL.createObjectURL(
                    new Blob([t.tags.picture.data], {
                      type: t.tags.picture.mime || "image/jpeg",
                    })
                  );
                } catch (err) {}
              }
            }

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtx();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

            const channelData = [];
            for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
              channelData.push(audioBuffer.getChannelData(ch));
            }

            const workerCode = `
              self.onmessage = function(ev) {
                try {
                  const channels = ev.data.channels;
                  const sampleRate = ev.data.sampleRate;
                  const length = ev.data.length;
                  const numberOfChannels = channels.length;
                  
                  let r = 0, i = 0, s = 0, a = 0, l = 0;
                  
                  for (let ch = 0; ch < numberOfChannels; ch++) {
                    const t = channels[ch];
                    s += t.length;
                    let n = 0;
                    for (let e = 0; e < t.length; e++) {
                      const o = t[e],
                        s2 = Math.abs(o);
                      if (s2 > r) r = s2;
                      i += o * o;
                      a += o;
                      let c = o > 0 ? 1 : o < 0 ? -1 : 0;
                      if (0 !== n && 0 !== c && c !== n) l++;
                      if (0 !== c) n = c;
                    }
                  }
                  
                  let c = null;
                  if (2 === numberOfChannels) {
                    const e = channels[0],
                      t = channels[1];
                    let n = 0,
                      r2 = 0,
                      i2 = 0;
                    for (let o = 0; o < e.length; o++) {
                      const s3 = e[o],
                        a2 = t[o];
                      n += s3 * a2;
                      r2 += s3 * s3;
                      i2 += a2 * a2;
                    }
                    const s4 = Math.sqrt(r2 * i2);
                    c = s4 > 0 ? n / s4 : 0;
                  }
                  
                  const d = Math.sqrt(i / s),
                    u = r > 0 ? 20 * Math.log10(r) : -1 / 0,
                    p = d > 0 ? 20 * Math.log10(d) : -1 / 0;
                    
                  self.postMessage({
                    sampleRate: sampleRate,
                    channels: numberOfChannels,
                    samples: length,
                    peak: r,
                    peakDB: u,
                    rms: d,
                    rmsDB: p,
                    dcOffset: a / s,
                    zeroCrossings: l,
                    correlation: c,
                    crestFactor: r > 0 && d > 0 ? u - p : 0,
                  });
                } catch(err) {
                  self.postMessage(null);
                }
              }
            `;

            const blob = new Blob([workerCode], { type: "application/javascript" });
            const workerUrl = URL.createObjectURL(blob);
            const worker = new Worker(workerUrl);
            worker.onmessage = (msg) => {
              resolve(msg.data);
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
            };
            worker.onerror = () => {
              resolve(null);
              worker.terminate();
              URL.revokeObjectURL(workerUrl);
            };

            worker.postMessage({
              channels: channelData,
              sampleRate: audioBuffer.sampleRate,
              length: audioBuffer.length,
            });
          } catch (err) {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsArrayBuffer(n);
      }).then((res) => {
        t.advMeta = res || "error";
        if (Ae && Ae.classList.contains("open") && Ft === t.id) {
          jt(t.id);
        }
      });
    }

    function computeAdaptiveFadeProfile(track, mode = "out", currentTime = 0) {
      if (!track) {
        return {
          duration: mode === "out" ? 220 : 280,
          curveType: "equal-power",
          exponent: 1,
          label: "Adaptive • Standard 250ms (Equal Power)",
        };
      }

      const dur = track.duration || 60;
      let baseDuration = 240;

      // 1. Duration-based scaling (SFX vs Jingle vs Standard Song vs Long Song)
      if (dur < 4) {
        baseDuration = mode === "out" ? 80 : 100;
      } else if (dur < 15) {
        baseDuration = mode === "out" ? 130 : 160;
      } else if (dur < 45) {
        baseDuration = mode === "out" ? 180 : 220;
      } else if (dur < 180) {
        baseDuration = mode === "out" ? 220 : 280;
      } else {
        baseDuration = mode === "out" ? 270 : 340;
      }

      // 2. Genre & acoustic style analysis
      const genre = (track.tags && track.tags.genre ? track.tags.genre : "").toLowerCase();
      const name = (track.name || "").toLowerCase();
      const styleText = `${genre} ${name}`;

      let curveType = "equal-power";
      let genreMultiplier = 1.0;
      let styleName = "Balanced";

      if (
        /ambient|chill|lo-?fi|classical|acoustic|piano|jazz|new age|meditat|soundtrack|folk|ballad|slow|orchestr|choir/.test(
          styleText
        )
      ) {
        genreMultiplier = 1.35;
        curveType = "sine-ease";
        styleName = "Atmospheric S-Curve";
      } else if (
        /metal|punk|rock|hard|heavy|grunge|death|industrial|distortion/.test(
          styleText
        )
      ) {
        genreMultiplier = 0.85;
        curveType = "punchy";
        styleName = "Punchy Fast-Cut";
      } else if (
        /techno|house|edm|dance|trance|electronic|club|synth|beat|disco|trap/.test(
          styleText
        )
      ) {
        genreMultiplier = 1.0;
        curveType = "equal-power";
        styleName = "Beat-Matched Equal Power";
      } else if (/hip-?hop|rap|r&b|soul|pop|urban|vocal/.test(styleText)) {
        genreMultiplier = 0.95;
        curveType = "equal-power";
        styleName = "Smooth Equal Power";
      }

      // 3. Audio Analysis metrics (from advMeta if decoded)
      let dynamicExponent = 1.0;
      let acousticNote = "";

      if (track.advMeta && typeof track.advMeta === "object" && track.advMeta.rms !== undefined) {
        const rmsDB = track.advMeta.rmsDB;
        const crestFactor = track.advMeta.crestFactor;
        const zeroCrossings = track.advMeta.zeroCrossings;

        if (rmsDB > -12) {
          if (mode === "in") {
            dynamicExponent = 1.45;
            genreMultiplier *= 1.15;
          } else {
            dynamicExponent = 1.25;
          }
          acousticNote = "Loud Mastered";
        } else if (rmsDB < -22 && rmsDB !== -1 / 0) {
          if (mode === "in") {
            dynamicExponent = 0.75;
          }
          acousticNote = "Dynamic Delicate";
        }

        if (crestFactor > 15) {
          curveType = "sine-ease";
        }

        if (zeroCrossings > 1200000) {
          if (mode === "out") genreMultiplier = Math.max(genreMultiplier, 1.1);
        }
      }

      // 4. Playhead context (for fade-out)
      if (mode === "out" && track.duration && currentTime) {
        const remaining = track.duration - currentTime;
        if (remaining > 0 && remaining < 0.6) {
          baseDuration = Math.min(baseDuration, 120);
        }
      }

      const finalDuration = Math.round(
        Math.max(70, Math.min(500, baseDuration * genreMultiplier))
      );

      return {
        duration: finalDuration,
        curveType,
        exponent: dynamicExponent,
        label: `Adaptive • ${finalDuration}ms (${styleName}${acousticNote ? `, ${acousticNote}` : ""})`,
      };
    }

    function fadeVolumeTo(
      targetVolume,
      duration,
      onComplete,
      curveType = "equal-power",
      exponent = 1.0
    ) {
      cancelFade();
      if (!u) {
        if (onComplete) onComplete();
        return;
      }
      const startVolume = u.volume;
      if (Math.abs(startVolume - targetVolume) < 0.01 || duration <= 0) {
        u.volume = Math.max(0, Math.min(1, targetVolume));
        if (onComplete) onComplete();
        return;
      }
      const startTime = performance.now();
      const isFadeOut = targetVolume < startVolume;

      function step(now) {
        const elapsed = now - startTime;
        let progress = Math.min(1, Math.max(0, elapsed / duration));

        if (exponent !== 1.0 && exponent > 0) {
          progress = Math.pow(progress, exponent);
        }

        let currentVol;
        if (isFadeOut) {
          if (curveType === "sine-ease") {
            currentVol = startVolume * 0.5 * (1 + Math.cos(progress * Math.PI));
          } else if (curveType === "punchy") {
            currentVol =
              startVolume * Math.cos(Math.pow(progress, 1.35) * (Math.PI / 2));
          } else {
            currentVol = startVolume * Math.cos(progress * (Math.PI / 2));
          }
        } else {
          if (curveType === "sine-ease") {
            currentVol =
              startVolume +
              (targetVolume - startVolume) * 0.5 * (1 - Math.cos(progress * Math.PI));
          } else if (curveType === "punchy") {
            currentVol =
              startVolume +
              (targetVolume - startVolume) *
                Math.sin(Math.pow(progress, 0.75) * (Math.PI / 2));
          } else {
            currentVol =
              startVolume +
              (targetVolume - startVolume) * Math.sin(progress * (Math.PI / 2));
          }
        }

        if (u) {
          u.volume = Math.max(0, Math.min(1, currentVol));
        }

        if (progress < 1) {
          fadeAnimFrame = requestAnimationFrame(step);
        } else {
          fadeAnimFrame = null;
          if (u) u.volume = Math.max(0, Math.min(1, targetVolume));
          if (onComplete) onComplete();
        }
      }
      fadeAnimFrame = requestAnimationFrame(step);
    }

    function kt() {
      const e = r.find((e) => e.id === i);
      if (!e) return;
      const t = gt();
      t.src !== e.url &&
        ((p = !0),
        (t.src = e.url),
        (t.currentTime = 0),
        setTimeout(() => {
          p = !1;
        }, 80));
    }

    function bt(targetId, skipFadeIn = false, customProfile = null) {
      const trackId = targetId !== undefined ? targetId : i;
      const e = r.find((e) => e.id === trackId);
      if (!e) return;
      e.lastPlayed = Date.now();
      const t = gt();
      if (t.src !== e.url) {
        p = !0;
        t.src = e.url;
        t.currentTime = 0;
        setTimeout(() => {
          p = !1;
        }, 80);
      }
      isFadingToPause = false;
      if (!skipFadeIn) {
        cancelFade();
        t.volume = 0;
        const n = t.play();
        if (n && n.catch) n.catch(() => {});
        const inProfile = customProfile || computeAdaptiveFadeProfile(e, "in", t.currentTime);
        fadeVolumeTo(
          1,
          inProfile.duration,
          null,
          inProfile.curveType,
          inProfile.exponent
        );
      } else {
        cancelFade();
        t.volume = 1;
        const n = t.play();
        if (n && n.catch) n.catch(() => {});
      }
    }

    function yt(immediate = false) {
      if (!u) return;
      if (immediate || u.paused) {
        cancelFade();
        isFadingToPause = false;
        u.pause();
        u.volume = 1;
        return;
      }
      isFadingToPause = true;
      const currentTrack = r.find((x) => x.id === i);
      const outProfile = computeAdaptiveFadeProfile(currentTrack, "out", u.currentTime);
      const pauseDuration = Math.min(180, Math.max(90, Math.round(outProfile.duration * 0.75)));
      fadeVolumeTo(
        0,
        pauseDuration,
        () => {
          isFadingToPause = false;
          if (u) {
            u.pause();
            u.volume = 1;
          }
        },
        outProfile.curveType,
        outProfile.exponent
      );
    }

    function Lt() {
      const e = b();
      if (!e.length) return;
      const t = e.findIndex((e) => e.id === i);
      if (t < 0) return (i = e[0].id), kt(), void Ct();
      let n;
      if (c)
        if (1 === e.length) n = 0;
        else
          do {
            n = Math.floor(Math.random() * e.length);
          } while (n === t);
      else n = (t + 1) % e.length;
      if (n === t) {
        if (u && !u.paused) {
          const currentTrack = r.find((x) => x.id === i);
          const outProfile = computeAdaptiveFadeProfile(currentTrack, "out", u.currentTime);
          const inProfile = computeAdaptiveFadeProfile(currentTrack, "in", 0);
          fadeVolumeTo(
            0,
            Math.min(150, Math.round(outProfile.duration * 0.7)),
            () => {
              retProg();
              u.currentTime = 0;
              bt(i, false, inProfile);
            },
            outProfile.curveType,
            outProfile.exponent
          );
        } else if (u) {
          retProg();
          u.currentTime = 0;
          bt(i, false);
        }
      } else {
        xt(e[n].id, !0);
      }
    }

    function xt(e, t) {
      const targetId = e;
      const targetTrack = r.find((x) => x.id === targetId);
      if (!targetTrack) return;

      const currentTrack = r.find((x) => x.id === i);
      const thisToken = ++fadeSwitchToken;
      isFadingToPause = false;

      if (t && u && !u.paused && l) {
        isSwitchFading = true;

        const outProfile = computeAdaptiveFadeProfile(currentTrack, "out", u.currentTime);
        const inProfile = computeAdaptiveFadeProfile(targetTrack, "in", 0);

        i = targetId;
        Tt(!0);
        Et();

        fadeVolumeTo(
          0,
          outProfile.duration,
          () => {
            if (thisToken !== fadeSwitchToken) return;
            isSwitchFading = false;
            kt();
            bt(targetId, false, inProfile);
          },
          outProfile.curveType,
          outProfile.exponent
        );
      } else {
        cancelFade();
        isSwitchFading = false;
        i = targetId;
        kt();
        if (t) {
          Ct();
        } else {
          l = !1;
          if (u) {
            u.pause();
            u.volume = 1;
          }
          Tt(!0);
          Et();
        }
      }
    }

    function Ct() {
      Tt(!0);
      Et();
      bt();
    }

    function Mt() {
      if (2 === d && u) {
        retProg();
        u.currentTime = 0;
        const currentTrack = r.find((x) => x.id === i);
        const inProfile = computeAdaptiveFadeProfile(currentTrack, "in", 0);
        bt(i, false, inProfile);
        return;
      }
      1 === d || c ? Lt() : yt(true);
    }
    function Et() {
      const e = r.find((e) => e.id === i);
      te &&
        t(".sound-card", te).forEach((e) => {
          const t = e.dataset.id === String(i);
          e.classList.toggle("active", t);
          e.classList.toggle("is-playing", t && l);
        });
      K &&
        t(".rail-sound", K).forEach((e) => {
          const t = e.dataset.id === String(i);
          e.classList.toggle("active", t);
          e.classList.toggle("is-playing", t && l);
        });
      Ne.setPlayState(l);
      At(e);
    }
    function Tt(e) {
      document.body.classList.toggle("has-player", e);
      Ne.root.classList.toggle("show", e);
      Fe &&
        (Fe.classList.toggle("show", e),
        Fe.setAttribute("aria-hidden", e ? "false" : "true"));
      e || wt();
    }
    function At(e) {
      if (je) {
        if (!e)
          return (
            De && (De.textContent = ""),
            He && (He.textContent = ""),
            Re && (Re.textContent = ""),
            Ie && (Ie.textContent = ""),
            topbarCover && (topbarCover.style.backgroundImage = "", topbarCover.style.display = "none"),
            topbarCoverSep && (topbarCoverSep.style.display = "none"),
            ze && ze.classList.remove("long"),
            void (Ye = null)
          );
        if (Ye !== e.id)
          return Fe && Fe.classList.contains("show")
            ? (clearTimeout(Pe),
              je.classList.add("fading"),
              retProg(),
              toggleTimeEndFading(!0),
              void (Pe = setTimeout(() => {
                St(e);
                Ye = e.id;
                requestAnimationFrame(() => {
                  je.classList.remove("fading");
                  toggleTimeEndFading(!1);
                  if (u && Ne) Ne.update(u.currentTime, u.duration || 0);
                });
              }, 200)))
            : (St(e), void (Ye = e.id));
        St(e);
      }
    }
    function St(e) {
      De && (De.textContent = e.name);
      He && (He.textContent = e.format);
      Re && (Re.textContent = H(e.size));
      Ie && (Ie.textContent = R(e.duration));
      if (topbarCover && topbarCoverSep) {
        if (e && e.coverUrl) {
          topbarCover.style.setProperty("background-image", `url("${e.coverUrl}")`);
          topbarCover.style.display = "block";
          topbarCoverSep.style.display = "block";
        } else {
          topbarCover.style.backgroundImage = "";
          topbarCover.style.display = "none";
          topbarCoverSep.style.display = "none";
        }
      }
      requestAnimationFrame(() => {
        W(ze, De);
      });
    }

    function $t(e) {
      if (!te) return;
      const n = X(te),
        o = K ? X(K) : null,
        s = te.querySelector(`.sound-card[data-id="${e}"]`);
      if (s) {
        const rect = s.getBoundingClientRect();
        s.style.position = "fixed";
        s.style.top = `${rect.top}px`;
        s.style.left = `${rect.left}px`;
        s.style.width = `${rect.width}px`;
        s.style.height = `${rect.height}px`;
        s.style.zIndex = "999";
        s.style.margin = "0";
        s.classList.add("removing");
        document.body.appendChild(s);
      }
      let a = null;
      if (K) {
        a = K.querySelector(`.rail-sound[data-id="${e}"]`);
        if (a) {
          const rect = a.getBoundingClientRect();
          a.style.position = "fixed";
          a.style.top = `${rect.top}px`;
          a.style.left = `${rect.left}px`;
          a.style.width = `${rect.width}px`;
          a.style.height = `${rect.height}px`;
          a.style.zIndex = "999";
          a.style.margin = "0";
          a.classList.add("removing");
          document.body.appendChild(a);
        }
      }
      const c = r.findIndex((t) => t.id === e);
      if (c < 0) return;
      const [d] = r.splice(c, 1);
      try {
        URL.revokeObjectURL(d.url);
      } catch (err) {}
      if (d.coverUrl) {
        try {
          URL.revokeObjectURL(d.coverUrl);
        } catch (err) {}
      }
      if (i === e) {
        i = null;
        cancelFade();
        if (u) {
          u.pause();
          u.volume = 1;
          u.removeAttribute("src");
          u.load();
        }
        l = !1;
        wt();
        Tt(!1);
      }
      dt();
      V(n, te);
      if (o && K) V(o, K, { duration: 380 });
      It(`Removed — ${d.name}`, "danger");
      requestAnimationFrame(Qe);
      setTimeout(() => {
        if (s && s.parentNode) s.parentNode.removeChild(s);
        if (a && a.parentNode) a.parentNode.removeChild(a);
        requestAnimationFrame(Qe);
      }, 310);
    }

    const EDIT_FIELDS = [
      { key: "name", label: "Name", icon: iconName, isTextarea: false, isFull: false },
      { key: "artist", label: "Artist", icon: iconArtist, isTextarea: false, isFull: false },
      { key: "album", label: "Album", icon: iconAlbum, isTextarea: false, isFull: false },
      { key: "genre", label: "Genre", icon: iconGenre, isTextarea: false, isFull: false },
      { key: "year", label: "Year", icon: iconYear, isTextarea: false, isFull: false },
      { key: "track", label: "Track", icon: iconTrack, isTextarea: false, isFull: false },
      { key: "discnumber", label: "Discnumber", icon: iconDiscnumber, isTextarea: false, isFull: false },
      { key: "composer", label: "Composer", icon: iconComposer, isTextarea: false, isFull: false },
      { key: "comment", label: "Comment", icon: iconComment, isTextarea: false, isFull: true },
      { key: "lyrics", label: "Lyrics", icon: iconLyrics, isTextarea: true, isFull: true },
    ];

    let currentEditTrackId = null;

    function filterEditCards(query, animate = true) {
      if (!editContent) return;
      const rows = Array.from(editContent.querySelectorAll(".edit-row"));
      const emptyEl = editContent.querySelector("#editSearchEmpty");
      if (!rows.length) return;

      const q = (query || "").trim().toLowerCase();

      const firstRects = new Map();
      if (animate) {
        for (const row of rows) {
          if (!row.classList.contains("is-hidden")) {
            firstRects.set(row, row.getBoundingClientRect());
          }
        }
      }

      let matchCount = 0;
      for (const row of rows) {
        const rawLabel = row.dataset.rawLabel || "";
        const input = row.querySelector(".edit-input");
        const val = input ? input.value : "";
        const labelSpan = row.querySelector(".edit-label-text");

        if (!q) {
          matchCount++;
          row.classList.remove("is-hidden");
          if (labelSpan) labelSpan.textContent = rawLabel;
        } else {
          const isMatch = rawLabel.toLowerCase().includes(q) || val.toLowerCase().includes(q);
          if (isMatch) {
            matchCount++;
            row.classList.remove("is-hidden");
            if (labelSpan) {
              labelSpan.innerHTML = highlightInfoMatches(rawLabel, q);
            }
          } else {
            row.classList.add("is-hidden");
            if (labelSpan) labelSpan.textContent = rawLabel;
          }
        }
      }

      if (emptyEl) {
        emptyEl.style.display = matchCount === 0 && q ? "flex" : "none";
      }

      if (animate) {
        const visibleRows = rows.filter((r) => !r.classList.contains("is-hidden"));
        for (const row of visibleRows) {
          const lastRect = row.getBoundingClientRect();
          const firstRect = firstRects.get(row);
          if (firstRect) {
            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;
            if (dx !== 0 || dy !== 0) {
              row.style.transform = `translate(${dx}px, ${dy}px)`;
              row.style.transition = "none";
            }
          } else {
            row.style.opacity = "0";
            row.style.transform = "scale(0.96)";
            row.style.transition = "none";
          }
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            for (const row of visibleRows) {
              row.style.transition =
                "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
              row.style.transform = "";
              row.style.opacity = "1";
            }
          });
        });
      }

      requestAnimationFrame(updateEditScrollbar);
    }

    function qt(e) {
      if (!ye || !editContent) return;
      const t = r.find((t) => t.id === e);
      if (!t) return;
      currentEditTrackId = e;
      a = e;

      if (editSearchInput) editSearchInput.value = "";
      if (editSearchWrap) editSearchWrap.classList.remove("has-text", "is-focused");

      const cleanVal = (v) => (!v || v === "N/A" ? "" : v);
      const tagData = t.tags || {};
      const fieldValues = {
        name: t.name || "",
        artist: cleanVal(tagData.artist),
        album: cleanVal(tagData.album),
        genre: cleanVal(tagData.genre),
        year: cleanVal(tagData.year),
        track: cleanVal(tagData.track),
        discnumber: cleanVal(tagData.discnumber),
        composer: cleanVal(tagData.composer),
        comment: cleanVal(tagData.comment),
        lyrics: cleanVal(t.lyrics),
      };

      editContent.innerHTML = EDIT_FIELDS.map((f) => {
        const val = fieldValues[f.key] || "";
        return `
          <div class="edit-row${f.isFull ? " edit-row-full" : ""}" data-field="${f.key}" data-raw-label="${O(f.label)}">
            <div class="edit-label">
              ${f.icon}
              <span class="edit-sep"></span>
              <span class="edit-label-text">${O(f.label)}</span>
            </div>
            <div class="edit-field-wrap">
              ${f.isTextarea
                ? `<textarea class="edit-textarea edit-input" id="editField_${f.key}" data-field="${f.key}" placeholder="Enter ${f.label.toLowerCase()}..." spellcheck="false" rows="4">${O(val)}</textarea>`
                : `<input type="text" class="edit-input" id="editField_${f.key}" data-field="${f.key}" value="${O(val)}" placeholder="Enter ${f.label.toLowerCase()}..." autocomplete="off" spellcheck="false" />`
              }
            </div>
          </div>
        `;
      }).join("") + `
        <div class="edit-search-empty" id="editSearchEmpty">
          <div class="search-empty-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div class="search-empty-title">No matching fields</div>
          <div class="search-empty-sub">Try searching for another term</div>
        </div>
      `;

      editContent.querySelectorAll(".edit-input").forEach((inp) => {
        inp.addEventListener("input", () => {
          if (editSearchInput && editSearchInput.value.trim()) {
            filterEditCards(editSearchInput.value, false);
          }
        });
        inp.addEventListener("keydown", (evt) => {
          if (evt.key === "Enter" && !inp.classList.contains("edit-textarea")) {
            evt.preventDefault();
            zt();
          }
        });
      });

      ye.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        ye.classList.add("open");
        updateEditScrollbar();
        const firstInput = editContent.querySelector("#editField_name");
        if (firstInput) {
          setTimeout(() => firstInput.focus(), 80);
        }
      });
    }

    function Bt() {
      if (ye && ye.classList.contains("open")) {
        ye.classList.remove("open");
        ye.setAttribute("aria-hidden", "true");
        currentEditTrackId = null;
        a = null;
        if (editSearchInput) editSearchInput.value = "";
        if (editSearchWrap) editSearchWrap.classList.remove("has-text", "is-focused");
      }
    }

    let Ft = null;
    function filterInfoCards(query, animate = true) {
      if (!$e) return;
      const rows = Array.from($e.querySelectorAll(".info-row"));
      const emptyEl = $e.querySelector("#infoSearchEmpty");
      if (!rows.length) return;

      const q = (query || "").trim().toLowerCase();

      const firstRects = new Map();
      if (animate) {
        for (const row of rows) {
          if (!row.classList.contains("is-hidden")) {
            firstRects.set(row, row.getBoundingClientRect());
          }
        }
      }

      let matchCount = 0;
      for (const row of rows) {
        const rawLabel = row.dataset.rawLabel || "";
        const rawVal = row.dataset.rawVal || "";
        const rawHelp = row.dataset.rawHelp || "";
        const labelSpan = row.querySelector(".info-label-text");
        const valSpan = row.querySelector(".info-val");
        const tipSpan = row.querySelector(".info-tooltip");

        if (!q) {
          matchCount++;
          row.classList.remove("is-hidden");
          if (labelSpan) labelSpan.textContent = rawLabel;
          if (valSpan) valSpan.textContent = rawVal;
          if (tipSpan) tipSpan.textContent = rawHelp;
        } else {
          const isMatch =
            rawLabel.toLowerCase().includes(q) ||
            rawVal.toLowerCase().includes(q) ||
            rawHelp.toLowerCase().includes(q);

          if (isMatch) {
            matchCount++;
            row.classList.remove("is-hidden");
            if (labelSpan) labelSpan.innerHTML = highlightInfoMatches(rawLabel, q);
            if (valSpan) valSpan.innerHTML = highlightInfoMatches(rawVal, q);
            if (tipSpan) tipSpan.innerHTML = highlightInfoMatches(rawHelp, q);
          } else {
            row.classList.add("is-hidden");
            if (labelSpan) labelSpan.textContent = rawLabel;
            if (valSpan) valSpan.textContent = rawVal;
            if (tipSpan) tipSpan.textContent = rawHelp;
          }
        }
      }

      if (emptyEl) {
        emptyEl.style.display = matchCount === 0 && q ? "flex" : "none";
      }

      if (animate) {
        const visibleRows = rows.filter((r) => !r.classList.contains("is-hidden"));
        for (const row of visibleRows) {
          const lastRect = row.getBoundingClientRect();
          const firstRect = firstRects.get(row);
          if (firstRect) {
            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;
            if (dx !== 0 || dy !== 0) {
              row.style.transform = `translate(${dx}px, ${dy}px)`;
              row.style.transition = "none";
            }
          } else {
            row.style.opacity = "0";
            row.style.transform = "scale(0.94)";
            row.style.transition = "none";
          }
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            for (const row of visibleRows) {
              row.style.transition =
                "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
              row.style.transform = "";
              row.style.opacity = "1";
            }
          });
        });
      }

      const wraps = Array.from($e.querySelectorAll(".info-val-wrap"));
      const vals = Array.from($e.querySelectorAll(".info-val"));
      U(wraps.map((w, idx) => ({ wrapEl: w, innerEl: vals[idx] })));
      requestAnimationFrame(nt);
    }

    function jt(e) {
      if (!Ae || !$e) return;
      const t = r.find((t) => t.id === e);
      if (!t) return;
      if (Ft !== e) {
        if (infoSearchInput) infoSearchInput.value = "";
        if (infoSearchWrap) infoSearchWrap.classList.remove("has-text", "is-focused");
      }
      Ft = e;

      if (!t.advMeta && t.file) {
        analyzeAudioTrack(t);
      }

      const o = t.addedAt
          ? new Date(t.addedAt).toLocaleDateString() +
            " " +
            new Date(t.addedAt).toLocaleTimeString()
          : "Unknown",
        i =
          t.file && t.file.lastModified
            ? new Date(t.file.lastModified).toLocaleDateString() +
              " " +
              new Date(t.file.lastModified).toLocaleTimeString()
            : "Unknown",
        s =
          t.file && t.file.type
            ? t.file.type
            : "audio/" + t.format.toLowerCase(),
        a = new Intl.NumberFormat().format(t.size) + " bytes",
        l = t.duration
          ? Math.round((8 * t.size) / t.duration / 1e3) + " kbps"
          : "Unknown";

      const tagData = t.tags || {
        artist: "N/A",
        album: "N/A",
        comment: "N/A",
        composer: "N/A",
        discnumber: "N/A",
        genre: "N/A",
        track: "N/A",
        year: "N/A",
      };

      const c = [
        {
          label: "Name",
          icon: iconName,
          val: t.name,
          help: "The base filename of the audio track.",
        },
        {
          label: "Format",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M14 2v4a2 2 0 0 0 2 2h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="3" cy="17" r="1.5" fill="currentColor"/>\n        <path d="M4 17v-3a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <circle cx="11" cy="17" r="1.5" fill="currentColor"/>\n      </svg>',
          val: t.format,
          help: "The container format or file extension.",
        },
        {
          label: "MIME Type",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
          val: s,
          help: "The standard MIME type of the audio file.",
        },
        {
          label: "Size",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <line x1="22" y1="12" x2="2" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>\n        <line x1="6" y1="16" x2="6.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n        <line x1="10" y1="16" x2="10.01" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line>\n      </svg>',
          val: `${H(t.size)} (${a})`,
          help: "The total storage size of the file.",
        },
        {
          label: "Duration",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/>\n        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
          val: `${R(t.duration)} (${t.duration.toFixed(3)}s)`,
          help: "The total playback length of the audio.",
        },
        {
          label: "Bitrate",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>\n      </svg>',
          val: l,
          help: "The amount of data processed per second.",
        },
        {
          label: "Added",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
          val: o,
          help: "When this file was imported into the application.",
        },
        {
          label: "Downloaded",
          icon: '\n      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>\n      </svg>',
          val: i,
          help: "When the file was last modified or created.",
        },
        // 8 requested tags with matched icons
        {
          label: "Artist",
          icon: iconArtist,
          val: tagData.artist || "N/A",
          help: "The recording artist or band responsible for the track.",
        },
        {
          label: "Album",
          icon: iconAlbum,
          val: tagData.album || "N/A",
          help: "The album or release collection this track belongs to.",
        },
        {
          label: "Comment",
          icon: iconComment,
          val: tagData.comment || "N/A",
          help: "User or author comments embedded in the metadata.",
        },
        {
          label: "Composer",
          icon: iconComposer,
          val: tagData.composer || "N/A",
          help: "The person who composed or wrote the musical piece.",
        },
        {
          label: "Discnumber",
          icon: iconDiscnumber,
          val: tagData.discnumber || "N/A",
          help: "The disc number in a multi-disc set.",
        },
        {
          label: "Genre",
          icon: iconGenre,
          val: tagData.genre || "N/A",
          help: "The musical genre or style classification of the track.",
        },
        {
          label: "Track",
          icon: iconTrack,
          val: tagData.track || "N/A",
          help: "The track number within the album.",
        },
        {
          label: "Year",
          icon: iconYear,
          val: tagData.year || "N/A",
          help: "The year the recording was released or created.",
        },
        {
          label: "Lyrics",
          icon: iconLyrics,
          val: (t.lyrics && t.lyrics.trim()) ? t.lyrics.trim().replace(/\r?\n+/g, " ") : "N/A",
          copyVal: (t.lyrics && t.lyrics.trim()) ? t.lyrics.trim() : "N/A",
          help: "Embedded lyrics or text transcription for this audio track.",
          hasEdit: true,
        },
        {
          label: "Transition Profile",
          icon: iconTransition,
          val: computeAdaptiveFadeProfile(t, "in", 0).label,
          help: "Automatic fade curve and transition duration calculated directly from track duration, genre, and acoustic loudness.",
        },
      ];

      if ("loading" === t.advMeta)
        c.push(
          {
            label: "Sample Rate",
            icon: L,
            val: "Analyzing...",
            help: "The number of audio samples carried per second.",
          },
          {
            label: "Channels",
            icon: S,
            val: "Analyzing...",
            help: "The number of independent audio channels (e.g., Mono, Stereo).",
          },
          {
            label: "Total Samples",
            icon: y,
            val: "Analyzing...",
            help: "The total number of individual audio samples in the file.",
          },
          {
            label: "Peak Level",
            icon: x,
            val: "Analyzing...",
            help: "The highest amplitude level reached in the audio signal.",
          },
          {
            label: "RMS Loudness",
            icon: C,
            val: "Analyzing...",
            help: "The root mean square, indicating the average perceived loudness.",
          },
          {
            label: "Crest Factor",
            icon: A,
            val: "Analyzing...",
            help: "The ratio of peak to RMS loudness, indicating dynamic range.",
          },
          {
            label: "DC Offset",
            icon: E,
            val: "Analyzing...",
            help: "The mean amplitude displacement from zero.",
          },
          {
            label: "Zero Crossings",
            icon: M,
            val: "Analyzing...",
            help: "The number of times the waveform crosses the zero amplitude axis.",
          },
          {
            label: "Stereo Phase",
            icon: T,
            val: "Analyzing...",
            help: "Correlation between left and right channels.",
          }
        );
      else if (t.advMeta && "error" !== t.advMeta) {
        const e = new Intl.NumberFormat().format(t.advMeta.sampleRate) + " Hz",
          n =
            1 === t.advMeta.channels
              ? "1 (Mono)"
              : 2 === t.advMeta.channels
              ? "2 (Stereo)"
              : `${t.advMeta.channels} Channels`,
          o = new Intl.NumberFormat().format(t.advMeta.samples),
          r =
            t.advMeta.peakDB === -1 / 0
              ? "-∞ dB"
              : `${t.advMeta.peakDB.toFixed(2)} dB`,
          i =
            t.advMeta.rmsDB === -1 / 0
              ? "-∞ dB"
              : `${t.advMeta.rmsDB.toFixed(2)} dB`,
          s = `${t.advMeta.crestFactor.toFixed(2)} dB`,
          a = (100 * t.advMeta.dcOffset).toFixed(4) + "%",
          l = new Intl.NumberFormat().format(t.advMeta.zeroCrossings),
          d =
            null !== t.advMeta.correlation
              ? t.advMeta.correlation.toFixed(3)
              : "N/A (Mono)";
        c.push(
          {
            label: "Sample Rate",
            icon: L,
            val: e,
            help: "The number of audio samples carried per second.",
          },
          {
            label: "Channels",
            icon: S,
            val: n,
            help: "The number of independent audio channels (e.g., Mono, Stereo).",
          },
          {
            label: "Total Samples",
            icon: y,
            val: o,
            help: "The total number of individual audio samples in the file.",
          },
          {
            label: "Peak Level",
            icon: x,
            val: r,
            help: "The highest amplitude level reached in the audio signal.",
          },
          {
            label: "RMS Loudness",
            icon: C,
            val: i,
            help: "The root mean square, indicating the average perceived loudness.",
          },
          {
            label: "Crest Factor",
            icon: A,
            val: s,
            help: "The ratio of peak to RMS loudness, indicating dynamic range.",
          },
          {
            label: "DC Offset",
            icon: E,
            val: a,
            help: "The mean amplitude displacement from zero.",
          },
          {
            label: "Zero Crossings",
            icon: M,
            val: l,
            help: "The number of times the waveform crosses the zero amplitude axis.",
          },
          {
            label: "Stereo Phase",
            icon: T,
            val: d,
            help: "Correlation between left and right channels (1 = in phase, -1 = out of phase).",
          }
        );
      } else if ("error" === t.advMeta) {
        c.push({
          label: "Analysis",
          icon: x,
          val: "Failed to decode audio data",
          help: "The advanced audio analysis failed to read the file.",
        });
      }

      $e.innerHTML =
        c
          .map(
            (e) => `
        <div class="info-row${e.hasEdit ? " has-edit" : ""}" data-raw-label="${O(e.label)}" data-raw-val="${O(e.val)}" data-raw-help="${O(e.help || "")}">
          <span class="info-label">${e.icon} <span class="info-sep"></span> <span class="info-label-text">${O(e.label)}</span></span>
          <div class="info-val-wrap">
            <span class="info-val">${O(e.val)}</span>
          </div>
          <button class="info-help-btn" aria-label="What is ${e.label}?">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
              <path d="M12 16v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="7.5" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          <div class="info-tooltip">${e.help}</div>
          ${
            e.hasEdit
              ? `
          <button class="info-edit-btn" data-lyrics-open="${t.id}" aria-label="Edit ${e.label}" data-tip="Lyrics">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>`
              : ""
          }
          <button class="info-copy-btn" data-copy="${O(e.copyVal || e.val)}" aria-label="Copy ${e.label}">
            <span class="icon-copy">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="icon-check">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      `
          )
          .join("") +
        `
        <div class="info-search-empty" id="infoSearchEmpty">
          <div class="search-empty-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="8" x2="14" y2="14" />
            </svg>
          </div>
          <div class="search-empty-title">No matching track info</div>
          <div class="search-empty-sub">Try searching for another term</div>
        </div>
      `;

      if (infoSearchInput && infoSearchInput.value.trim()) {
        filterInfoCards(infoSearchInput.value, false);
      }

      Ae.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => {
        Ae.classList.add("open");
        const e = Array.from($e.querySelectorAll(".info-val-wrap")),
          t = Array.from($e.querySelectorAll(".info-val"));
        U(e.map((e, n) => ({ wrapEl: e, innerEl: t[n] })));
        requestAnimationFrame(nt);
      });
    }

    function zt() {
      const trackId = currentEditTrackId || a;
      const soundTrack = r.find((e) => e.id === trackId);
      if (!soundTrack || !editContent) return void Bt();

      const getVal = (key) => {
        const el = editContent.querySelector(`#editField_${key}`);
        return el ? el.value : "";
      };

      const newName = (getVal("name") || "").trim() || soundTrack.name;
      const newArtist = (getVal("artist") || "").trim();
      const newAlbum = (getVal("album") || "").trim();
      const newGenre = (getVal("genre") || "").trim();
      const newYear = (getVal("year") || "").trim();
      const newTrack = (getVal("track") || "").trim();
      const newDiscnumber = (getVal("discnumber") || "").trim();
      const newComposer = (getVal("composer") || "").trim();
      const newComment = (getVal("comment") || "").trim();
      const newLyrics = getVal("lyrics") || "";

      const oldName = soundTrack.name;
      soundTrack.name = newName;
      soundTrack.tags = soundTrack.tags || {};
      soundTrack.tags.artist = newArtist;
      soundTrack.tags.album = newAlbum;
      soundTrack.tags.genre = newGenre;
      soundTrack.tags.year = newYear;
      soundTrack.tags.track = newTrack;
      soundTrack.tags.discnumber = newDiscnumber;
      soundTrack.tags.composer = newComposer;
      soundTrack.tags.comment = newComment;
      soundTrack.lyrics = newLyrics ? newLyrics.trim() : null;

      if (oldName !== newName) {
        if (te) {
          Array.from(te.querySelectorAll(`.sound-card[data-id="${soundTrack.id}"] .sound-name`)).forEach((el) => {
            if (el.textContent !== newName) {
              el.classList.add("swapping");
              setTimeout(() => {
                el.textContent = newName;
                el.classList.remove("swapping");
                W(el.closest(".sound-name-wrap"), el);
              }, 180);
            }
          });
        }
        if (K) {
          const railItem = K.querySelector(`.rail-sound[data-id="${soundTrack.id}"]`);
          if (railItem) railItem.dataset.tip = newName;
        }
        if (soundTrack.id === i) {
          if (De && De.textContent !== newName) {
            De.classList.add("swapping");
            setTimeout(() => {
              At(soundTrack);
              De.classList.remove("swapping");
            }, 180);
          } else {
            At(soundTrack);
          }
        }
      }

      if (typeof setupAdaptiveProfile === "function") {
        setupAdaptiveProfile(soundTrack);
      }

      if (Ae && Ae.classList.contains("open") && Ft === soundTrack.id) {
        jt(soundTrack.id);
      }

      if (typeof lyricsModal !== "undefined" && lyricsModal && lyricsModal.classList.contains("open") && lyricsTrackId === soundTrack.id) {
        if (typeof openLyricsModal === "function") {
          openLyricsModal(soundTrack.id, false);
        }
      }

      It(`Updated — ${soundTrack.name}`, "success");
      Bt();
    }

    ye &&
      ye.addEventListener("click", (e) => {
        e.target.matches("[data-close]") && Bt();
      });

    Ae &&
      Ae.addEventListener("click", async (e) => {
        if (e.target.matches("[data-close]") && Ae && Ae.classList.contains("open")) {
          closeTrackInfoModal();
        }

        const t = e.target.closest(".info-help-btn");
        if (t) {
          const e = t.nextElementSibling;
          if (e && e.classList.contains("info-tooltip")) {
            const n = e.classList.contains("show");
            document
              .querySelectorAll(".info-tooltip.show")
              .forEach((e) => e.classList.remove("show"));
            document
              .querySelectorAll(".info-help-btn.active")
              .forEach((e) => e.classList.remove("active"));
            n || (e.classList.add("show"), t.classList.add("active"));
          }
        } else {
          document
            .querySelectorAll(".info-tooltip.show")
            .forEach((e) => e.classList.remove("show"));
          document
            .querySelectorAll(".info-help-btn.active")
            .forEach((e) => e.classList.remove("active"));
        }

        const editBtn = e.target.closest(".info-edit-btn");
        if (editBtn) {
          const trackId = parseInt(editBtn.dataset.lyricsOpen, 10);
          closeTrackInfoModal();
          openLyricsModal(trackId);
          return;
        }

        const n = e.target.closest(".info-copy-btn");
        if (n && !n.classList.contains("copied")) {
          const e = n.dataset.copy;
          if (e)
            try {
              await navigator.clipboard.writeText(e);
              It("Copied to clipboard", "success");
              n.classList.add("copied");
              syncCursor();
              setTimeout(() => {
                n.classList.remove("copied");
                syncCursor();
              }, 1500);
            } catch (err) {
              It("Failed to copy", "error");
            }
        }
      });

    xe && xe.addEventListener("click", zt);
    Le &&
      Le.addEventListener("keydown", (e) => {
        "Enter" === e.key && zt();
      });

    let Dt = [];
    const Ht = e("#toastContainer");
    function Rt(e) {
      clearTimeout(e.timer);
      e.el.classList.remove("show");
      e.el.classList.add("removing");
      setTimeout(() => {
        e.el.parentNode && e.el.parentNode.removeChild(e.el);
      }, 300);
    }
    function It(e, t = "") {
      if (!Ht) return;
      const n = document.createElement("div");
      n.className = `toast ${t}`;
      n.innerHTML = `<span class="toast-dot"></span><span class="toast-msg">${O(e)}</span>`;
      Ht.appendChild(n);
      n.offsetHeight;
      n.classList.add("show");
      const o = { el: n, timer: null };
      Dt.push(o);
      Dt.length > 3 && Rt(Dt.shift());
      o.timer = setTimeout(() => {
        const e = Dt.indexOf(o);
        -1 !== e && Dt.splice(e, 1);
        Rt(o);
      }, 3e3);
    }

    const Pt = document.createElement("div");
    Pt.className = "tip";
    document.body.appendChild(Pt);
    let Yt,
      Nt = null,
      Ot = null;
    function Ut() {
      Nt = null;
      clearTimeout(Ot);
      Pt.classList.remove("show");
    }

    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-tip]");
      var n;
      t &&
        ((n = t),
        Nt && Nt !== n && Ut(),
        (Nt = n),
        clearTimeout(Ot),
        (Ot = setTimeout(() => {
          Nt &&
            ((function (e) {
              const t = e.getBoundingClientRect(),
                n = e.dataset.tip;
              if (!n) return;
              Pt.textContent = n;
              const o = Pt.getBoundingClientRect();
              let r, i;
              "left" === (e.dataset.tipPos || "right")
                ? ((r = t.left - o.width - 10),
                  (i = t.top + t.height / 2 - o.height / 2),
                  r < 8 && (r = t.right + 10))
                : ((r = t.right + 10),
                  (i = t.top + t.height / 2 - o.height / 2),
                  r + o.width > window.innerWidth - 8 && (r = t.left - o.width - 10));
              i = Math.max(8, Math.min(window.innerHeight - o.height - 8, i));
              Pt.style.transform = `translate(${Math.round(r)}px, ${Math.round(i)}px)`;
            })(Nt),
            Pt.classList.add("show"));
        }, 380)));
    });

    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest("[data-tip]");
      t && ((e.relatedTarget && t.contains(e.relatedTarget)) || (Nt === t && Ut()));
    });
    window.addEventListener("scroll", Ut, { passive: !0 });
    window.addEventListener("resize", () => {
      Ut();
      clearTimeout(Yt);
      Yt = setTimeout(() => {
        requestAnimationFrame(() => {
          Qe();
          updateAllMarquees();
        });
      }, 150);
    });

    if (typeof ResizeObserver !== "undefined") {
      let roTimeout;
      const ro = new ResizeObserver(() => {
        clearTimeout(roTimeout);
        roTimeout = setTimeout(() => {
          requestAnimationFrame(updateAllMarquees);
        }, 50);
      });
      if (te) ro.observe(te);
      if (ze) ro.observe(ze);
      if (Ge) ro.observe(Ge);
    }
    if (te) {
      te.addEventListener("transitionend", (e) => {
        if (e.propertyName === "padding-right") {
          updateAllMarquees();
        }
      });
    }
    if (Ge) {
      Ge.addEventListener("mouseenter", () => {
        requestAnimationFrame(updateAllMarquees);
        setTimeout(updateAllMarquees, 260);
      });
      Ge.addEventListener("mouseleave", () => {
        requestAnimationFrame(updateAllMarquees);
        setTimeout(updateAllMarquees, 260);
      });
    }

    let lastCursorClientX = 0,
      lastCursorClientY = 0;
    document.addEventListener(
      "mousemove",
      (e) => {
        lastCursorClientX = e.clientX;
        lastCursorClientY = e.clientY;
      },
      { passive: !0 }
    );

    const CURSOR_POINTER_SELECTOR =
      "button, a, [data-tip], .pc-btn, .sound-action, .sound-delete, .custom-scrollbar-thumb, .sound-thumb, .rail-sound, .pp-track, .pp-thumb, .pp-time, .pp-times, .pp-thumb-label, .info-edit-btn, .lyrics-edit-toggle";
    function applyCursorForTarget(t) {
      if ("grabbing" === document.body.getAttribute("data-cursor")) return;
      if (!t) return void document.body.removeAttribute("data-cursor");
      if (t.closest(".copied") || getComputedStyle(t).pointerEvents === "none")
        return void document.body.removeAttribute("data-cursor");
      t.closest(CURSOR_POINTER_SELECTOR)
        ? document.body.setAttribute("data-cursor", "pointer")
        : t.closest(".sound-card")
        ? t.closest(".sound-card").classList.contains("dragging") ||
          document.body.setAttribute("data-cursor", "grab")
        : t.closest("input, textarea")
        ? document.body.setAttribute("data-cursor", "text")
        : document.body.removeAttribute("data-cursor");
    }
    function syncCursor() {
      applyCursorForTarget(
        document.elementFromPoint(lastCursorClientX, lastCursorClientY)
      );
    }

    const Wt = e("#cursorWrap");
    if (Wt) {
      let e = !1,
        t = 0,
        n = 0,
        o = null;
      document.addEventListener("mousemove", (r) => {
        e || ((Wt.style.opacity = "1"), (e = !0));
        t = r.clientX;
        n = r.clientY;
        o ||
          (o = requestAnimationFrame(() => {
            Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`;
            o = null;
          }));
      });
      document.addEventListener("dragover", (r) => {
        e || ((Wt.style.opacity = "1"), (e = !0));
        t = r.clientX;
        n = r.clientY;
        o ||
          (o = requestAnimationFrame(() => {
            Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`;
            o = null;
          }));
      });
      document.addEventListener("drag", (r) => {
        (0 === r.clientX && 0 === r.clientY) ||
          (e || ((Wt.style.opacity = "1"), (e = !0)),
          (t = r.clientX),
          (n = r.clientY),
          o ||
            (o = requestAnimationFrame(() => {
              Wt.style.transform = `translate3d(${t}px, ${n}px, 0)`;
              o = null;
            })));
      });
      document.addEventListener("mouseover", (e) => {
        applyCursorForTarget(e.target);
      });
      document.addEventListener("mousedown", (e) => {
        const t = e.target;
        t.closest(
          "button, a, .sound-thumb, .icon-btn, .sound-action, .sound-delete"
        ) ||
          (t.closest(".sound-card, .pp-thumb, .pp-track") &&
            document.body.setAttribute("data-cursor", "grabbing"));
      });
      document.addEventListener("mouseup", (e) => {
        "grabbing" === document.body.getAttribute("data-cursor") &&
          (document.body.removeAttribute("data-cursor"),
          e.target.dispatchEvent(new MouseEvent("mouseover", { bubbles: !0 })));
      });
    }

    lt();
    dt();
    window.AUDIOTWEAK = {
      get sounds() {
        return r;
      },
      get activeId() {
        return i;
      },
      get isPlaying() {
        return l;
      },
      add: (e) => We(Array.isArray(e) ? e : [e]),
    };
  }

  "loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", G, { once: !0 })
    : G();
})();
