
import { getDoc, doc, setDoc, getFirestore, query, where, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import {firestore} from '../firebase';
import { User } from './User';


export interface Note {
  id: string;
    title: string;
    content: string;
    owner: User;
    sharedUsers: User[];
}

class NoteModel {
    static async findById(id: string): Promise<Note | null> {
        const noteRef = doc(firestore, 'notes', id);
        const noteDoc = await getDoc(noteRef);
        if (noteDoc.exists()) {
        return { id: noteDoc.id, ...noteDoc.data() } as Note;
        }
        return null;
    }
    
    static async create(note: Note): Promise<Note> {
        const noteRef = doc(firestore, 'notes', note.id);
        await setDoc(noteRef, note);
        return note;
    }
    
    static async findAll(): Promise<Note[]> {
        const notesRef = collection(firestore, 'notes');
        const querySnapshot = await getDocs(notesRef);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
    }
    
    static async update(id: string, note: Partial<Note>): Promise<Note | null> {
        const noteRef = doc(firestore, 'notes', id);
        await updateDoc(noteRef, note);
        const updatedNoteDoc = await getDoc(noteRef);
        if (updatedNoteDoc.exists()) {
        return { id: updatedNoteDoc.id, ...updatedNoteDoc.data() } as Note;
        }
        return null;
    }

    static async delete(id: string): Promise<Note | null> {
        const noteRef = doc(firestore, 'notes', id);
        const noteDoc = await getDoc(noteRef);
        if (noteDoc.exists()) {
            await deleteDoc(noteRef);
            return { id: noteDoc.id, ...noteDoc.data() } as Note;
        }
        return null;
    }
}

export default NoteModel;
