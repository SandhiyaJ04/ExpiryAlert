// ==========================================
// EXPIRYALERT - FOOD EXPIRY MANAGER
// ==========================================


// Get saved food items from localStorage

let foodItems = JSON.parse(localStorage.getItem("expiryAlertFood")) || [];


// DOM Elements

const foodForm = document.getElementById("foodForm");
const foodContainer = document.getElementById("foodContainer");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");


// ==========================================
// FOOD EMOJIS
// ==========================================

const foodEmojis = {
    Dairy: "🥛",
    Fruits: "🍎",
    Vegetables: "🥦",
    Meat: "🍗",
    Bakery: "🍞",
    Beverages: "🥤",
    Grains: "🌾",
    Other: "📦"
};


// ==========================================
// ADD FOOD
// ==========================================

foodForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const foodName = document.getElementById("foodName").value.trim();
    const category = document.getElementById("category").value;
    const quantity = document.getElementById("quantity").value.trim();
    const expiryDate = document.getElementById("expiryDate").value;
    const notes = document.getElementById("notes").value.trim();


    const newFood = {

        id: Date.now(),

        name: foodName,

        category: category,

        quantity: quantity,

        expiryDate: expiryDate,

        notes: notes

    };


    foodItems.push(newFood);


    // Save data

    localStorage.setItem(
        "expiryAlertFood",
        JSON.stringify(foodItems)
    );


    // Reset form

    foodForm.reset();


    // Refresh display

    displayFoodItems();


    // Scroll to food list

    document.getElementById("food-list").scrollIntoView({
        behavior: "smooth"
    });

});


// ==========================================
// GET FOOD STATUS
// ==========================================

function getFoodStatus(expiryDate) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const expiry = new Date(expiryDate);

    expiry.setHours(0, 0, 0, 0);


    const difference =
        expiry.getTime() - today.getTime();


    const daysLeft =
        Math.ceil(difference / (1000 * 60 * 60 * 24));


    if (daysLeft < 0) {

        return {
            type: "expired",
            text: "Expired",
            days: daysLeft
        };

    }


    if (daysLeft <= 3) {

        return {
            type: "soon",
            text: daysLeft === 0
                ? "Expires Today"
                : `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`,
            days: daysLeft
        };

    }


    return {

        type: "fresh",

        text: `${daysLeft} days left`,

        days: daysLeft

    };

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


// ==========================================
// DISPLAY FOOD ITEMS
// ==========================================

function displayFoodItems() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedCategory =
        filterCategory.value;


    foodContainer.innerHTML = "";


    const filteredItems = foodItems.filter(function(food) {

        const matchesSearch =
            food.name.toLowerCase().includes(searchText);


        const matchesCategory =
            selectedCategory === "All" ||
            food.category === selectedCategory;


        return matchesSearch && matchesCategory;

    });


    if (filteredItems.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    filteredItems.forEach(function(food) {

        const status =
            getFoodStatus(food.expiryDate);


        const card =
            document.createElement("div");


        card.className = "food-card";


        card.innerHTML = `

            <div class="food-top">

                <div class="food-emoji">
                    ${foodEmojis[food.category] || "📦"}
                </div>

                <span class="status ${status.type}">
                    ${status.text}
                </span>

            </div>


            <h3>${escapeHTML(food.name)}</h3>

            <div class="category">
                ${food.category}
            </div>


            <div class="food-info">

                <div>
                    📦 <strong>Quantity:</strong>
                    ${escapeHTML(food.quantity)}
                </div>

                <div>
                    📅 <strong>Expiry:</strong>
                    ${formatDate(food.expiryDate)}
                </div>

                ${
                    food.notes
                    ? `<div>
                        📝 <strong>Note:</strong>
                        ${escapeHTML(food.notes)}
                       </div>`
                    : ""
                }

            </div>


            <button
                class="delete-btn"
                onclick="deleteFood(${food.id})"
            >
                🗑️ Remove Item
            </button>

        `;


        foodContainer.appendChild(card);

    });


    updateStatistics();

}


// ==========================================
// DELETE FOOD
// ==========================================

function deleteFood(id) {

    const confirmation =
        confirm("Are you sure you want to remove this food item?");


    if (!confirmation) {

        return;

    }


    foodItems =
        foodItems.filter(function(food) {

            return food.id !== id;

        });


    localStorage.setItem(
        "expiryAlertFood",
        JSON.stringify(foodItems)
    );


    displayFoodItems();

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    let fresh = 0;

    let soon = 0;

    let expired = 0;


    foodItems.forEach(function(food) {

        const status =
            getFoodStatus(food.expiryDate);


        if (status.type === "fresh") {

            fresh++;

        }

        else if (status.type === "soon") {

            soon++;

        }

        else {

            expired++;

        }

    });


    document.getElementById("totalItems").textContent =
        foodItems.length;


    document.getElementById("freshItems").textContent =
        fresh;


    document.getElementById("soonItems").textContent =
        soon;


    document.getElementById("expiredItems").textContent =
        expired;

}


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    displayFoodItems
);


// ==========================================
// CATEGORY FILTER
// ==========================================

filterCategory.addEventListener(
    "change",
    displayFoodItems
);


// ==========================================
// SECURITY FUNCTION
// Prevent HTML injection from user input
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// SET MINIMUM DATE
// Prevent selecting dates before today
// ==========================================

const today = new Date();

const year = today.getFullYear();

const month =
    String(today.getMonth() + 1).padStart(2, "0");

const day =
    String(today.getDate()).padStart(2, "0");


document.getElementById("expiryDate").min =
    `${year}-${month}-${day}`;


// ==========================================
// INITIAL DISPLAY
// ==========================================

displayFoodItems();