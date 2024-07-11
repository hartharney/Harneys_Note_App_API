
import { getDoc, doc, setDoc, getFirestore, query, where, collection, getDocs, updateDoc } from 'firebase/firestore';
import {firestore} from '../firebase';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  verified: boolean;
  googleId: string;
  password: string;
}

class UserModel {
  static async findById(id: string): Promise<User | null> {
    const userRef = doc(firestore, 'users', id);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  }

  static async findOne(field: string, value: string): Promise<User | null> {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where(field, '==', value));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  }

  static async create(user: User): Promise<User> {
    const userRef = doc(firestore, 'users', user.id);
    await setDoc(userRef, user);
    return user;
  }

  static async findAll(): Promise<User[]> {
    const usersRef = collection(firestore, 'users');
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  static async update(id: string, user: Partial<User>): Promise<User | null> {
    const userRef = doc(firestore, 'users', id);
    await updateDoc(userRef, user);
    const updatedUserDoc = await getDoc(userRef);
    if (updatedUserDoc.exists()) {
      return { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;
    }
    return null;
  }
}

export default UserModel;
