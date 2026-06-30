document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("rosterFullGrid");
  const visCount = document.getElementById("visCount");
  const totalCount = document.getElementById("totalCount");

  if (!grid) return;

  let allMembers = [];
  let currentSection = "players";
  let currentYear = "all";

  try {
    const res = await fetch("data/players.json");
    if (!res.ok) throw new Error("players.json を読み込めませんでした");

    const data = await res.json();
    allMembers = Array.isArray(data) ? data : data.players || [];

    setupTabs();
    renderRoster();
  } catch (error) {
    console.error(error);
    grid.textContent = "選手データを読み込めませんでした。";
  }

  function setupTabs() {
    document.querySelectorAll(".stab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".stab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        currentSection = btn.dataset.section;
        currentYear = "all";

        document.querySelectorAll(".ytab").forEach((b) => b.classList.remove("active"));
        const allYearBtn = document.querySelector('.ytab[data-year="all"]');
        if (allYearBtn) allYearBtn.classList.add("active");

        const yearBar = document.getElementById("year-sub-bar");
        if (yearBar) {
          yearBar.style.display = currentSection === "players" ? "" : "none";
        }

        renderRoster();
      });
    });

    document.querySelectorAll(".ytab").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ytab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        currentYear = btn.dataset.year;
        renderRoster();
      });
    });
  }

  function renderRoster() {
    let members = allMembers.filter((member) => {
      if (currentSection === "players") return member.section === "player";
      if (currentSection === "staff") return member.section === "staff";
      if (currentSection === "coaches") {
        return member.section === "coach" || member.section === "coaches";
      }
      return true;
    });

    if (currentSection === "players" && currentYear !== "all") {
      members = members.filter((member) => String(member.grade) === String(currentYear));
    }

    if (visCount) visCount.textContent = members.length;
    if (totalCount) totalCount.textContent = allMembers.length;

    grid.innerHTML = "";

    members.forEach((member) => {
      grid.appendChild(createCard(member));
    });
  }

  function createCard(player) {
    const name = player.name || "No Name";
    const grade = player.grade ? `${player.grade}回生` : "";
    const position = player.position || player.staffRole || "";
    const number =
      player.number !== null && player.number !== undefined && player.number !== ""
        ? `#${player.number}`
        : player.staffRole || "";
    const role = player.role || "";
    const faculty = player.faculty || "";
    const department = player.department || "";
    const school = player.school || "";
    const photo = getPhoto(player);

    const card = document.createElement("div");
    card.className = "player-card";
    card.dataset.year = player.grade || "";

    const photoWrap = document.createElement("div");
    photoWrap.className = "player-photo";

    if (photo) {
      const img = document.createElement("img");
      img.src = photo;
      img.alt = name;
      img.loading = "lazy";
      photoWrap.appendChild(img);
    } else {
      const slot = document.createElement("div");
      slot.className = "img-slot light";

      const label = document.createElement("span");
      label.className = "slot-label";
      label.textContent = name;

      slot.appendChild(label);
      photoWrap.appendChild(slot);
    }

    const num = document.createElement("div");
    num.className = role ? "player-num" : "player-num no-role";
    num.textContent = number;

    const info = document.createElement("div");
    info.className = "player-info";

    const pos = document.createElement("div");
    pos.className = "player-pos";
    pos.textContent = [grade, position].filter(Boolean).join(" / ");

    const nameEl = document.createElement("div");
    nameEl.className = "player-name";
    nameEl.textContent = name;

    info.appendChild(pos);
    info.appendChild(nameEl);

    if (role) {
      const roleEl = document.createElement("div");
      roleEl.className = "player-role";
      roleEl.textContent = role;
      info.appendChild(roleEl);
    }

    if (faculty || department) {
      const meta = document.createElement("div");
      meta.className = "player-meta";
      meta.textContent = [faculty, department].filter(Boolean).join(" ");
      info.appendChild(meta);
    }

    if (school) {
      const schoolEl = document.createElement("div");
      schoolEl.className = "player-meta";
      schoolEl.textContent = school;
      info.appendChild(schoolEl);
    }

    card.appendChild(photoWrap);
    card.appendChild(num);
    card.appendChild(info);

    return card;
  }

  function getPhoto(player) {
    if (player.photo && player.photo.trim() !== "") return player.photo;

    if (Array.isArray(player.photos)) {
      const validPhoto = player.photos.find((p) => p && p.trim() !== "");
      if (validPhoto) return validPhoto;
    }

    return "";
  }
});
