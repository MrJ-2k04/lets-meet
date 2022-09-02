import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyBnx3KV-N8qwLJe41ymmCTfrOA5S6iriIg",
    authDomain: "react-finance-manager.firebaseapp.com",
    projectId: "react-finance-manager",
    storageBucket: "react-finance-manager.appspot.com",
    messagingSenderId: "580219733660",
    appId: "1:580219733660:web:0ebfd639ce3654515f4f59"
  };

const app = initializeApp(firebaseConfig);

const fstore = getFirestore(app)

const auth = getAuth(app)

export {fstore , auth}