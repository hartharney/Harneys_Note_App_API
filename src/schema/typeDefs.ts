import { gql } from 'apollo-server-express';

const typeDefs = gql`
    type Query {
        getAllUsers: [User]
        singleUser(id: String!): User
        getNotes: [Note]
        getNoteById(id: String!): Note
        getNoteUsers(noteId: String!): [User]
        getNoteByUser(userId: String!): [Note]

    }

    input registerUserInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        confirmPassword: String!
    }

    input UpdateUserInput {
        firstName: String
        lastName: String
        email: String
        verified: Boolean
        phone: String
        imageUrl: String
    }

    input forgotPasswordInput {
        email: String!
    }

    input resetPasswordInput {
        otp: String!
        newPassword: String!
        confirmNewPassword: String!
    }

    input addNoteInput {
        title: String!
        content: String!
        sharedUsers: [String]
    }

    input updateNoteInput {
        title: String
        content: String
    }

    input shareNoteInput {
        noteId: String!
        userId: String!
    }

    input unshareNoteInput {
        noteId: String!
        userId: String!
    }

    input deleteNoteInput {
        noteId: String!
    }


    type LoginResponse {
        token: String!
        user: User!
    }

    type Mutation {
        registerUser(input: registerUserInput): User
        updateUser(id: ID!, input: UpdateUserInput): User
        deleteUser(id: ID!): User
        login(email: String!, password: String!): LoginResponse
        forgotPassword(email: String!): Boolean
        resetPassword(otp: String!, newPassword: String!, confirmNewPassword: String!): Boolean
        logout: Boolean
        addNote(input: addNoteInput): Note
        updateNote(id: String!, input: updateNoteInput): Note
        deleteNote: Note
        shareNote: Note
        unshareNote: Note
        addUserToNote(noteId: String!, userId: String!): Note
    }

    type User {
        id: String!
        firstName: String!
        lastName: String!
        fullName: String
        email: String!
        password: String!
        verified: Boolean!
        imageUrl: String
        googleId: String
    }

    type Note {
        id: String!
        title: String!
        content: String!
        owner: User!
        sharedUsers: [User]
    }
 `;

 export default typeDefs;