import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// 🔥 Firebase config yaha baad me dalenge
const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ⭐ Google Review link baad me yaha dalenge
const GOOGLE_REVIEW_LINK = "PASTE_YOUR_GOOGLE_REVIEW_LINK";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const reviewsRef = collection(db, "reviews");

const $ = (id) => document.getElementById(id);

let selectedRating = 0;

$("googleReviewBtn").href = GOOGLE_REVIEW_LINK;
$("year").textContent = new Date().getFullYear();


// ⭐ Rating buttons
document.querySelectorAll("#ratingInput button").forEach(button => {
  button.addEventListener("click", () => {

    selectedRating = Number(button.dataset.rating);

    $("rating").value = selectedRating;

    document.querySelectorAll("#ratingInput button").forEach(btn => {
      btn.classList.toggle(
        "active",
        Number(btn.dataset.rating) <= selectedRating
      );
    });

  });
});


// Character counter
$("review").addEventListener("input", () => {
  $("charCount").textContent = $("review").value.length;
});


// Stars
function stars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}


// Date
function safeDate(timestamp) {

  if (!timestamp) return "Just now";

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


// Security: prevent HTML injection
function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// Update rating summary
function updateSummary(reviews) {

  const total = reviews.length;

  const counts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    counts[review.rating]++;
  });

  const average = total
    ? reviews.reduce(
        (sum, review) => sum + Number(review.rating),
        0
      ) / total
    : 0;

  $("averageRating").textContent = average.toFixed(1);

  $("averageStars").textContent =
    stars(Math.round(average));

  $("reviewCount").textContent = total;


  [1, 2, 3, 4, 5].forEach(number => {

    $(`count${number}`).textContent =
      counts[number];

    $(`bar${number}`).style.width =
      total
        ? `${(counts[number] / total) * 100}%`
        : "0%";

  });

}


// Load reviews
async function loadReviews() {

  const list = $("reviewsList");

  list.innerHTML =
    '<div class="loading">Loading reviews...</div>';

  try {

    const reviewsQuery = query(
      reviewsRef,
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const snapshot =
      await getDocs(reviewsQuery);

    const reviews =
      snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    updateSummary(reviews);


    if (!reviews.length) {

      list.innerHTML =
        '<div class="empty">No reviews yet. Be the first one! ❤️</div>';

      return;
    }


    list.innerHTML = reviews.map(review => `

      <article class="review">

        <div class="review-top">

          <div>

            <div class="review-name">
              ${escapeHtml(review.name || "Customer")}
            </div>

            <div class="review-date">
              ${safeDate(review.createdAt)}
            </div>

          </div>

          <div
            class="review-stars"
            aria-label="${Number(review.rating)} out of 5 stars"
          >
            ${stars(Number(review.rating))}
          </div>

        </div>

        <p class="review-text">
          ${escapeHtml(review.text || "")}
        </p>

      </article>

    `).join("");


  } catch (error) {

    console.error(error);

    list.innerHTML =
      '<div class="empty">Reviews could not be loaded. Check Firebase setup.</div>';

  }

}


// Submit review
$("reviewForm").addEventListener("submit", async event => {

  event.preventDefault();

  const name =
    $("name").value.trim();

  const text =
    $("review").value.trim();

  const rating =
    Number($("rating").value);

  const message =
    $("formMessage");

  const button =
    $("submitBtn");


  message.className = "message";


  if (!name || name.length > 60) {

    message.textContent =
      "Please enter a valid name.";

    message.classList.add("error");

    return;
  }


  if (!rating || rating < 1 || rating > 5) {

    message.textContent =
      "Please choose a star rating.";

    message.classList.add("error");

    return;
  }


  if (!text || text.length > 500) {

    message.textContent =
      "Please write a review (max 500 characters).";

    message.classList.add("error");

    return;
  }


  button.disabled = true;
  button.textContent = "Posting...";


  try {

    await addDoc(reviewsRef, {

      name: name,

      text: text,

      rating: rating,

      createdAt: serverTimestamp()

    });


    message.textContent =
      "Thank you! Your review has been posted ❤️";

    message.classList.add("success");


    $("reviewForm").reset();

    $("rating").value = 0;

    $("charCount").textContent = "0";

    selectedRating = 0;


    document
      .querySelectorAll("#ratingInput button")
      .forEach(btn =>
        btn.classList.remove("active")
      );


    await loadReviews();


  } catch (error) {

    console.error(error);

    message.textContent =
      "Review post nahi hua. Firebase setup check karo.";

    message.classList.add("error");

  }


  button.disabled = false;

  button.textContent = "Post Review";

});


// Refresh reviews
$("refreshBtn").addEventListener(
  "click",
  loadReviews
);


// Start
loadReviews();
