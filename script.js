const seatMap = document.getElementById("seat-map");
const statusMessage = document.getElementById("status-message");
const seatDetails = document.getElementById("seat-details");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const cartList = document.getElementById("cart-list");
const cartEmpty = document.getElementById("cart-empty");
const cartTotal = document.getElementById("cart-total");

const seatsById = {};
let cart = [];
let inspectedSeatId = null;

function rowLetter(index) {
  return String.fromCharCode(65 + index);
}

function findSeatButton(seatId) {
  return seatMap.querySelector('[data-id="' + seatId + '"]');
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

  renderCart();
  refreshInspectedPanel();
}

function removeFromCart(seatId) {
  cart = cart.filter(function (id) {
    return id !== seatId;
  });

  findSeatButton(seatId).classList.remove("in-cart");

  renderCart();
  refreshInspectedPanel();
}

addToCartBtn.addEventListener("click", function () {
  if (inspectedSeatId !== null) {
    addToCart(inspectedSeatId);
  }
});

let totalSeats = 0;

for (const section of venue.sections) {
  seatMap.appendChild(createSection(section));
  totalSeats = totalSeats + section.rows * section.seatsPerRow;
}

statusMessage.textContent =
  venue.name + " - total seats: " + totalSeats + ". Click a seat to inspect it.";

renderCart();
updateAddButton();