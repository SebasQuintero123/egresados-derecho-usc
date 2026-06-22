import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBG3ZQxvBnpvZEiM3As2jFOcFWqNqre6o",
  authDomain: "egresadosderechousc.firebaseapp.com",
  projectId: "egresadosderechousc",
  storageBucket: "egresadosderechousc.appspot.com",
  messagingSenderId: "584207512744",
  appId: "1:584207512744:web:68e04108ae0c909d5b7e9d"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);