document.addEventListener("DOMContentLoaded", async function () {
  const grid = document.getElementById("rosterFullGrid");
  const totalCount = document.getElementById("totalCount");

  if (!grid) return;

  try {
    const res = await fetch("data/players.json");
    if (!res.ok) throw new Error("players.json を読み込めませんでした");

    const data = await res.json();
    const allMembers = Array.isArray(data) ? data : data.players || [];

    if (totalCount) totalCount.textContent = allMembers.length;

    // カードを全部描画する（フィルターは roster-filter.js が担当）
    allMembers.forEach(function (member) {
      grid.appendChild(createCard(member));
    });

    // 描画後にフィルターを適用
    if (typeof applyFilter === "function") applyFilter();

  } catch (error) {
    console.error(error);
    grid.textContent = "選手データを読み込めませんでした。";
  }

  function createCard(player) {
    const name = player.name || "No Name";
    const grade = player.grade ? player.grade + "回生" : "";
    const position = player.position || player.staffRole || "";
    const number =
      player.number !== null && player.number !== undefined && player.number !== ""
        ? "#" + player.number
        : player.staffRole || "";
    const role = player.role || "";
    const faculty = player.faculty || "";
    const department = player.department || "";
    const school = player.school || "";
    const photo = getPhoto(player);

    const card = document.createElement("div");
    card.className = "player-card";
    // section に応じてクラスを追加
    if (player.section === "staff") card.classList.add("staff-card");
    if (player.section === "coach" || player.section === "coaches") card.classList.add("coach-card");
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
      const valid = player.photos.find(function (p) { return p && p.trim() !== ""; });
      if (valid) return valid;
    }
    return "";
  }
});
