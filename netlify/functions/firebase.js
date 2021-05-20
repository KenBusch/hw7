const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyCikRjGgOepS60l87kxfGTXZc0Qflkwc5A",
  authDomain: "kiei-451-9051a.firebaseapp.com",
  projectId: "kiei-451-9051a",
  storageBucket: "kiei-451-9051a.appspot.com",
  messagingSenderId: "355313524263",
  appId: "1:355313524263:web:770685261f49bfd567f802"
} // replaced

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase