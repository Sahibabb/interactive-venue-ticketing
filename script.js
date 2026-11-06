const seatMap = document.getElementById("seat-map");
const statusMessage = document.getElementById("status-message");
const seatDetails = document.getElementById("seat-details");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");

const mapViewport = document.getElementById("map-viewport");
const mapContent = document.getElementById("map-content");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const moveUpBtn = document.getElementById("move-up-btn");
const moveDownBtn = document.getElementById("move-down-btn");
const moveLeftBtn = document.getElementById("move-left-btn");
const moveRightBtn = document.getElementById("move-right-btn");
const resetViewBtn = document.getElementById("reset-view-btn");

const STORAGE_KEY = "venueTicketingCart";

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const ZOOM_FACTOR = 1.25;
const MOVE_STEP = 80;
const EDGE_MARGIN = 40;

const seatsById = {};
let cart = [];
let inspectedSeatId = null;

let viewScale = 1;
let viewX = 0;
let viewY = 0;

function rowLetter(index) {
  return String.fromCharCode(65 + index);
}

function findSeatButton(seatId) {
  return seatMap.querySelector('[data-id="' + seatId + '"]');
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Could not save the cart:", error);
  }
}

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const cleaned = [];

    for (const seatId of parsed) {
      const seat = seatsById[seatId];
      const isValid = seat && !seat.unavailable;
      const isDuplicate = cleaned.includes(seatId);

      if (isValid && !isDuplicate) {
        cleaned.push(seatId);
      }
    }

    return cleaned;
  } catch (error) {
    console.error("Could not read the saved cart:", error);
    return [];
  }
}

function createSeat(section, rowName, seatNumber) {
  const seatId = section.id + "-" + rowName + "-" + seatNumber;
  const isUnavailable = venue.unavailableSeats.includes(seatId);

  seatsById[seatId] = {
    id: seatId,
    sectionName: section.name,
    row: rowName,
    number: seatNumber,
    price: section.price,
    unavailable: isUnavailable
  };

  const seat = document.createElement("button");
  seat.type = "button";
  seat.className = "seat";
  seat.textContent = seatNumber;
  seat.dataset.id = seatId;
  seat.style.setProperty("--seat-color", section.color);

  if (isUnavailable) {
    seat.classList.add("unavailable");
  }

  seat.addEventListener("click", function () {
    inspectSeat(seatId);
  });

  return seat;
}

function createRow(section, rowIndex) {
  const rowName = rowLetter(rowIndex);

  const row = document.createElement("div");
  row.className = "row";

  const label = document.createElement("span");
  label.className = "row-label";
  label.textContent = rowName;
  row.appendChild(label);

  for (let number = 1; number <= section.seatsPerRow; number++) {
    row.appendChild(createSeat(section, rowName, number));
  }

  return row;
}

function createSection(section) {
  const sectionBox = document.createElement("div");
  sectionBox.className = "section";

  const title = document.createElement("div");
  title.className = "section-title";
  title.textContent = section.name + " - " + section.price + " " + venue.currency;
  sectionBox.appendChild(title);

  for (let rowIndex = 0; rowIndex < section.rows; rowIndex++) {
    sectionBox.appendChild(createRow(section, rowIndex));
  }

  return sectionBox;
}

function showSeatDetails(seat) {
  let statusText = "Available";
  let statusClass = "status-available";

  if (seat.unavailable) {
    statusText = "Unavailable (sold)";
    statusClass = "status-unavailable";
  } else if (cart.includes(seat.id)) {
    statusText = "In your cart";
    statusClass = "status-incart";
  }

  seatDetails.innerHTML = `
    <p class="detail-line"><strong>Section:</strong> ${seat.sectionName}</p>
    <p class="detail-line"><strong>Row:</strong> ${seat.row}</p>
    <p class="detail-line"><strong>Seat:</strong> ${seat.number}</p>
    <p class="detail-line detail-price">${seat.price} ${venue.currency}</p>
    <p class="detail-line"><strong>Status:</strong> <span class="${statusClass}">${statusText}</span></p>
  `;
}

function updateAddButton() {
  if (inspectedSeatId === null) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "ADD TO CART";
    return;
  }

  const seat = seatsById[inspectedSeatId];

  if (seat.unavailable) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "SEAT UNAVAILABLE";
  } else if (cart.includes(seat.id)) {
    addToCartBtn.disabled = true;
    addToCartBtn.textContent = "ALREADY IN CART";
  } else {
    addToCartBtn.disabled = false;
    addToCartBtn.textContent = "ADD TO CART";
  }
}

function refreshInspectedPanel() {
  if (inspectedSeatId !== null) {
    showSeatDetails(seatsById[inspectedSeatId]);
  }
  updateAddButton();
}

function inspectSeat(seatId) {
  const previousButton = seatMap.querySelector(".seat.inspected");
  if (previousButton) {
    previousButton.classList.remove("inspected");
  }

  findSeatButton(seatId).classList.add("inspected");

  inspectedSeatId = seatId;
  refreshInspectedPanel();
}

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  for (const seatId of cart) {
    const seat = seatsById[seatId];
    total = total + seat.price;

    const item = document.createElement("li");
    item.className = "cart-item";

    const info = document.createElement("span");
    info.className = "cart-item-info";
    info.textContent = seat.sectionName + " - Row " + seat.row + ", Seat " + seat.number;

    const price = document.createElement("span");
    price.className = "cart-item-price";
    price.textContent = seat.price + " " + venue.currency;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", "Remove " + info.textContent + " from cart");
    removeBtn.addEventListener("click", function () {
      removeFromCart(seatId);
    });

    item.appendChild(info);
    item.appendChild(price);
    item.appendChild(removeBtn);
    cartList.appendChild(item);
  }

  cartEmpty.hidden = cart.length > 0;
  cartTotal.textContent = total + " " + venue.currency;
}

function addToCart(seatId) {
  const seat = seatsById[seatId];

  if (!seat || seat.unavailable || cart.includes(seatId)) {
    return;
  }

  cart.push(seatId);
  findSeatButton(seatId).classList.add("in-cart");

  saveCart();
  renderCart();
  refreshInspectedPanel();
}

function removeFromCart(seatId) {
  cart = cart.filter(function (id) {
    return id !== seatId;
  });

  findSeatButton(seatId).classList.remove("in-cart");

  saveCart();
  renderCart();
  refreshInspectedPanel();
}

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampPosition() {
  const viewW = mapViewport.clientWidth;
  const viewH = mapViewport.clientHeight;
  const contentW = mapContent.offsetWidth * viewScale;
  const contentH = mapContent.offsetHeight * viewScale;

  const minX = Math.min(0, viewW - contentW) - EDGE_MARGIN;
  const maxX = Math.max(0, viewW - contentW) + EDGE_MARGIN;
  const minY = Math.min(0, viewH - contentH) - EDGE_MARGIN;
  const maxY = Math.max(0, viewH - contentH) + EDGE_MARGIN;

  viewX = clampValue(viewX, minX, maxX);
  viewY = clampValue(viewY, minY, maxY);
}

function applyView() {
  clampPosition();

  mapContent.style.transform =
    "translate(" + viewX + "px, " + viewY + "px) scale(" + viewScale + ")";

  zoomInBtn.disabled = viewScale >= MAX_SCALE;
  zoomOutBtn.disabled = viewScale <= MIN_SCALE;
}

function zoomBy(factor) {
  const newScale = clampValue(viewScale * factor, MIN_SCALE, MAX_SCALE);

  if (newScale === viewScale) {
    return;
  }

  const ratio = newScale / viewScale;
  const centerX = mapViewport.clientWidth / 2;
  const centerY = mapViewport.clientHeight / 2;

  viewX = centerX - (centerX - viewX) * ratio;
  viewY = centerY - (centerY - viewY) * ratio;
  viewScale = newScale;

  applyView();
}

function moveBy(dx, dy) {
  viewX = viewX + dx;
  viewY = viewY + dy;
  applyView();
}

function resetView() {
  const fitScale = (mapViewport.clientWidth - 20) / mapContent.offsetWidth;

  viewScale = clampValue(Math.min(1, fitScale), MIN_SCALE, MAX_SCALE);
  viewX = (mapViewport.clientWidth - mapContent.offsetWidth * viewScale) / 2;
  viewY = 10;

  applyView();
}

addToCartBtn.addEventListener("click", function () {
  if (inspectedSeatId !== null) {
    addToCart(inspectedSeatId);
  }
});

zoomInBtn.addEventListener("click", function () {
  zoomBy(ZOOM_FACTOR);
});

zoomOutBtn.addEventListener("click", function () {
  zoomBy(1 / ZOOM_FACTOR);
});

moveUpBtn.addEventListener("click", function () {
  moveBy(0, MOVE_STEP);
});

moveDownBtn.addEventListener("click", function () {
  moveBy(0, -MOVE_STEP);
});

moveLeftBtn.addEventListener("click", function () {
  moveBy(MOVE_STEP, 0);
});

moveRightBtn.addEventListener("click", function () {
  moveBy(-MOVE_STEP, 0);
});

resetViewBtn.addEventListener("click", resetView);

window.addEventListener("resize", applyView);

let totalSeats = 0;

for (const section of venue.sections) {
  seatMap.appendChild(createSection(section));
  totalSeats = totalSeats + section.rows * section.seatsPerRow;
}

cart = loadCart();

for (const seatId of cart) {
  findSeatButton(seatId).classList.add("in-cart");
}

saveCart();

statusMessage.textContent =
  venue.name + " - total seats: " + totalSeats + ". Click a seat to inspect it.";

renderCart();
updateAddButton();
resetView();