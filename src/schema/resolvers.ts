import { v4 as uuidv4 } from 'uuid';
import {
  option,
  hashPassword,
  bcryptDecode,
  generateToken,
} from '../utils/utils';
import * as Validate from '../utils/validators';
import { AuthenticationError } from 'apollo-server-express';
import  UserModel,{ User } from '../firebase/models/User';
import NoteModel, {Note} from '../firebase/models/Note';
import transporter from '../config/nodemailer';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const resolvers: any = {
  Query: {
    getAllUsers: async (_: any, __: any, { user }: { user: any }) => {
      try {
        if (!user) {
          throw new AuthenticationError('Unauthorized');
        }
        const allUsers = await UserModel.findAll();
        return allUsers;
      } catch (error) {
        console.error('Error retrieving users:', error);
        throw new AuthenticationError('Failed to retrieve users');
      }
    },
    singleUser: async (_: any, { id }: { id: string }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Not Authenticated');
        }
        const singleUser = await UserModel.findById(id);
        if (!singleUser) {
          throw new AuthenticationError('User not found');
        }
        return singleUser;
      } catch (error) {
        console.error('Error retrieving user:', error);
        throw new AuthenticationError('Failed to retrieve user');
      }
    },
    getNotes: async (_: any, __: any, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Not Authenticated');
        }
        const notes = await NoteModel.findAll();
        return notes;
      } catch (error) {
        console.error('Error retrieving notes:', error);
        throw new AuthenticationError('Failed to retrieve notes');
      }
    },
    getNoteById: async (_: any, { id }: { id: string }, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Not Authenticated');
        }
        const note = await NoteModel.findById(id);
        if (!note) {
          throw new AuthenticationError('Note not found');
        }
        return note;
      } catch (error) {
        console.error('Error retrieving note:', error);
        throw new AuthenticationError('Failed to retrieve note');
      }
    },
    getNoteUsers: async (_: any, { noteId }: { noteId: string }, context: any) => {
        try {
            if (!context.user) {
            throw new Error('Not Authenticated');
            }
            const note = await NoteModel.findById(noteId);
            if (!note) {
            throw new AuthenticationError('Note not found');
            }
            const users = note.sharedUsers;
            return users;
        } catch (error) {
            console.error('Error retrieving note users:', error);
            throw new AuthenticationError('Failed to retrieve note users');
        }
    }
  },
  Mutation: {
    registerUser: async (_: any, { input }: { input: any }) => {
      try {
        const validate = Validate.default.registerUserSchema.validate(input, option);

        if (validate.error) {
          throw new AuthenticationError(validate.error.message);
        }

        const exists = await UserModel.findOne('email', input.email);

        if (exists) {
          throw new AuthenticationError('User already exists');
        }

        const otp = generateOtp();
        const mailOptions = {
          from: 'hartharney@gmail.com',
          to: input?.email,
          subject: 'Registration Successful',
          text: `Thank you for registering! Here is your OTP: ${otp}`,
        };

        const newUser: User = {
          id: uuidv4(),
          firstName: input.firstName,
          lastName: input.lastName,
          email: input?.email,
          verified: false,
          imageUrl: input?.imageUrl || '',
          password: await hashPassword(input.password),
          googleId: '',
        };

        const registeredUser = await UserModel.create(newUser);

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Email sent:', info);
          }
        });

        return registeredUser;
      } catch (error) {
        console.error('Error creating user:', error.message);

        if (error.message.includes('duplicate key error')) {
          throw new AuthenticationError('User already exists');
        }

        throw new AuthenticationError(`Failed to create user, ${error.message}`);
      }
    },
    updateUser: async (_: any, { id, input }: any, context: any) => {
      try {
        if (!context.user) {
          throw new Error('Not Authenticated');
        }
        const user = await UserModel.findById(id);
        if (!user) {
          throw new AuthenticationError('User not found');
        }

        const updatedUser = {
          ...user,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          verified: input.verified,
          dateOfBirth: input.dateOfBirth,
          imageUrl: input.imageUrl,
        };

        await UserModel.update(id, updatedUser);

        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw new AuthenticationError('Failed to update user');
      }
    },
    forgotPassword: async (_: any, { email }: { email: string }) => {
        try {
            const user = await UserModel.findOne('email', email);
    
            if (!user) {
            throw new AuthenticationError('User not found');
            }
    
            const otp = generateOtp();
            const mailOptions = {
            from: '',
            to: email,
            subject: 'Password Reset',
            text: `Your OTP is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info);
                }
            });
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new AuthenticationError('Failed to send email');
        }
    },
    resetPassword: async (_: any, { otp, newPassword, confirmNewPassword }: any) => {
        try {
            if (newPassword !== confirmNewPassword) {
            throw new AuthenticationError('Passwords do not match');
            }
    
            const user = await UserModel.findOne('otp', otp);
    
            if (!user) {
            throw new AuthenticationError('User not found');
            }
    
            const hashedPassword = await hashPassword(newPassword);
            await UserModel.update(user.id, { password: hashedPassword });
    
            return true;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw new AuthenticationError('Failed to reset password');
        }
    },
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        const user = await UserModel.findOne('email', email);

        if (!user) {
          throw new AuthenticationError('User not found');
        }

        const isValidPassword = await bcryptDecode(password, user.password);
        if (!isValidPassword) {
          throw new AuthenticationError('Invalid credentials');
        }

        const token = await generateToken(user.email, user.id);
        return { token, user };
      } catch (error) {
        console.error('Error logging in:', error);
        throw new AuthenticationError('Failed to login');
      }
    },
    logout: async (_: any, __: any, { req, res }: { req: any; res: any }) => {
      try {
        if (!req.user) {
          throw new AuthenticationError('Unauthorized');
        }
        req.headers.authorization = null;

        res.clearCookie('token');

        req.session.destroy();

        return true;
      } catch (error) {
        console.error('Error logging out:', error);
        throw new AuthenticationError('Failed to logout');
      }
    },
  addNote: async (_: any, { input }: any, context: any) => {
    try {
      if (!context.user) {
        throw new Error('Not Authenticated');
      }

      const newNote: Note = {
        id: uuidv4(),
        title: input.title,
        content: input.content,
        owner: context.user.id,
        sharedUsers : input.sharedUsers || [],
      };

      const note = await NoteModel.create(newNote);

      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new AuthenticationError('Failed to create note');
    }
  },
    updateNote: async (_: any, { id, input }: any, context: any) => {
        try {
        if (!context.user) {
            throw new Error('Not Authenticated');
        }
    
        const note = await NoteModel.findById(id);
        if (!note) {
            throw new AuthenticationError('Note not found');
        }

        const updatedNote = {
            ...note,
            title: input.title,
            content: input.content,
        };

        await NoteModel.update(id, updatedNote);

        return updatedNote;
        } catch (error) {
        console.error('Error updating note:', error);
        throw new AuthenticationError('Failed to update note');
        }
    },
    deleteNote: async (_: any, { id }: any, context: any) => {
        try {
        if (!context.user) {
            throw new Error('Not Authenticated');
        }
    
        const note = await NoteModel.findById(id);
        if (!note) {
            throw new AuthenticationError('Note not found');
        }
    
        await NoteModel.delete(id);
    
        return note;
        } catch (error) {
        console.error('Error deleting note:', error);
        throw new AuthenticationError('Failed to delete note');
        }
    },
    shareNote: async (_: any, { input }: any, context: any) => {
        try {
        if (!context.user) {
            throw new Error('Not Authenticated');
        }
    
        const note = await NoteModel.findById(input.noteId);
        if (!note) {
            throw new AuthenticationError('Note not found');
        }
    
        const user = await UserModel.findById(input.userId);
        if (!user) {
            throw new AuthenticationError('User not found');
        }
    
        const sharedNote = {
            ...note,
            sharedUsers: [...note.sharedUsers, user],
        };
    
        await NoteModel.update(input.noteId, sharedNote);
    
        return sharedNote;
        } catch (error) {
        console.error('Error sharing note:', error);
        throw new AuthenticationError('Failed to share note');
        }
    },
    unshareNote: async (_: any, { input }: any, context: any) => {
        try {
        if (!context.user) {
            throw new Error('Not Authenticated');
        }
    
        const note = await NoteModel.findById(input.noteId);
        if (!note) {
            throw new AuthenticationError('Note not found');
        }
    
        const user = await UserModel.findById(input.userId);
        if (!user) {
            throw new AuthenticationError('User not found');
        }
    
        const sharedNote = {
            ...note,
            sharedUsers: note.sharedUsers.filter(u => u.id !== user.id),
        };
    
        await NoteModel.update(input.noteId, sharedNote);
    
        return sharedNote;
        } catch (error) {
        console.error('Error unsharing note:', error);
        throw new AuthenticationError('Failed to unshare note');
        }
    },
    addUserToNote: async (_: any, { noteId, userId }: any, context: any) => {
        try {
        if (!context.user) {
            throw new Error('Not Authenticated');
        }
    
        const note = await NoteModel.findById(noteId);
        if (!note) {
            throw new AuthenticationError('Note not found');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new AuthenticationError('User not found');
        }

        const sharedNote = {
            ...note,
            sharedUsers: [...note.sharedUsers, user],
        };

        await NoteModel.update(noteId, sharedNote);

        return sharedNote;
        } catch (error) {
        console.error('Error adding user to note:', error);
        throw new AuthenticationError('Failed to add user to note');
        }   
    }
} 
};
export default resolvers;
